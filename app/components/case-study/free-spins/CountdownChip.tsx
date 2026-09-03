"use client";

import { useEffect, useState } from "react";

// The campaign card's live expiry clock. Ticks down from just under five
// hours while mounted; reduced motion holds the starting time.
const START = 4 * 3600 + 59 * 60 + 58;

export default function CountdownChip() {
  const [left, setLeft] = useState(START);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setLeft((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(left / 3600);
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");

  return (
    <span
      className="inline-flex items-center gap-[8px] rounded-[8px] border px-[12px] py-[8px] text-[15px] font-bold tracking-[0.04em]"
      style={{
        background: "rgba(242,194,28,0.14)",
        borderColor: "#f2c21c",
        color: "#f2c21c",
        fontFamily: "ui-monospace, monospace",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span aria-hidden>⏳</span> {h}:{m}:{s} left to spin
    </span>
  );
}
