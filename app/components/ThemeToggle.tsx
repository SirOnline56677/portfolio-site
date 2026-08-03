"use client";

import { useState } from "react";

// Inverted ("negative") theme toggle.
//
// Writes data-theme on <html> and nothing else — every colour in the page is a
// token that resolves against that attribute, so this component knows about no
// other component. The dither canvas and thinking-orbs both observe the same
// attribute directly rather than subscribing to React state.
//
// Deliberately not persisted and deliberately not following prefers-color-scheme:
// the page always opens light and only a click changes it.
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    // Imperative on purpose: <html> is server-rendered and React never
    // re-renders it, so there's nothing to fight over.
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        onClick={toggle}
        // The accessible name stays constant — a name that changed with state
        // would announce a moving target.
        aria-label="Negative"
        // `.has-custom-cursor *` sets cursor: none, so hover can't come from the
        // pointer. Reuse the site's own mechanism instead: the custom cursor
        // expands into a labelled pill over this, same as a project card.
        data-cursor-label={dark ? "REVERT" : "INVERT"}
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
        <span
          aria-hidden
          className="font-[family-name:var(--font-display)] text-[20px] leading-[23px] tracking-[0.03em] uppercase text-ink"
        >
          Negative
        </span>
      </button>
      <div className="rule-dashed" />
    </div>
  );
}
