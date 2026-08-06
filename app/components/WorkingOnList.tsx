"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { currentlyWorkingOn } from "../data";

// Current Projects list with a hover thumbnail that trails the pointer
// (sannisahil.com-style). The image is fixed-position and eased toward the
// cursor with the same exponential lag as the custom cursor, so the two feel
// like one system. pointer-events-none throughout — it's purely decorative.

const TAU_S = 0.08; // slightly laggier than the cursor, so it visibly trails
const MAX_DT = 0.05;
const OFFSET_X = 28; // hangs to the right of the pointer
const THUMB_W = 260;
const THUMB_H = 195;

export default function WorkingOnList() {
  const boxRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const seen = useRef(false);
  const [img, setImg] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, MAX_DT);
      last = now;
      const k = reduce.matches ? 1 : 1 - Math.exp(-dt / TAU_S);
      pos.current.x += (target.current.x - pos.current.x) * k;
      pos.current.y += (target.current.y - pos.current.y) * k;
      if (boxRef.current) {
        boxRef.current.style.transform = `translate3d(${(pos.current.x + OFFSET_X).toFixed(2)}px, ${(pos.current.y - THUMB_H / 2).toFixed(2)}px, 0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    target.current = { x: e.clientX, y: e.clientY };
    if (!seen.current) {
      // Start under the pointer, don't fly in from the corner.
      seen.current = true;
      pos.current = { ...target.current };
    }
  };

  return (
    <div
      className="flex flex-col gap-[28px]"
      onPointerMove={onPointerMove}
      onPointerLeave={() => setVisible(false)}
    >
      {currentlyWorkingOn.map((item) => (
        <div
          key={item.name}
          className="flex flex-col gap-[4px]"
          onPointerEnter={() => {
            setImg(item.thumb ?? null);
            setVisible(Boolean(item.thumb));
          }}
          onPointerLeave={() => setVisible(false)}
        >
          <span className="flex items-center gap-[10px]">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-[family-name:var(--font-body)] font-medium text-[22px] leading-[30px] text-ink u-line hover:text-muted"
              >
                {item.name}
              </a>
            ) : (
              <span className="font-[family-name:var(--font-body)] font-medium text-[22px] leading-[30px] text-ink">
                {item.name}
              </span>
            )}
            <span
              className={`status-dot h-[9px] w-[9px] rounded-full ${
                item.status === "active" ? "bg-[#34a06f]" : "bg-[#e8a33d]"
              }`}
            />
            <span className="sr-only">
              {item.status === "active" ? "working" : "unfinished"}
            </span>
          </span>
          {(() => {
            const body = (
              <>
                <span className="font-[family-name:var(--font-body)] font-light text-[20px] leading-[30px] tracking-[0.03em] text-ink">
                  {item.description}
                </span>
                <span className="font-[family-name:var(--font-body)] font-light text-[18px] leading-[26px] tracking-[0.03em] text-muted">
                  {item.dates}
                </span>
              </>
            );
            return item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                tabIndex={-1}
                className="flex flex-col gap-[4px] no-underline"
              >
                {body}
              </a>
            ) : (
              body
            );
          })()}
        </div>
      ))}

      {/* Floating thumbnail. Kept mounted so the fade-out shows the last image
          instead of popping empty. Below the custom cursor (z-100). */}
      <div
        ref={boxRef}
        aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-[90] overflow-clip rounded-[16px] bg-well transition-[opacity,scale] duration-300 ease-out ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{ width: THUMB_W, height: THUMB_H }}
      >
        {img && (
          <Image
            src={img}
            alt=""
            fill
            sizes={`${THUMB_W}px`}
            className="object-cover object-center"
          />
        )}
      </div>
    </div>
  );
}
