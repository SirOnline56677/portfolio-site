"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { explorationPieces, type ExplorationPiece } from "../data";

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;
/** Pointer travel (px) below which a press still counts as a click, not a drag. */
const CLICK_SLOP = 6;

const ZOOM_BUTTON =
  "grid h-9 min-w-9 place-items-center rounded-full border border-divider px-3 font-[family-name:var(--font-label)] text-[14px] uppercase text-ink transition-colors hover:border-ink";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function worldBounds() {
  const xs = explorationPieces.flatMap((p) => [p.x, p.x + p.w]);
  const ys = explorationPieces.flatMap((p) => [p.y, p.y + p.h]);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, w: maxX - minX, h: maxY - minY };
}

function PieceModal({
  piece,
  onClose,
}: {
  piece: ExplorationPiece;
  onClose: () => void;
}) {
  // A piece with a `coverLabel` is a numbered series whose cover happens to be
  // one of the takes — so the chips run in series order (v1…v5) and we just
  // open on the cover. Without one the cover is the canonical image and leads.
  const cover = { label: piece.coverLabel ?? "Original", image: piece.image };
  const takes = [cover, ...(piece.versions ?? [])];
  if (piece.coverLabel) {
    takes.sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
  }
  const [take, setTake] = useState(() => takes.indexOf(cover));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={piece.title}
      className="fixed inset-0 z-50 grid place-items-center p-4 sm:p-8"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <div
        data-lenis-prevent
        className="relative z-10 flex max-h-full w-full max-w-[960px] flex-col gap-6 overflow-y-auto rounded-[24px] bg-paper p-5 sm:flex-row sm:p-6"
      >
        <div className="relative aspect-square w-full shrink-0 overflow-clip rounded-[16px] bg-well sm:w-[55%]">
          <Image
            key={takes[take].image}
            src={takes[take].image}
            alt={`${piece.title} — ${takes[take].label}`}
            fill
            sizes="(max-width: 640px) 100vw, 55vw"
            className="object-cover object-center"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-[family-name:var(--font-display)] text-[36px] leading-[1.05] capitalize text-ink">
              {piece.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              autoFocus
              className="-mr-1 shrink-0 self-start p-1 font-[family-name:var(--font-label)] text-[18px] leading-none text-ink hover:text-muted"
            >
              ✕
            </button>
          </div>

          <div className="flex items-baseline gap-4">
            <span className="font-[family-name:var(--font-label)] text-[12px] leading-[16px] uppercase text-ink u-line">
              {piece.medium}
            </span>
            {piece.date && (
              <span className="font-[family-name:var(--font-label)] text-[12px] leading-[16px] uppercase text-muted">
                {piece.date}
              </span>
            )}
          </div>

          <p className="font-[family-name:var(--font-body)] font-light text-[18px] leading-[30px] tracking-[0.03em] text-ink">
            {piece.description}
          </p>

          {takes.length > 1 && (
            <div className="mt-auto flex flex-col gap-[11px] pt-4">
              <span className="font-[family-name:var(--font-display)] text-[16px] leading-[19px] tracking-[0.03em] uppercase text-ink">
                Versions
              </span>
              <div className="rule-solid" />
              <div className="flex flex-wrap gap-3 pt-1">
                {takes.map((t, i) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setTake(i)}
                    aria-pressed={i === take}
                    className={`flex flex-col items-center gap-1 ${
                      i === take ? "" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <span
                      className={`relative block h-16 w-16 overflow-clip rounded-[10px] bg-well ${
                        i === take ? "outline outline-1 outline-offset-2 outline-ink" : ""
                      }`}
                    >
                      <Image
                        src={t.image}
                        alt={t.label}
                        fill
                        sizes="64px"
                        className="object-cover object-center"
                      />
                    </span>
                    <span className="font-[family-name:var(--font-label)] text-[10px] uppercase text-ink">
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CanvasGallery() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  // Camera lives in a ref and is written straight to the transform — panning
  // through React state would re-render every image on every pointermove.
  const view = useRef({ x: 0, y: 0, s: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchDist = useRef<number | null>(null);
  const moved = useRef(0);
  const [active, setActive] = useState<ExplorationPiece | null>(null);

  const apply = useCallback(() => {
    const { x, y, s } = view.current;
    if (worldRef.current) {
      worldRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    }
  }, []);

  const zoomAt = useCallback(
    (cx: number, cy: number, factor: number) => {
      const { x, y, s } = view.current;
      const ns = clamp(s * factor, MIN_SCALE, MAX_SCALE);
      const k = ns / s;
      view.current = { x: cx - k * (cx - x), y: cy - k * (cy - y), s: ns };
      apply();
    },
    [apply],
  );

  const fit = useCallback(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const b = worldBounds();
    const pad = 80;
    const s = clamp(
      Math.min((vp.clientWidth - pad * 2) / b.w, (vp.clientHeight - pad * 2) / b.h),
      MIN_SCALE,
      1,
    );
    view.current = {
      s,
      x: vp.clientWidth / 2 - (b.minX + b.w / 2) * s,
      y: vp.clientHeight / 2 - (b.minY + b.h / 2) * s,
    };
    apply();
  }, [apply]);

  useEffect(() => {
    fit();
  }, [fit]);

  // Wheel: two-finger scroll pans, pinch (ctrl/cmd+wheel) zooms at the cursor —
  // Figma conventions. Native listener because React's onWheel is passive and
  // can't preventDefault.
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.01));
      } else {
        view.current.x -= e.deltaX;
        view.current.y -= e.deltaY;
        apply();
      }
    };
    vp.addEventListener("wheel", onWheel, { passive: false });
    return () => vp.removeEventListener("wheel", onWheel);
  }, [apply, zoomAt]);

  // Drag / pinch. Listeners live on window (not pointer capture) so pointerup
  // still targets the piece and its click event survives.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const prev = pointers.current.get(e.pointerId);
      if (!prev) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size === 1) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        moved.current += Math.abs(dx) + Math.abs(dy);
        view.current.x += dx;
        view.current.y += dy;
        apply();
      } else if (pointers.current.size === 2) {
        const [p1, p2] = [...pointers.current.values()];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        if (pinchDist.current) zoomAt(mid.x, mid.y, dist / pinchDist.current);
        pinchDist.current = dist;
        moved.current += CLICK_SLOP + 1;
      }
    };
    const onUp = (e: PointerEvent) => {
      pointers.current.delete(e.pointerId);
      pinchDist.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [apply, zoomAt]);

  const onPointerDown = (e: React.PointerEvent) => {
    // Ignore right-click; let the browser have it.
    if (e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) moved.current = 0;
  };

  const zoomCenter = (factor: number) => {
    const vp = viewportRef.current;
    if (!vp) return;
    zoomAt(vp.clientWidth / 2, vp.clientHeight / 2, factor);
  };

  return (
    <div data-lenis-prevent className="fixed inset-0 overflow-hidden">
      {/* Pannable viewport */}
      <div
        ref={viewportRef}
        onPointerDown={onPointerDown}
        onDoubleClick={(e) => zoomAt(e.clientX, e.clientY, 1.5)}
        className="absolute inset-0 touch-none select-none"
      >
        <div ref={worldRef} className="absolute left-0 top-0 origin-top-left will-change-transform">
          {explorationPieces.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (moved.current <= CLICK_SLOP) setActive(p);
              }}
              className="group absolute"
              style={{ left: p.x, top: p.y, width: p.w, height: p.h }}
            >
              <span
                className="floaty block h-full w-full"
                // Tuned live with a slider and locked at 3× — hence the /3.
                style={{
                  animationDuration: `${(6 + (i % 5)) / 3}s`,
                  animationDelay: `${(-i * 0.9) / 3}s`,
                }}
              >
                {/* Versions fan out behind the cover as a stack of layers. */}
                {(p.versions ?? []).slice(0, 2).map((v, vi) => (
                  <span
                    key={v.label}
                    aria-hidden
                    className="absolute inset-0 overflow-clip rounded-[24px] bg-well"
                    style={{
                      // Deepest layer (vi 0) fans furthest; the one under the
                      // cover (vi 1) stays closer. Direction alternates per
                      // piece so the field doesn't lean one way.
                      transform:
                        vi === 0
                          ? `rotate(${i % 2 ? 8 : -8}deg) translateY(14px) scale(0.94)`
                          : `rotate(${i % 2 ? -4.5 : 4.5}deg) translateY(7px) scale(0.97)`,
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)",
                    }}
                  >
                    <Image
                      src={v.image}
                      alt=""
                      fill
                      draggable={false}
                      sizes="480px"
                      className="object-cover object-center"
                    />
                  </span>
                ))}
                <span
                  className="relative block h-full w-full overflow-clip rounded-[24px] bg-well"
                  style={
                    p.versions?.length
                      ? { boxShadow: "0 10px 30px rgba(0, 0, 0, 0.18)" }
                      : undefined
                  }
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    draggable={false}
                    sizes="480px"
                    className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chrome — sits above the canvas, outside the pan surface */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-6">
        <div className="pointer-events-auto flex flex-col gap-[14px]">
          <Link
            href="/"
            className="w-fit font-[family-name:var(--font-label)] text-[14px] leading-[18px] uppercase text-ink u-line hover:text-muted"
          >
            ← Index
          </Link>
          <h1 className="font-[family-name:var(--font-display)] text-[40px] leading-[1.05] capitalize text-ink">
            Exploration
          </h1>
        </div>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
        <span className="font-[family-name:var(--font-label)] text-[12px] leading-[16px] uppercase text-muted">
          Drag or scroll to move · pinch or ⌘ scroll to zoom · click a piece to open
        </span>
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Written out rather than mapped over an array of closures: collecting
              `zoomCenter`/`fit` into a value during render reads as a ref access
              to the compiler's lint rule. In an onClick prop it's fine. */}
          <button
            type="button"
            onClick={() => zoomCenter(0.8)}
            aria-label="Zoom out"
            className={ZOOM_BUTTON}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => zoomCenter(1.25)}
            aria-label="Zoom in"
            className={ZOOM_BUTTON}
          >
            +
          </button>
          <button
            type="button"
            onClick={() => fit()}
            aria-label="Reset view"
            className={ZOOM_BUTTON}
          >
            Reset
          </button>
        </div>
      </footer>

      {active && <PieceModal piece={active} onClose={() => setActive(null)} />}
    </div>
  );
}
