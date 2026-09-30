"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

const MILESTONES = [25, 50, 75, 100] as const;

// The two things GA4 does not answer on its own.
//
// Reading depth: GA4's built-in scroll event fires once, at 90%, so every
// reader who stopped before that looks identical to one who never scrolled.
// Four milestones separate a reader who bounced at the fold from one who
// finished a case study.
//
// Project clicks: GA4's built-in click tracking only covers links that leave
// the domain. A click on a project card is internal, so nothing records which
// card was chosen — only that a case study page was viewed afterwards, which
// cannot tell a card click apart from an arrival straight from search.
//
// Mounted only when a measurement ID exists and only in production, so the
// listeners below do not run in development or on an unconfigured build.
export default function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    // Per page, not per session: the set resets on navigation, which is why
    // pathname is a dependency rather than a ref.
    const reached = new Set<number>();
    let frame = 0;

    const measure = () => {
      frame = 0;
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      // A page shorter than the viewport has nothing to scroll. It has been
      // read in full by definition, so report that rather than a permanent 0.
      const percent =
        scrollable <= 0 ? 100 : (window.scrollY / scrollable) * 100;

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !reached.has(milestone)) {
          reached.add(milestone);
          sendGAEvent("event", "reading_depth", {
            percent_scrolled: milestone,
            page_path: pathname,
          });
        }
      }
    };

    // Lenis runs in `root` mode, so it drives the real window scroll position
    // and ordinary scroll events still fire. Coalesced to one frame because
    // smooth scrolling emits a great many of them.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };

    // Covers short pages and a restored scroll position on a back navigation,
    // neither of which produces a scroll event.
    measure();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    // One delegated listener rather than a handler per card. The carousel
    // renders every project several times over as loop duplicates, and
    // ProjectCard is a server component with nowhere to hang an onClick.
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tagged = target.closest("[data-track]");
      if (tagged) {
        sendGAEvent("event", "ui_click", {
          control: tagged.getAttribute("data-track"),
          page_path: pathname,
        });
        return;
      }

      const link = target.closest("a[href]");
      const href = link?.getAttribute("href");
      if (!href?.startsWith("/work/")) return;

      sendGAEvent("event", "project_click", {
        project: href.slice("/work/".length),
        // Where the click came from. A card on the homepage and a link at the
        // foot of another case study are different behaviours worth telling
        // apart, and both point at the same destination.
        from: pathname,
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [pathname]);

  return null;
}
