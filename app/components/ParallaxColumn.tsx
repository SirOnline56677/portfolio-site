"use client";

import { useEffect, useRef } from "react";

// Translates its content vertically by scrollY * speed, so two columns given
// different speeds drift past each other as you scroll (loloagency-style).
// Driven by the smoothed window scroll from Lenis. Disabled on mobile
// (single column) and under prefers-reduced-motion.
export default function ParallaxColumn({
  speed = 0,
  className,
  children,
}: {
  speed?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const desktop = window.matchMedia("(min-width: 640px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;

    const update = () => {
      if (!desktop.matches || reduce.matches) {
        el.style.transform = "";
        return;
      }
      const y = window.scrollY * speed;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", update);
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
