"use client";

import { useEffect, useRef, useState } from "react";

// The address under the contact line, with a one-tap copy. The "email" word in
// the sentence is a plain mailto, which opens whatever mail app the visitor
// has; this is for the ones who would rather paste it somewhere themselves.
// Shows the address so they can see what they just copied.
export default function CopyEmail({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context, permissions): select the address
      // instead so a manual copy is one keystroke away.
      const range = document.createRange();
      const el = document.getElementById("contact-email");
      if (el) {
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
    }
  }

  return (
    <span className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.12em] text-muted">
      <span id="contact-email" className="normal-case tracking-normal">
        {address}
      </span>
      <button
        type="button"
        onClick={copy}
        className="u-line cursor-pointer text-muted hover:text-ink focus-visible:text-ink"
        aria-live="polite"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}
