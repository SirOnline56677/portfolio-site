"use client";

import { useSyncExternalStore } from "react";

// The data-theme attribute on <html> IS the theme state — the blocking script in
// layout.tsx sets it before first paint, the CSS reads it, and DitherBackground
// and thinking-orbs both observe it directly. So this subscribes to the DOM
// rather than keeping a duplicate copy in React state, which would have to be
// synced back and forth and can't be read during SSR.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.dataset.theme === "dark";
// The server always renders light; the script may correct it before paint.
const serverIsDark = () => false;

// Burst reveal: the incoming theme floods the page as a circle from the
// top-left corner. Timings hand-tuned in prototypes/theme-reveal-tuner.html —
// grow to a 110px bubble, hold it a beat, then accelerate out.
const GROW_MS = 150;
const HOLD_MS = 160;
const FLOOD_MS = 340;
const BUBBLE_PX = 110;

function burstReveal(apply: () => void) {
  const vt = document.startViewTransition(apply);
  // If the transition can't start (a second flip mid-flight skips the first),
  // the theme has still been applied — only the animation is lost.
  vt.ready
    .then(() => {
      // Radius to the far corner, so the circle always covers the page. The
      // origin is the viewport corner, not this button: case studies render
      // the toggle elsewhere, and the reveal should feel like the page's move,
      // not the button's.
      const r = Math.hypot(window.innerWidth, window.innerHeight);
      const total = GROW_MS + HOLD_MS + FLOOD_MS;
      document.documentElement.animate(
        {
          clipPath: [
            "circle(0px at 0px 0px)",
            `circle(${BUBBLE_PX}px at 0px 0px)`,
            // A slight swell keeps the hold reading as alive, not stuck.
            `circle(${Math.round(BUBBLE_PX * 1.12)}px at 0px 0px)`,
            `circle(${Math.round(r)}px at 0px 0px)`,
          ],
          offset: [0, GROW_MS / total, (GROW_MS + HOLD_MS) / total, 1],
          easing: [
            "cubic-bezier(0.33, 1, 0.68, 1)",
            "ease-in-out",
            "cubic-bezier(0.55, 0, 0.85, 0.25)",
          ],
        },
        { duration: total, pseudoElement: "::view-transition-new(root)" },
      );
    })
    .catch(() => {});
}

// Inverted ("negative") theme toggle.
//
// Writes data-theme on <html> and nothing else — every colour in the page is a
// token that resolves against that attribute, so this component knows about no
// other component. The dither canvas and thinking-orbs both observe the same
// attribute directly rather than subscribing to React state.
//
// Persisted in sessionStorage so the choice survives navigation — case studies
// are real routes, and without this every click would snap back to the default.
// sessionStorage, not localStorage, on purpose: the choice lasts only for the
// visit, and the next one starts from the time-of-day default again (AM light,
// PM negative — see the boot script in layout.tsx). Still does NOT follow
// prefers-color-scheme: the OS is never consulted.
//
export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, serverIsDark);

  const toggle = () => {
    const next = !dark;
    const apply = () => {
      // Write the attribute only — the store above picks the change straight
      // back up, so there's no second copy of this state to keep in sync.
      document.documentElement.dataset.theme = next ? "dark" : "light";
      try {
        sessionStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // Private mode / storage disabled — the theme just won't persist.
      }
    };

    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      apply();
      return;
    }
    burstReveal(apply);
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggle}
        // The accessible name stays constant — a name that changed with state
        // would announce a moving target. role="switch" + aria-checked already
        // carries the on/off, and the visible label is aria-hidden.
        aria-label="Negative"
        className="group flex w-fit items-center gap-3 outline-offset-4 focus-visible:outline focus-visible:outline-1 focus-visible:outline-current"
      >
        {/* 32px circle — the same motif as the custom cursor. */}
        <span
          aria-hidden
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-divider transition-colors duration-150 group-hover:border-ink motion-reduce:transition-none"
        >
          <span
            className={`h-4 w-4 rounded-full bg-ink transition-transform duration-200 ease-out motion-reduce:transition-none ${
              dark ? "scale-100" : "scale-0"
            }`}
          />
        </span>
        {/* Reads the current mode; on hover (or keyboard focus) it swaps to the
            mode you'd switch to. Both words are stacked in one grid cell so the
            box is always as wide as the longer of the two — otherwise the label
            would resize under the pointer as LIGHT became NEGATIVE. The cursor
            pill deliberately does NOT follow that box; see the fit target
            below.

            data-cursor-fit sits here rather than on the button on purpose:
            `.has-custom-cursor *` sets cursor: none, so the custom cursor is the
            hover affordance, and it should only grow over the word — on the
            button it fired across the circle too. `fit` rather than `label`
            because a pill carrying its own word would sit on top of this one;
            blank, it simply inverts the word underneath. */}
        <span
          aria-hidden
          data-cursor-fit=""
          className="grid justify-items-start font-[family-name:var(--font-display)] text-section uppercase text-ink"
        >
          <span className="col-start-1 row-start-1 transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none">
            {dark ? "Negative" : "Light"}
          </span>
          {/* data-cursor-fit-target: this is the word the pill actually sits
              over, so it's the one the pill is sized and centred on. Without it
              the pill takes the grid cell's width — always the longer of the
              two words — and overhangs whichever word is shorter. */}
          <span
            data-cursor-fit-target=""
            className="col-start-1 row-start-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
          >
            {dark ? "Light" : "Negative"}
          </span>
        </span>
      </button>
      <div className="rule-dashed" />
    </div>
  );
}
