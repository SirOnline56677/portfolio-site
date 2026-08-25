"use client";

import { useEffect, useRef } from "react";
import type { ProblemSpaceProps } from "./types";

// Problem Space cards: ident-geometry illustrations, animated per the
// approved motion prototype. Savings and Eclipse play once when the row
// scrolls into view and rest on their final frames; Drift ping-pongs
// forever — the lonely disc leaves and comes back, never resetting.
// The clock only runs while the row is on screen. Reduced motion renders
// the final states with no animation.
//
// Server HTML carries the final compositions, so pre-JS paint and no-JS
// readers see finished art; hydration rewinds and plays on first sight.
// Structure strokes use theme tokens and invert; the red, green, and the
// cream coin faces are fixed brand colors, per the Mindmap/Matrix rule.
const RED = "#E8472A";
const GREEN = "#2E7D52";
const CREAM = "#EFEAE0";
const PLAY = 2400;
const STAGGER = 400;
const stroke = {
  fill: "none",
  stroke: "var(--color-ink)",
  strokeOpacity: 0.75,
  strokeWidth: 1.5,
} as const;
const thread = {
  stroke: "var(--color-ink)",
  strokeOpacity: 0.4,
  strokeWidth: 1,
} as const;

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

// coins: [cx, restingCy] column by column bottom-up; red one last
const COINS: [number, number][] = [];
for (const [cx, n] of [
  [52, 6],
  [104, 5],
  [156, 3],
  [208, 2],
] as [number, number][]) {
  for (let i = 0; i < n; i++) COINS.push([cx, 160 - i * 24]);
}
COINS.push([260, 160]);
const DROP = 380;
const GAP = 95;

function Coin({ cx, cy, red }: { cx: number; cy: number; red?: boolean }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={12} fill={red ? RED : GREEN} />
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill={CREAM}
        style={{ font: "700 13px system-ui, sans-serif" }}
      >
        $
      </text>
    </g>
  );
}

// drift ping-pong timeline
const D_HOLD1 = 500;
const D_OUT = 1500;
const D_HOLD2 = 900;
const D_BACK = 1500;
const D_CYCLE = D_HOLD1 + D_OUT + D_HOLD2 + D_BACK;
const CLUSTER: [number, number][] = [
  [76, 64],
  [152, 52],
  [128, 96],
  [86, 140],
];
const LINKS: [number, number][] = [
  [0, 2],
  [2, 3],
  [0, 3],
  [2, 1],
  [0, 1],
];

export default function ProblemSpace({ items }: ProblemSpaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const savRef = useRef<SVGSVGElement>(null);
  const ecInkRef = useRef<SVGCircleElement>(null);
  const drRedRef = useRef<SVGCircleElement>(null);
  const drLineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const coinEls = Array.from(savRef.current!.querySelectorAll("g"));

    const tickSavings = (t: number) => {
      coinEls.forEach((el, i) => {
        const [cx, rest] = COINS[i];
        const p = clamp01((t - i * GAP) / DROP);
        let y;
        if (p === 0) y = -20;
        else if (p < 0.72) y = lerp(-20, rest, (p / 0.72) ** 2);
        else {
          const b = (p - 0.72) / 0.28;
          y = rest - 7 * Math.sin(b * Math.PI) * (1 - b);
        }
        el.setAttribute("transform", `translate(${cx} ${y})`);
        el.setAttribute("opacity", p === 0 ? "0" : "1");
      });
    };
    const tickEclipse = (t: number) => {
      const a = clamp01(t / 1000);
      const b = clamp01((t - 1150) / 1100);
      ecInkRef.current!.setAttribute("cx", String(lerp(300, 132, easeOut(a))));
      ecInkRef.current!.setAttribute("r", String(lerp(18, 62, easeInOut(b))));
    };
    const tickDrift = (elapsed: number) => {
      const t = elapsed % D_CYCLE;
      let p;
      if (t < D_HOLD1) p = 0;
      else if (t < D_HOLD1 + D_OUT) p = easeInOut((t - D_HOLD1) / D_OUT);
      else if (t < D_HOLD1 + D_OUT + D_HOLD2) p = 1;
      else p = easeInOut(1 - (t - D_HOLD1 - D_OUT - D_HOLD2) / D_BACK);
      const x = lerp(160, 252, p);
      const y = lerp(124, 157, p);
      drRedRef.current!.setAttribute("cx", String(x));
      drRedRef.current!.setAttribute("cy", String(y));
      drLineRef.current!.setAttribute("x2", String(x));
      drLineRef.current!.setAttribute("y2", String(y));
    };

    // Elapsed accumulates only while on screen, so scrolling away pauses
    // the loop and coming back resumes it rather than restarting it.
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let running = false;

    const frame = (now: number) => {
      elapsed += now - last;
      last = now;
      tickSavings(Math.min(elapsed, PLAY));
      tickEclipse(Math.min(Math.max(elapsed - STAGGER, 0), PLAY));
      tickDrift(elapsed);
      raf = requestAnimationFrame(frame);
    };

    tickSavings(0);
    tickEclipse(0);
    tickDrift(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="my-12 grid grid-cols-1 gap-x-9 gap-y-12 md:grid-cols-3">
      {items.map((it) => (
        <div key={it.art} className="flex flex-col gap-4">
          {it.art === "savings" && (
            <svg ref={savRef} viewBox="0 0 300 200" className="w-full" aria-hidden>
              <line x1={24} y1={172} x2={276} y2={172} {...thread} />
              {COINS.map(([cx, cy], i) => (
                <Coin key={i} cx={cx} cy={cy} red={i === COINS.length - 1} />
              ))}
            </svg>
          )}
          {it.art === "eclipse" && (
            <svg viewBox="0 0 300 200" className="w-full" aria-hidden>
              <circle cx={132} cy={100} r={62} {...stroke} />
              <circle ref={ecInkRef} cx={132} cy={100} r={62} fill="var(--color-ink)" />
            </svg>
          )}
          {it.art === "drift" && (
            <svg viewBox="0 0 300 200" className="w-full" aria-hidden>
              {LINKS.map(([a, b]) => (
                <line
                  key={`${a}-${b}`}
                  x1={CLUSTER[a][0]}
                  y1={CLUSTER[a][1]}
                  x2={CLUSTER[b][0]}
                  y2={CLUSTER[b][1]}
                  {...thread}
                />
              ))}
              <line ref={drLineRef} x1={128} y1={96} x2={252} y2={157} {...thread} strokeDasharray="5 7" />
              {CLUSTER.map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={15} {...stroke} fill="var(--color-paper)" />
              ))}
              <circle ref={drRedRef} cx={252} cy={157} r={15} fill={RED} />
            </svg>
          )}
          <h4 className="font-[family-name:var(--font-body)] text-h4 uppercase text-ink">
            {it.title}
          </h4>
          <p className="font-[family-name:var(--font-body)] text-meta font-light text-muted">
            {it.copy}
          </p>
        </div>
      ))}
    </div>
  );
}
