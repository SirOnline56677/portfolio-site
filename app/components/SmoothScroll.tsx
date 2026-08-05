"use client";

import { useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

// Smooth scrolling via Lenis (darkroomengineering/lenis).
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server renders the motion-allowed branch; if the reader has asked for
  // reduced motion this corrects on hydration, before any scrolling happens.
  const reduced = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        // Both are animation. Under reduced motion, hand scrolling back to the
        // browser and make anchor jumps instant rather than gliding the reader
        // down a long page they didn't ask to travel.
        smoothWheel: !reduced,
        // `anchors` is deliberately left off. Its click handler doesn't call
        // preventDefault, so the browser's native fragment jump races the
        // animation and lands first — the scroll looks instant. SectionNav
        // takes the click itself and calls lenis.scrollTo directly instead.
      }}
    >
      {children}
    </ReactLenis>
  );
}
