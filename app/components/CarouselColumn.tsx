"use client";

import { useEffect, useRef } from "react";
import { useCarousel } from "./carouselContext";

// One looping column track. `dir` sets which way it travels; giving the two
// columns opposite signs is what makes them split apart under both the drift
// and the wheel, since both feed the same signed scalar.
export default function CarouselColumn({
  dir,
  copies,
  offset = 0,
  className,
  children,
}: {
  dir: 1 | -1;
  copies: number;
  offset?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const carousel = useCarousel();

  // Deps are the primitives, not an object literal — otherwise this would
  // unregister and re-register on every render.
  useEffect(() => {
    const el = ref.current;
    if (!el || !carousel) return;
    return carousel.register(el, { dir, copies, offset });
  }, [carousel, dir, copies, offset]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
