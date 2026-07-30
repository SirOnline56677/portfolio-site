"use client";

import { useEffect, useRef } from "react";

// Parallax a column relative to the viewport center, so columns given different
// speeds visibly drift past each other (loloagency-style) without runaway
// offsets — displacement is bounded and symmetric around center.
// Driven by the Lenis-smoothed window scroll. Off on mobile + reduced-motion.
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
    let lastY = 0;

    const update = () => {
      if (!desktop.matches || reduce.matches) {
        el.style.transform = "";
        lastY = 0;
        return;
      }
      const rect = el.getBoundingClientRect();
      // Remove our own translate to get the untransformed position (translate
      // doesn't affect height, so this is exact — no feedback loop).
      const trueTop = rect.top - lastY;
      const center = trueTop + rect.height / 2;
      const y = (center - window.innerHeight / 2) * speed;
      lastY = y;
      el.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    desktop.addEventListener("change", update);
    // Re-run as images load and change column height.
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      desktop.removeEventListener("change", update);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
