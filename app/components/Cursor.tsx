"use client";

import { useEffect, useRef } from "react";

// Custom pointer, from the Paper file: a 32px circle that expands into a
// labelled pill over a project, showing that project's `kind`.
//
// The fill is pure white on purpose, not the #CECCDE from the Paper file.
// `difference` computes |B − C|, which only equals a true inversion (255 − B)
// when C is white. Since dark mode is built as the exact negative of light mode,
// an exactly-inverting cursor becomes a literal window onto the *other* theme —
// park it on the dark ground rgb(0,6,6) and it shows rgb(255,249,249), the light
// ground, precisely. Any tint shifts the result off the true inverse by that
// tint, so the lavender and the exactness are mutually exclusive.
//
// One fill works in both directions; there is deliberately no theme-conditional
// logic here. Over images it still shows a negative — dark mode leaves photos
// untouched, so the window-onto-the-other-theme property holds for page chrome
// only. That's a property of the idea, not a bug.

const SIZE = 32;
const PAD_X = 16; // matches the Paper pill's 16px inline padding
const TAU_S = 0.055; // trailing lag; small enough to feel attached, not laggy
const MAX_DT = 0.05;

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    // Only where there's a real pointer to replace.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let raf = 0;
    let last = 0;
    let tx = 0;
    let ty = 0; // target
    let x = 0;
    let y = 0; // eased
    let seen = false;
    let running = false;
    let current = "";

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;
      const k = reduce.matches ? 1 : 1 - Math.exp(-dt / TAU_S);
      x += (tx - x) * k;
      y += (ty - y) * k;
      dot.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(frame);
    };

    const setLabel = (text: string) => {
      if (text === current) return;
      current = text;
      if (text) {
        label.textContent = text;
        // Width has to be an explicit number for the transition to animate;
        // `auto` would snap. scrollWidth is exact because the label is nowrap.
        dot.style.width = `${label.scrollWidth + PAD_X * 2}px`;
        dot.dataset.labelled = "true";
      } else {
        dot.style.width = `${SIZE}px`;
        delete dot.dataset.labelled;
        // Keep the text through the collapse so it doesn't pop out early.
        window.setTimeout(() => {
          if (!current) label.textContent = "";
        }, 300);
      }
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        seen = true;
        x = tx;
        y = ty; // start under the pointer, don't fly in from 0,0
        dot.style.opacity = "1";
      }
      const el = e.target instanceof Element ? e.target : null;
      const hit = el?.closest<HTMLElement>("[data-cursor-label]");
      setLabel(hit?.dataset.cursorLabel ?? "");
    };

    const onLeave = () => {
      dot.style.opacity = "0";
      setLabel("");
    };
    const onEnter = () => {
      if (seen) dot.style.opacity = "1";
    };

    const sync = () => {
      const on = fine.matches;
      if (on === running) return;
      running = on;
      document.documentElement.classList.toggle("has-custom-cursor", on);
      if (on) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        document.addEventListener("pointerenter", onEnter);
      } else {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
        document.removeEventListener("pointerenter", onEnter);
        dot.style.opacity = "0";
        seen = false;
      }
    };

    sync();
    fine.addEventListener("change", sync);

    return () => {
      cancelAnimationFrame(raf);
      fine.removeEventListener("change", sync);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        width: SIZE,
        height: SIZE,
        borderRadius: 999,
        backgroundColor: "#FFFFFF",
        mixBlendMode: "difference",
        pointerEvents: "none",
        opacity: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        willChange: "transform, width",
        transition: "width 300ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms linear",
      }}
    >
      <span
        ref={labelRef}
        style={{
          fontFamily: "var(--ff-body), system-ui, sans-serif",
          fontWeight: 500,
          fontSize: 16,
          lineHeight: "23px",
          letterSpacing: "0.03em",
          color: "#000000",
          whiteSpace: "pre",
        }}
      />
    </div>
  );
}
