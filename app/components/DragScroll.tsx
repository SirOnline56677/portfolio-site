"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

// A horizontal scroll box you can also grab and drag with a mouse or pen.
// Touch keeps the browser's own panning, which already works and does
// momentum better than we would. The custom cursor reads DRAG while there is
// something to pan, and nothing when the content already fits.
export default function DragScroll({ children, className = "" }: { children: ReactNode; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [canPan, setCanPan] = useState(false);
  const drag = useRef<{ id: number; startX: number; startLeft: number; moved: boolean } | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const check = () => setCanPan(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch" || e.button !== 0 || !canPan) return;
    const el = box.current!;
    drag.current = { id: e.pointerId, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) < 3) return;
    d.moved = true;
    box.current!.scrollLeft = d.startLeft - dx;
  };

  const end = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    box.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      ref={box}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={end}
      onPointerCancel={end}
      data-cursor-label={canPan ? "DRAG" : undefined}
      className={
        "overflow-x-auto [scrollbar-width:thin] " +
        (canPan ? "cursor-grab select-none active:cursor-grabbing " : "") +
        className
      }
    >
      {children}
    </div>
  );
}
