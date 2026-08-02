"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLenis } from "lenis/react";
import { CarouselContext, type CarouselApi, type ColumnConfig } from "./carouselContext";

// Infinite opposed carousel.
//
// One signed `travel` scalar feeds every column; each column applies its own
// `dir`. Both inputs — the slow auto-drift and the accumulated wheel delta —
// write into that one scalar, so "the columns move in opposite directions" is
// structural for both rather than two effects kept in sync.
//
// Position is `travel * dir + offset + bias` wrapped by a floor-modulo into
// [0, period). Copy i+1 of the card set is byte-identical to copy i and sits
// exactly `period` below it, so the wrap maps every on-screen pixel onto an
// identical pixel and the seam is invisible.

const DRIFT_PX_S = 14; // ≈ the old sine's peak speed
const GATE_TAU_S = 0.45; // hover ease-to-stop time constant
const WHEEL_TAU_S = 0.14; // ≈ Lenis lerp:0.1, so both panes feel like one instrument
const MAX_DT = 0.05; // clamp after a tab-hide or a hitch
const LINE_PX = 100 / 6; // matches Lenis's own LINE_HEIGHT
const MAX_STEP_PX = 240; // tames one giant mouse notch
const FLING_MS = 120; // pointer-events off just after a wheel

type Target = {
  el: HTMLElement;
  cfg: ColumnConfig;
  period: number;
  bias: number;
};

export default function CarouselGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const targets = useRef(new Set<Target>());
  const paused = useRef(false);
  const lenis = useLenis();
  // Held in a ref so the main effect (which must not re-run) can reach the
  // current instance without taking it as a dependency.
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const api = useMemo<CarouselApi>(
    () => ({
      register(el, cfg) {
        const target: Target = { el, cfg, period: 0, bias: 0 };
        targets.current.add(target);
        return () => {
          targets.current.delete(target);
          el.style.transform = "";
        };
      },
    }),
    [],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pane = root.closest<HTMLElement>("[data-carousel-pane]") ?? root;

    const wide = window.matchMedia("(min-width: 1024px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const hover = window.matchMedia("(hover: hover)");

    let raf = 0;
    let last = 0;
    let drift = 0;
    let wheel = 0;
    let wheelTarget = 0;
    let gate = 0;
    let flingUntil = 0;
    let flinging = false;
    let running = false;

    const yOf = (t: Target) => {
      const raw = drift + wheel;
      const v = raw * t.cfg.dir + (t.cfg.offset ?? 0) + t.bias;
      return v - t.period * Math.floor(v / t.period);
    };

    const measure = (t: Target) => {
      const gap = parseFloat(getComputedStyle(t.el).rowGap) || 0;
      // Flex omits the trailing gap, so add one back before dividing to get the
      // true layout repeat distance. Requires the track to carry no padding.
      t.period = (t.el.getBoundingClientRect().height + gap) / t.cfg.copies;
    };

    const remeasure = (t: Target) => {
      const before = t.period ? yOf(t) : null;
      measure(t);
      // A changed period would visibly jump the column; hold the pixels still.
      if (before !== null && t.period) t.bias += before - yOf(t);
      if (
        process.env.NODE_ENV !== "production" &&
        t.period &&
        (t.cfg.copies - 1) * t.period < pane.clientHeight
      ) {
        console.warn(
          `[carousel] ${t.cfg.copies} copies × ${t.period.toFixed(0)}px does not cover a ${pane.clientHeight}px pane — increase COPIES.`,
        );
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;

      // Hover pauses the drift only — the wheel bypasses the gate entirely.
      const want = paused.current && hover.matches ? 0 : 1;
      gate += (want - gate) * (1 - Math.exp(-dt / GATE_TAU_S));
      if (!reduce.matches) drift += dt * DRIFT_PX_S * gate;
      wheel +=
        (wheelTarget - wheel) *
        (reduce.matches ? 1 : 1 - Math.exp(-dt / WHEEL_TAU_S));

      for (const t of targets.current) {
        if (!t.period) continue;
        t.el.style.transform = `translate3d(0, ${(-yOf(t)).toFixed(2)}px, 0)`;
      }

      // Cards sliding under a stationary cursor would otherwise fire a burst of
      // pointerover/out and stack overlapping hover transitions.
      const fling = now < flingUntil;
      if (fling !== flinging) {
        flinging = fling;
        root.style.pointerEvents = fling ? "none" : "";
      }

      raf = requestAnimationFrame(frame);
    };

    // React registers `wheel` as passive (react-dom forces it, alongside
    // touchstart/touchmove), so onWheel + preventDefault is a silent no-op.
    // And Lenis's data-lenis-prevent-wheel path returns *before* its own
    // preventDefault, so without this the native page scroll still fires.
    const onWheel = (e: WheelEvent) => {
      if (!running) return;
      if (e.cancelable) e.preventDefault();
      const mult =
        e.deltaMode === 1 ? LINE_PX : e.deltaMode === 2 ? pane.clientHeight : 1;
      const d = e.deltaY * mult;
      wheelTarget += Math.max(-MAX_STEP_PX, Math.min(MAX_STEP_PX, d));
      flingUntil = performance.now() + FLING_MS;
    };

    // The pane is clipped, not scrollable, so focus can't scroll it — but the
    // document still can. Glide the card into view and undo the page jump.
    const onFocusIn = (e: FocusEvent) => {
      if (!running) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      let target: Target | undefined;
      for (const t of targets.current) if (t.el.contains(a)) target = t;
      if (!target?.period) return;

      const saved = window.scrollY;
      const top = a.getBoundingClientRect().top - pane.getBoundingClientRect().top;
      wheelTarget += -(24 - top) * target.cfg.dir;

      const restore = () => lenisRef.current?.scrollTo(saved, { immediate: true });
      restore();
      requestAnimationFrame(restore);
    };

    const observer = new ResizeObserver(() => {
      for (const t of targets.current) remeasure(t);
    });

    const sync = () => {
      const on = wide.matches;
      if (on === running) return;
      running = on;

      pane.toggleAttribute("data-lenis-prevent-wheel", on);

      if (on) {
        for (const t of targets.current) {
          measure(t);
          observer.observe(t.el);
        }
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        observer.disconnect();
        root.style.pointerEvents = "";
        flinging = false;
        for (const t of targets.current) {
          t.el.style.transform = "";
          t.period = 0;
        }
      }
    };

    sync();
    wide.addEventListener("change", sync);
    reduce.addEventListener("change", sync);
    pane.addEventListener("wheel", onWheel, { passive: false });
    pane.addEventListener("focusin", onFocusIn);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      wide.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
      pane.removeEventListener("wheel", onWheel);
      pane.removeEventListener("focusin", onFocusIn);
      pane.removeAttribute("data-lenis-prevent-wheel");
      root.style.pointerEvents = "";
    };
  }, []);

  const resolve = (e: React.PointerEvent) => {
    const node = e.type === "pointerout" ? e.relatedTarget : e.target;
    return node instanceof Element ? node.closest("a") : null;
  };

  return (
    <CarouselContext.Provider value={api}>
      <div
        ref={rootRef}
        className={className}
        onPointerOver={(e) => {
          if (resolve(e)) paused.current = true;
        }}
        onPointerOut={(e) => {
          paused.current = Boolean(resolve(e));
        }}
        onPointerLeave={() => {
          paused.current = false;
        }}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
}
