"use client";

import { ThinkingOrb } from "thinking-orbs";

// `thinking-orbs` uses hooks + canvas but ships no "use client" directive, so it
// can't be imported straight into a Server Component. This is the wrapper the
// Next docs prescribe for third-party client-only components.
//
// The package only ships two tuned presets, 64 and 20 — `size` is a lookup key,
// not a scale factor, so 24 would throw. We render the small preset and scale it
// 20 -> 24 in CSS to match the SVG globe this replaced. The canvas backing store
// is 20 * devicePixelRatio, so at 1.2x it stays sharp on any retina display.
export default function ThinkingOrbIcon() {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center">
      <ThinkingOrb
        state="searching"
        size={64}
        speed={0.3}
        aria-hidden
        style={{ transform: "scale(0.5)" }}
      />
    </span>
  );
}
