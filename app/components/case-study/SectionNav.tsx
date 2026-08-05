"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { type Section, sectionId, sectionLabel } from "../../work/caseStudies";

/** Distance below the viewport top at which a heading counts as "current". */
const ACTIVE_LINE = 120;
/** Gap left above a heading when you jump to it. */
const SCROLL_OFFSET = -32;

/**
 * The sticky section nav on a case study.
 *
 * Split out of template.tsx purely to hold the client boundary — the article
 * and shell stay server-rendered, and only this list ships JS.
 *
 * Scrolling is driven through Lenis explicitly rather than through its built-in
 * `anchors` option. That option looked like the obvious fit, but its click
 * handler never calls preventDefault (see `onClick` in lenis.mjs), so the
 * browser's own instant jump to the fragment races the animation and wins —
 * you land on the heading with no scroll at all. Taking the click ourselves is
 * the only way to actually get the animated scroll.
 */
export default function SectionNav({ sections }: { sections: Section[] }) {
  const lenis = useLenis();
  const [activeId, setActiveId] = useState(() =>
    sections.length ? sectionId(sections[0]) : ""
  );

  // Document-absolute offset of each target heading. Cached rather than
  // measured per scroll frame: reading getBoundingClientRect on every heading
  // each tick would thrash layout on a page this long.
  const tops = useRef<{ id: string; top: number }[]>([]);

  const measure = useCallback(() => {
    tops.current = sections
      .map(sectionId)
      .map((id) => {
        const el = document.getElementById(id);
        return el
          ? { id, top: el.getBoundingClientRect().top + window.scrollY }
          : null;
      })
      .filter((x): x is { id: string; top: number } => x !== null);
  }, [sections]);

  const sync = useCallback(() => {
    const list = tops.current;
    if (!list.length) return;

    // A short final section can never reach the active line, so it would never
    // light up. At the bottom of the page it's unambiguously the current one.
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 2;
    if (atBottom) {
      setActiveId(list[list.length - 1].id);
      return;
    }

    // Last heading to have crossed the line — so a long section stays lit while
    // you read the middle of it, where no heading is on screen at all.
    const y = window.scrollY + ACTIVE_LINE;
    let current = list[0].id;
    for (const h of list) {
      if (h.top <= y) current = h.id;
      else break;
    }
    setActiveId(current);
  }, []);

  useEffect(() => {
    measure();
    sync();

    // Images load late and shift every heading below them, so re-measure when
    // the document resizes, not just the window.
    const ro = new ResizeObserver(() => {
      measure();
      sync();
    });
    ro.observe(document.body);

    // Native scroll as well as the Lenis tick below. Lenis covers the smooth
    // path, but its rAF loop is suspended in a background tab and would stop
    // entirely if smooth scrolling were ever switched off — this keeps the
    // highlight honest either way, and it's only a rect-free comparison.
    window.addEventListener("scroll", sync, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", sync);
    };
  }, [measure, sync]);

  // Lenis drives window scroll in root mode, so this fires on its rAF ticks and
  // covers wheel, keyboard, and our own programmatic scrolls alike.
  useLenis(sync, [sync]);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Let modified clicks (new tab, etc.) behave normally.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    setActiveId(id);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (lenis) {
      lenis.scrollTo(`#${id}`, { offset: SCROLL_OFFSET, immediate: reduced });
    } else {
      // Lenis not mounted (or disabled): fall back to the platform.
      document
        .getElementById(id)
        ?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    }

    // Keep the deep link without letting the browser jump to it.
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <nav className="hidden w-[220px] shrink-0 lg:block">
      <ul className="sticky top-12 flex flex-col gap-4">
        {sections.map((s) => {
          const id = sectionId(s);
          const active = id === activeId;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={(e) => onClick(e, id)}
                aria-current={active ? "true" : undefined}
                className={`block font-[family-name:var(--font-display)] text-nav uppercase tracking-[0.03em] transition-colors hover:text-ink ${
                  active ? "text-ink" : "text-[var(--nav-dim)]"
                }`}
              >
                {sectionLabel(s)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
