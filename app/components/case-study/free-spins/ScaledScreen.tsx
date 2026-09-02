"use client";

import { useEffect, useRef } from "react";

// Renders a screen built at its native Figma pixel size and scales it to
// whatever width the layout gives it — exact design coordinates transfer 1:1
// (the wb-leaderboards tile precedent). `shownH` crops the screen: both
// source frames are far taller than any sane device frame.
export default function ScaledScreen({
  designW,
  shownH,
  viewW,
  children,
}: {
  designW: number;
  shownH: number;
  /** Visible window width in design px — crops the right side when < designW. */
  viewW?: number;
  children: React.ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const vw = viewW ?? designW;

  useEffect(() => {
    const el = outerRef.current!;
    const ro = new ResizeObserver(() => {
      el.style.setProperty("--fs-scale", String(el.clientWidth / vw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [vw]);

  return (
    <div
      ref={outerRef}
      className="relative overflow-clip"
      style={{ aspectRatio: `${vw} / ${shownH}` }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: designW,
          height: shownH,
          overflow: "clip",
          transform: "scale(var(--fs-scale, 1))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
