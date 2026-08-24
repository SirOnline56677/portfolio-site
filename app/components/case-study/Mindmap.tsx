"use client";

import { useEffect, useRef } from "react";
import type { MindmapProps } from "./types";

// Interactive brainstorm map. The ideas drift, bounce off each other and the
// canvas edges, and a soft spring pulls each one home so the composition
// never dissolves; drag flings them through the field. Edges are drawn from
// live positions, so a moved idea keeps its threads. No card of its own — it
// sits on the page ground, so pills use theme tokens and invert with it; only
// the spark pills keep the fixed ident red, like other brand elements.
// Physics runs outside React: one render, then direct style/attr updates per
// frame. prefers-reduced-motion gets a still map (drag only, no fling).
const W = 900;
const H = 560;
const RED = "#E8472A";
const CREAM = "#EFEAE0";
const SPRING = 0.0016; // pull toward home
const RESTITUTION = 0.9; // energy kept on bounce
const MAX_SPEED = 0.9; // logical px / frame
const DRIFT = 0.25; // initial ambient speed
const inkAt = (pct: number) => `color-mix(in srgb, var(--color-ink) ${pct}%, transparent)`;

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number;
  hy: number;
  rx: number;
  ry: number;
};

export default function Mindmap({ sub, nodes, edges }: MindmapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Record<string, HTMLDivElement | null>>({});
  const lineEls = useRef<(SVGLineElement | null)[]>([]);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bodies: Record<string, Body> = {};
    nodes.forEach((n, i) => {
      const el = nodeEls.current[n.id]!;
      const rect = el.getBoundingClientRect();
      const scale = W / canvas.getBoundingClientRect().width;
      // Deterministic per-index launch angle; speed is what matters, not where.
      const a = (i * 2.399963) % (Math.PI * 2); // golden angle — spreads directions
      bodies[n.id] = {
        x: n.x,
        y: n.y,
        vx: reduced ? 0 : Math.cos(a) * DRIFT,
        vy: reduced ? 0 : Math.sin(a) * DRIFT,
        hx: n.x,
        hy: n.y,
        rx: (rect.width * scale) / 2 + 4,
        ry: (rect.height * scale) / 2 + 4,
      };
    });

    const ids = nodes.map((n) => n.id);

    const paint = () => {
      for (const id of ids) {
        const b = bodies[id];
        const el = nodeEls.current[id];
        if (el) {
          el.style.left = `${(b.x / W) * 100}%`;
          el.style.top = `${(b.y / H) * 100}%`;
        }
      }
      edges.forEach(([a, c], i) => {
        const l = lineEls.current[i];
        if (l) {
          l.setAttribute("x1", String(bodies[a].x));
          l.setAttribute("y1", String(bodies[a].y));
          l.setAttribute("x2", String(bodies[c].x));
          l.setAttribute("y2", String(bodies[c].y));
        }
      });
    };

    const step = () => {
      for (const id of ids) {
        if (drag.current?.id === id) continue;
        const b = bodies[id];
        b.vx += (b.hx - b.x) * SPRING;
        b.vy += (b.hy - b.y) * SPRING;
        const s = Math.hypot(b.vx, b.vy);
        if (s > MAX_SPEED) {
          b.vx *= MAX_SPEED / s;
          b.vy *= MAX_SPEED / s;
        }
        b.x += b.vx;
        b.y += b.vy;
        // walls
        if (b.x < b.rx) (b.x = b.rx), (b.vx = Math.abs(b.vx) * RESTITUTION);
        if (b.x > W - b.rx) (b.x = W - b.rx), (b.vx = -Math.abs(b.vx) * RESTITUTION);
        if (b.y < b.ry) (b.y = b.ry), (b.vy = Math.abs(b.vy) * RESTITUTION);
        if (b.y > H - b.ry) (b.y = H - b.ry), (b.vy = -Math.abs(b.vy) * RESTITUTION);
      }
      // pairwise bounce — pills as ellipses, compared in normalized space
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          const A = bodies[ids[i]];
          const B = bodies[ids[j]];
          const sx = A.rx + B.rx;
          const sy = A.ry + B.ry;
          const nx = (B.x - A.x) / sx;
          const ny = (B.y - A.y) / sy;
          const d = Math.hypot(nx, ny) || 0.001;
          if (d >= 1) continue;
          const ux = nx / d;
          const uy = ny / d;
          const push = (1 - d) * 0.5;
          const aHeld = drag.current?.id === ids[i];
          const bHeld = drag.current?.id === ids[j];
          if (!aHeld) (A.x -= ux * push * sx), (A.y -= uy * push * sy);
          if (!bHeld) (B.x += ux * push * sx), (B.y += uy * push * sy);
          // exchange the velocity component along the contact normal
          const rvx = B.vx - A.vx;
          const rvy = B.vy - A.vy;
          const along = rvx * ux + rvy * uy;
          if (along < 0) {
            const imp = along * RESTITUTION;
            if (!aHeld) (A.vx += ux * imp * 0.5), (A.vy += uy * imp * 0.5);
            if (!bHeld) (B.vx -= ux * imp * 0.5), (B.vy -= uy * imp * 0.5);
          }
        }
      }
      paint();
    };

    let raf = 0;
    const loop = () => {
      step();
      raf = requestAnimationFrame(loop);
    };
    paint();
    if (!reduced) raf = requestAnimationFrame(loop);

    const toLogical = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
    };

    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;
      if (!el) return;
      const id = el.dataset.nodeId!;
      const p = toLogical(e);
      drag.current = { id, dx: bodies[id].x - p.x, dy: bodies[id].y - p.y };
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current) return;
      const { id, dx, dy } = drag.current;
      const b = bodies[id];
      const p = toLogical(e);
      const nx = Math.min(W - b.rx, Math.max(b.rx, p.x + dx));
      const ny = Math.min(H - b.ry, Math.max(b.ry, p.y + dy));
      // pointer motion becomes the fling velocity on release
      b.vx = reduced ? 0 : Math.max(-MAX_SPEED * 2, Math.min(MAX_SPEED * 2, nx - b.x));
      b.vy = reduced ? 0 : Math.max(-MAX_SPEED * 2, Math.min(MAX_SPEED * 2, ny - b.y));
      b.x = nx;
      b.y = ny;
      // a held pill re-homes where you leave it
      b.hx = nx;
      b.hy = ny;
      if (reduced) paint();
    };
    const onUp = () => (drag.current = null);

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [nodes, edges]);

  return (
    <section aria-label="Brainstorm mindmap" className="my-12">
      <p className="mb-6 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.12em] text-muted">
        {sub}
      </p>

      <div
        ref={canvasRef}
        className="relative w-full touch-none select-none"
        style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {edges.map(([a, b], i) => (
            <line
              key={`${a}-${b}`}
              ref={(el) => {
                lineEls.current[i] = el;
              }}
              stroke="var(--color-ink)"
              strokeOpacity={0.3}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {nodes.map((n) => {
          const kind = n.kind ?? "idea";
          return (
            <div
              key={n.id}
              data-node-id={n.id}
              ref={(el) => {
                nodeEls.current[n.id] = el;
              }}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full border px-[1.1em] py-[0.45em] text-center leading-[1.25] active:cursor-grabbing"
              style={{
                left: `${(n.x / W) * 100}%`,
                top: `${(n.y / H) * 100}%`,
                maxWidth: "11em",
                fontSize: "clamp(8px, 1.5cqw, 13px)",
                fontFamily: "var(--font-body)",
                ...(kind === "root"
                  ? {
                      background: "var(--color-ink)",
                      borderColor: "var(--color-ink)",
                      color: "var(--color-paper)",
                      fontWeight: 500,
                    }
                  : kind === "spark"
                    ? { background: RED, borderColor: RED, color: CREAM, fontWeight: 700 }
                    : {
                        background: "var(--color-paper)",
                        borderColor: inkAt(45),
                        color: inkAt(88),
                      }),
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
