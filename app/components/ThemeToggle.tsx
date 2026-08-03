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
            would resize under the pointer as LIGHT became NEGATIVE.

            data-cursor-fit sits here rather than on the button on purpose:
            `.has-custom-cursor *` sets cursor: none, so the custom cursor is the
            hover affordance, and it should only grow over the word — on the
            button it fired across the circle too. `fit` rather than `label`
            because a pill carrying its own word would sit on top of this one;
            blank, it simply inverts the word underneath. */}
        <span
          aria-hidden
          data-cursor-fit=""
          className="grid justify-items-start font-[family-name:var(--font-display)] text-[20px] leading-[23px] tracking-[0.03em] uppercase text-ink"
        >
          <span className="col-start-1 row-start-1 transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none">
            {dark ? "Negative" : "Light"}
          </span>
          <span className="col-start-1 row-start-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
            {dark ? "Light" : "Negative"}
          </span>
        </span>
      </button>
      <div className="rule-dashed" />
    </div>
  );
}
