"use client";

import { useState } from "react";
import type { CapabilityBoardProps } from "./types";

// "Who does what" capability board (Wrist Check competitor analysis): rows of
// circle marks on a fixed 64px column pitch, primaries group bars, and a
// highlighted row for the product's empty-combo punchline. Board surfaces are
// the Wrist Check brand (paper/ink/primaries) and stay fixed in both themes,
// like the other case studies' brand components. Info notes hover on desktop
// and tap-toggle on touch.
const PAPER = "#EFEDE6";
const INK = "#141414";
const RED = "#E23B22";
const YELLOW = "#F0B60B";
const NAME_W = 172;
const DISC = 28;
const PITCH = 64;

const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

function Disc({ on, hot }: { on: boolean; hot?: boolean }) {
  return (
    <span
      className="inline-flex flex-none items-center justify-center rounded-full font-bold"
      style={{
        boxSizing: "border-box",
        width: DISC,
        height: DISC,
        marginRight: PITCH - DISC,
        fontFamily: mono,
        fontSize: 13,
        ...(on
          ? {
              background: hot ? RED : INK,
              color: PAPER,
              boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
            }
          : {
              border: `1.5px dashed color-mix(in srgb, ${INK} 35%, transparent)`,
              color: `color-mix(in srgb, ${INK} 40%, transparent)`,
            }),
      }}
      aria-label={on ? "offered" : "not offered"}
    >
      {on ? "✓" : "–"}
    </span>
  );
}

function Info({ note }: { note: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative ml-2 inline-flex cursor-help items-center justify-center rounded-full font-bold"
      style={{
        boxSizing: "border-box",
        width: 14,
        height: 14,
        border: `1.5px solid color-mix(in srgb, ${INK} 45%, transparent)`,
        color: `color-mix(in srgb, ${INK} 55%, transparent)`,
        fontFamily: mono,
        fontSize: 9,
        verticalAlign: 1,
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen((v) => !v)}
    >
      i
      {open ? (
        <span
          className="absolute z-10 rounded-[6px] font-normal"
          style={{
            left: 22,
            top: "50%",
            transform: "translateY(-50%)",
            background: INK,
            color: PAPER,
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: "0.05em",
            lineHeight: 1.6,
            padding: "8px 11px",
            width: 210,
            whiteSpace: "normal",
            boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
          }}
        >
          {note}
        </span>
      ) : null}
    </span>
  );
}

export default function CapabilityBoard({ title, byline, groups, columns, rows, highlight, punchline }: CapabilityBoardProps) {
  return (
    <div
      className="my-12 overflow-x-auto rounded-[20px] px-7 py-6"
      style={{ background: PAPER, color: INK }}
    >
      <div style={{ minWidth: NAME_W + columns.length * PITCH + 190 }}>
        {/* merged header row: title · group bars · byline, one level */}
        <div className="mb-1 flex items-end">
          <span className="flex-none font-[family-name:var(--font-body)] text-[16px] font-medium tracking-[-0.02em]" style={{ width: NAME_W, fontWeight: 800 }}>
            {title}
          </span>
          {groups.map((g) => (
            <span key={g.label} className="flex flex-col gap-[5px]" style={{ width: g.span * PITCH }}>
              <span className="rounded-[2px]" style={{ height: 5, width: g.span * PITCH - PITCH + DISC, background: g.color }} />
              <span className="font-bold" style={{ fontFamily: mono, fontSize: 8.5, letterSpacing: "0.18em", color: g.labelColor ?? g.color }}>
                {g.label}
              </span>
            </span>
          ))}
          <span className="ml-auto" style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.16em", opacity: 0.6 }}>
            {byline}
          </span>
        </div>
        {/* column heads */}
        <div className="mb-2 mt-2 flex" style={{ marginLeft: NAME_W }}>
          {columns.map((c) => (
            <span key={c} style={{ width: PITCH, fontFamily: mono, fontSize: 8, letterSpacing: "0.08em", opacity: 0.6, lineHeight: 1.4, whiteSpace: "pre-line" }}>
              {c}
            </span>
          ))}
        </div>
        {rows.map((r) => (
          <div
            key={r.name}
            className="flex items-center py-[6px]"
            style={{ borderTop: `1px solid color-mix(in srgb, ${INK} 14%, transparent)` }}
          >
            <span className="flex-none text-[12px]" style={{ width: NAME_W, fontWeight: 800, letterSpacing: "0.01em" }}>
              {r.name}
              {r.note ? <Info note={r.note} /> : null}
            </span>
            <span className="flex">
              {r.caps.map((v, i) => (
                <Disc key={i} on={v} />
              ))}
            </span>
          </div>
        ))}
        {/* highlighted product row */}
        <div className="mt-[10px] flex items-center rounded-[8px] px-[10px] py-[9px]" style={{ background: YELLOW, marginLeft: -10, marginRight: -10 }}>
          <span className="flex-none text-[12px]" style={{ width: NAME_W, fontWeight: 800 }}>
            {highlight.name}
          </span>
          <span className="flex">
            {highlight.caps.map((v, i) => (
              <Disc key={i} on={v} hot />
            ))}
          </span>
        </div>
        <p className="mt-4 font-bold" style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", color: RED }}>
          {punchline}
        </p>
      </div>
    </div>
  );
}
