import type { CSSProperties } from "react";
import type { ResearchTrackProps, ResearchStepKind } from "./types";

// Research track (Wrist Check infield research): the five-day window as a
// blue run of steps, then the two dated events past its end, won in red and
// verified in green. The steps inside the window aren't dated in the copy,
// so they read as a sequence, not as Day 1 to Day 5. Sits on the page ground
// and follows the theme; only the three marker colours are fixed brand.
// A row at md+ (one column per step), a spine down the left below it.
const BLUE = "#2657E0";
const RED = "#E23B22";
const GREEN = "#2E7D52";
const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

const MARK: Record<ResearchStepKind, string> = { window: BLUE, event: RED, ok: GREEN };

export default function ResearchTrack({ windowLabel, steps }: ResearchTrackProps) {
  const cols = { "--cols": steps.length } as CSSProperties;
  return (
    <section aria-label="Research timeline" className="relative my-12">
      <p className="mb-3 font-[family-name:var(--font-label)] text-[10px] uppercase tracking-[0.14em] md:absolute md:-top-5 md:left-0 md:mb-0" style={{ color: BLUE }}>
        {windowLabel}
      </p>
      <ol
        className="m-0 grid list-none gap-y-4 p-0 md:gap-x-2.5 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={cols}
      >
        {steps.map((s, i) => {
          const next = steps[i + 1];
          const inWindow = s.kind === "window";
          // The window bar runs through the window and stops at the first
          // event: a segment is blue only when both of its ends are inside.
          const segBlue = inWindow && next?.kind === "window";
          const last = i === steps.length - 1;
          return (
            <li key={`${s.when}-${i}`} className="relative min-w-0 pl-5 md:pl-0 md:pt-5">
              <span
                aria-hidden
                className="absolute left-0 top-[5px] h-[9px] w-[9px] rounded-full md:top-[3px]"
                style={{ background: MARK[s.kind] }}
              />
              {!last ? (
                <span
                  aria-hidden
                  className="absolute left-[4px] top-[16px] bottom-[-16px] w-px md:left-[9px] md:right-[-10px] md:top-[7px] md:bottom-auto md:h-px md:w-auto"
                  style={{ background: segBlue ? BLUE : "var(--color-divider)" }}
                />
              ) : null}
              <span className="block text-[10px] uppercase tracking-[0.08em] text-muted" style={{ fontFamily: mono }}>
                {s.when}
              </span>
              <p className="mt-1.5 font-[family-name:var(--font-body)] text-[13.5px] font-light leading-[1.4] text-ink">
                {inWindow ? (
                  <b className="font-medium">{s.lead}</b>
                ) : (
                  <b className="mb-0.5 block font-[family-name:var(--font-display)] text-[18px] font-normal uppercase leading-none tracking-[0.02em]">
                    {s.lead}
                  </b>
                )}{" "}
                {s.text}
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
