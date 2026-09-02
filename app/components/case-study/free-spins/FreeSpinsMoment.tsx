"use client";

import { useEffect, useRef } from "react";
import type { FreeSpinsMomentProps } from "../types";
import DevicePair from "./DevicePair";
import ScaledScreen from "./ScaledScreen";
import { AccountMobile, DesktopScreen, SpinsMobile } from "./screens";
import { easeInOut, easeOut, seg } from "./wb";

// One narrated product moment from the Bonus Spins redesign, shown on a
// desktop + phone pair.
//
// story="account": static — the account menu open with Bonus Spins marked
//   and the Free Spins tile counting 28, exactly as designed.
// story="spins": the motion mocked in the Figma file (node 3652-1666): a 2s
//   loop where each card's progress ring draws in — staggered Starburst →
//   Allstar → NetEnt — and each count crossfades to +1 spin as its ring
//   lands, then the loop resets.
//
// Server HTML carries the design's static state, so pre-JS paint, no-JS
// readers and reduced motion see the real design; hydration starts the loop
// on first sight, and scrolling away pauses it (ProblemSpace lifecycle).
export default function FreeSpinsMoment({ story, caption }: FreeSpinsMomentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Both stories animate their spin rings (the account block's desktop
    // copy shows the same cards); everything else stays static.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current!;
    const q = (k: string) =>
      Array.from(root.querySelectorAll<HTMLElement | SVGElement>(`[data-fs="${k}"]`));
    const win = (el: Element): [number, number] => {
      const [a, b] = ((el as HTMLElement).dataset.w ?? "0,1").split(",");
      return [Number(a), Number(b)];
    };
    const rings = q("ring") as SVGCircleElement[];
    const countsA = q("count-a") as HTMLElement[];
    const countsB = q("count-b") as HTMLElement[];
    const fsCounts = q("fs-count") as HTMLElement[];
    // each used spin drains the profile's Free Spins balance: 28 → 25
    const SPEND = [0.7, 0.8, 0.9];

    const CYCLE = 2000;
    const tick = (t: number) => {
      const p = (t % CYCLE) / CYCLE;
      const spent = SPEND.filter((th) => p >= th).length;
      fsCounts.forEach((el) => (el.textContent = String(28 - spent)));
      rings.forEach((el) => {
        const [a, b] = win(el);
        const draw = easeOut(seg(p, a, b - a));
        el.setAttribute("stroke-dashoffset", String(Number(el.dataset.c) * (1 - draw)));
      });
      countsA.forEach((el) => {
        const [a, b] = win(el);
        el.style.opacity = String(1 - easeInOut(seg(p, a, b - a)));
      });
      countsB.forEach((el) => {
        const [a, b] = win(el);
        el.style.opacity = String(easeInOut(seg(p, a, b - a)));
      });
    };

    // Elapsed accumulates only while on screen — scrolling away pauses the
    // loop, coming back resumes it rather than restarting.
    let elapsed = 0;
    let last = 0;
    let raf = 0;
    let running = false;

    const frame = (now: number) => {
      elapsed += now - last;
      last = now;
      tick(elapsed);
      raf = requestAnimationFrame(frame);
    };

    tick(0);

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
  }, [story]);

  return (
    <div ref={rootRef}>
      {story === "account" ? (
        <DevicePair
          desktop={
            <ScaledScreen designW={1512} shownH={982}>
              <DesktopScreen />
            </ScaledScreen>
          }
          mobile={
            <ScaledScreen designW={428} shownH={926}>
              <AccountMobile />
            </ScaledScreen>
          }
        />
      ) : (
        <DevicePair
          desktop={
            <ScaledScreen designW={1512} shownH={982}>
              <DesktopScreen />
            </ScaledScreen>
          }
          mobile={
            <ScaledScreen designW={428} shownH={926}>
              <SpinsMobile />
            </ScaledScreen>
          }
        />
      )}
      {caption ? (
        <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
