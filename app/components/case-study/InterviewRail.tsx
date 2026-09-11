"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import type { InterviewRailProps, InterviewTone } from "./types";

// Interview rail (Wrist Check user interviews): the portrait pins on the left
// while the three interviews flow on the right at the study's normal body
// size. Whoever you're reading takes over the frame and their row lights up;
// the rows also click to jump. Each person keeps one Wrist Check primary by
// role (buyer red, trader blue, seller yellow), fixed in both themes like the
// other brand components; everything else sits on the page ground and follows
// the theme. On narrow screens the rail collapses to a pinned strip of names
// with small round portraits, since the frame has no room.
const TONE: Record<InterviewTone, string> = {
  red: "#E23B22",
  blue: "#2657E0",
  yellow: "#F0B60B",
};
const FRAME_BG = "#d9d6cc";
const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

/** Fraction of the viewport height below the top at which a block counts as current. */
const ACTIVE_LINE = 0.35;
/** Gap left above a block when you jump to it. */
const SCROLL_OFFSET = -24;

// Always a flex/grid item, so it sets no display of its own: a `hidden`
// passed in from the rail must win, and Tailwind orders utilities by its own
// sort, not by position in the class string.
function Disc({ tone, dim, className = "" }: { tone: InterviewTone; dim?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`h-[10px] w-[10px] flex-none rounded-full transition-[transform,opacity] duration-300 ${
        dim ? "scale-[0.7] opacity-35" : ""
      } ${className}`}
      style={{ background: TONE[tone] }}
    />
  );
}

function Tag({ children, tone, muted }: { children: React.ReactNode; tone?: InterviewTone; muted?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] ${
        muted ? "text-muted" : "text-ink"
      }`}
      style={{ fontFamily: mono }}
    >
      {tone ? <Disc tone={tone} /> : null}
      {children}
    </span>
  );
}

export default function InterviewRail({ interviews }: InterviewRailProps) {
  const lenis = useLenis();
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const blocks = useRef<(HTMLElement | null)[]>([]);

  // Document-absolute top of each block, cached like SectionNav does rather
  // than measured per scroll frame.
  const tops = useRef<number[]>([]);

  const measure = useCallback(() => {
    tops.current = blocks.current.map((el) =>
      el ? el.getBoundingClientRect().top + window.scrollY : Infinity
    );
  }, []);

  const sync = useCallback(() => {
    const list = tops.current;
    if (!list.length) return;

    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) {
      setActive(list.length - 1);
      return;
    }

    // Last block to have crossed the line, so a long interview stays lit while
    // you're in the middle of it.
    const y = window.scrollY + window.innerHeight * ACTIVE_LINE;
    let current = 0;
    list.forEach((top, i) => {
      if (top <= y) current = i;
    });
    setActive(current);
  }, []);

  useEffect(() => {
    measure();
    sync();
    const ro = new ResizeObserver(() => {
      measure();
      sync();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", sync, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", sync);
    };
  }, [measure, sync]);

  useLenis(sync, [sync]);

  const jump = (i: number) => {
    const el = blocks.current[i];
    if (!el) return;
    setActive(i);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenis) {
      lenis.scrollTo(el, { offset: SCROLL_OFFSET, immediate: reduced });
    } else {
      el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    }
  };

  const tone = interviews[active]?.tone ?? "red";

  return (
    <section
      ref={root}
      aria-label="User interviews"
      className="grid items-start gap-6 md:grid-cols-[260px_minmax(0,1fr)] md:gap-14"
    >
      {/* Rail: sticky beside the copy at md+, a pinned strip above it below. */}
      <aside
        className="sticky top-0 z-10 -mx-6 flex flex-col gap-3.5 border-b border-divider/30 bg-paper/85 px-6 py-2.5 backdrop-blur md:top-5 md:mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none"
        aria-label="Interviewees"
      >
        <div
          aria-hidden
          className="relative hidden aspect-[4/5] overflow-clip rounded-[4px] md:block"
          style={{ background: FRAME_BG }}
        >
          {interviews.map((iv, i) => (
            <Image
              key={iv.name}
              src={iv.img.src}
              width={iv.img.w}
              height={iv.img.h}
              alt=""
              sizes="260px"
              className={`absolute inset-0 h-full w-full object-cover object-[50%_18%] motion-safe:transition-opacity motion-safe:duration-500 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          {/* Role-coloured ring, drawn inside so it survives the overflow clip. */}
          <span
            className="pointer-events-none absolute inset-0 rounded-[inherit] motion-safe:transition-shadow motion-safe:duration-300"
            style={{ boxShadow: `inset 0 0 0 2px ${TONE[tone]}` }}
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] md:flex-col md:gap-0 md:overflow-visible md:border-t md:border-divider/30">
          {interviews.map((iv, i) => {
            const on = i === active;
            return (
              <button
                key={iv.name}
                type="button"
                onClick={() => jump(i)}
                aria-current={on ? "true" : undefined}
                className={`flex flex-none items-center gap-2 whitespace-nowrap rounded-full px-2 py-1.5 text-left transition-colors md:grid md:grid-cols-[10px_1fr_auto] md:gap-3 md:rounded-none md:border-b md:border-divider/30 md:bg-transparent md:px-0.5 md:py-3 hover:text-ink ${
                  on ? "bg-ink/8 text-ink md:bg-transparent" : "text-muted"
                }`}
              >
                <Disc tone={iv.tone} dim={!on} className="hidden md:block" />
                <span className="relative h-[22px] w-[22px] flex-none overflow-clip rounded-full md:hidden" style={{ background: FRAME_BG }}>
                  <Image
                    src={iv.img.src}
                    width={iv.img.w}
                    height={iv.img.h}
                    alt=""
                    sizes="24px"
                    className="h-full w-full object-cover object-[50%_18%]"
                  />
                </span>
                <span className="font-[family-name:var(--font-display)] text-[17px] uppercase leading-none md:text-[20px]">
                  {iv.name}
                </span>
                <span
                  className="hidden text-[11px] uppercase tracking-[0.1em] md:inline"
                  style={{ fontFamily: mono }}
                >
                  {iv.role}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="flex flex-col">
        {interviews.map((iv, i) => (
          <article
            key={iv.name}
            ref={(el) => {
              blocks.current[i] = el;
            }}
            className={`scroll-mt-6 pb-11 pt-2 ${
              i > 0 ? "border-t border-dashed border-divider pt-9" : ""
            }`}
          >
            <div className="mb-3.5 flex items-center gap-[18px]">
              <Tag tone={iv.tone}>{iv.role}</Tag>
              <Tag muted>{iv.label}</Tag>
            </div>
            <h3 className="mb-3 font-[family-name:var(--font-display)] text-[2rem] uppercase leading-none text-ink">
              {iv.name}
            </h3>
            <p className="mb-[18px] max-w-[46ch] font-[family-name:var(--font-body)] text-[1.125rem] font-medium leading-[1.45] tracking-[0.01em] text-ink">
              {iv.stance}
              <span style={{ color: TONE.red }}>.</span>
            </p>
            <div className="flex max-w-[62ch] flex-col gap-4">
              {iv.body.map((para) => (
                <p
                  key={para}
                  className="font-[family-name:var(--font-body)] text-body font-light text-ink"
                >
                  {para}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
