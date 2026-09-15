"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { LotCardProps, LotFlag } from "./types";

// Lot card (Wrist Check infield research): the watch you bought, written up
// the way the trade writes a lot. Lot number and hammer price up top, the
// document frame beside a condition-report spec list with the two findings
// flagged (bracelet not original, watch verified), provenance in one line and
// the documents as thumbnails. The thumbnails are a picker: click one and the
// frame crossfades to it, so the eBay page and the appraisal can be looked at
// rather than just recognised, and the frame itself opens the document in a
// lightbox (a native <dialog>, so Escape, focus and the backdrop are the
// platform's; data-lenis-prevent keeps the page from scrolling under it).
// A fixed Wrist Check brand surface (paper/ink/primaries) in both themes,
// like PriceRuler and CapabilityBoard.
const PAPER = "#EFEDE6";
const INK = "#141414";
const RED = "#E23B22";
const BLUE = "#2657E0";
const GREEN = "#2E7D52";
const MAT = "#cfcbc0";
const mono = "ui-monospace, 'SF Mono', Menlo, monospace";
const inkAt = (pct: number) => `color-mix(in srgb, ${INK} ${pct}%, transparent)`;
const FLAG: Record<LotFlag["tone"], string> = { red: RED, green: GREEN, blue: BLUE };

export default function LotCard({ lot, title, subtitle, hammer, specs, provenance, figs }: LotCardProps) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const shown = figs[active] ?? figs[0];

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <article
      aria-label={`Lot ${lot}: ${title}`}
      className="my-12 grid gap-[22px] rounded-[20px] px-7 pb-6 pt-7"
      style={{ background: PAPER, color: INK }}
    >
      <header
        className="grid grid-cols-2 items-end gap-x-[18px] gap-y-3 pb-4 md:grid-cols-[auto_1fr_auto]"
        style={{ borderBottom: `1px solid ${inkAt(25)}` }}
      >
        <div className="font-[family-name:var(--font-display)] text-[64px] leading-[0.9]">
          <span className="mb-1.5 block font-[family-name:var(--font-label)] text-[11px] tracking-[0.14em]" style={{ color: inkAt(60) }}>
            Lot
          </span>
          {lot}
        </div>
        <h3 className="col-span-2 font-[family-name:var(--font-display)] text-[26px] uppercase leading-none md:col-span-1">
          {title}
          <span className="mt-1.5 block font-[family-name:var(--font-body)] text-[14px] font-light normal-case tracking-[0.02em]" style={{ color: inkAt(70) }}>
            {subtitle}
          </span>
        </h3>
        <div className="col-start-2 row-start-1 text-right md:col-start-auto md:row-start-auto">
          <div className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em]" style={{ color: inkAt(60) }}>
            {hammer.label}
          </div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-[34px] leading-none tabular-nums">{hammer.amount}</div>
          <div className="mt-1 text-[11px] tracking-[0.06em]" style={{ fontFamily: mono, color: inkAt(65) }}>
            {hammer.note}
          </div>
        </div>
      </header>

      <div className="grid items-start gap-[26px] md:grid-cols-[300px_1fr]">
        <figure className="m-0">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={`Enlarge: ${shown.alt}`}
            className="relative block w-full cursor-zoom-in overflow-clip rounded-[10px] p-0 text-left"
          >
          <div className="relative aspect-[4/3] md:aspect-square" style={{ background: MAT }}>
            {figs.map((f, i) => (
              <Image
                key={f.src}
                src={f.src}
                width={f.w}
                height={f.h}
                alt={i === active ? f.alt : ""}
                sizes="(min-width: 768px) 300px, 100vw"
                className={`absolute inset-0 h-full w-full motion-safe:transition-opacity motion-safe:duration-300 ${
                  f.fit === "contain" ? "object-contain" : "object-cover"
                } ${i === active ? "opacity-100" : "opacity-0"}`}
                aria-hidden={i !== active}
              />
            ))}
          </div>
          </button>
          <figcaption className="mt-2 flex justify-between gap-3 text-[10px] uppercase tracking-[0.08em]" style={{ fontFamily: mono, color: inkAt(60) }}>
            <span aria-live="polite">{shown.label}</span>
            <span aria-hidden>Click to enlarge</span>
          </figcaption>
        </figure>
        <ul className="m-0 list-none p-0">
          {specs.map((row, i) => (
            <li
              key={row.k}
              className="grid grid-cols-[112px_1fr] gap-3 py-[7px] text-[14px] leading-[1.35] md:grid-cols-[128px_1fr]"
              style={{ borderBottom: i < specs.length - 1 ? `1px dashed ${inkAt(28)}` : undefined }}
            >
              <span className="pt-0.5 text-[11px] uppercase tracking-[0.08em]" style={{ fontFamily: mono, color: inkAt(62) }}>
                {row.k}
              </span>
              <span className="font-[family-name:var(--font-body)] font-light">
                {row.strong ? <b className="font-medium">{row.strong}</b> : null}
                {row.strong && row.v ? " " : null}
                {row.v}
                {row.flag ? (
                  <span
                    className="ml-2 inline-block rounded-full px-2 py-px align-[1px] text-[10px] uppercase tracking-[0.08em] text-white"
                    style={{ fontFamily: mono, background: FLAG[row.flag.tone] }}
                  >
                    {row.flag.label}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <footer className="grid items-center gap-[18px] pt-4 md:grid-cols-[1fr_auto]" style={{ borderTop: `1px solid ${inkAt(25)}` }}>
        <p className="max-w-[52ch] font-[family-name:var(--font-body)] text-[13.5px] font-light leading-[1.5]">
          <b className="font-medium">Provenance.</b> {provenance}
        </p>
        <div className="flex gap-2" role="group" aria-label="Documents">
          {figs.map((f, i) => {
            const on = i === active;
            return (
              <button
                key={f.src}
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                className={`w-16 text-left transition-opacity ${on ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
              >
                <span
                  className="block aspect-square overflow-clip rounded-[4px]"
                  style={{ background: MAT, boxShadow: on ? `0 0 0 2px ${INK}` : undefined }}
                >
                  <Image src={f.src} width={f.w} height={f.h} alt="" sizes="64px" className="h-full w-full object-cover" style={{ objectPosition: f.focus }} />
                </span>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.06em]" style={{ fontFamily: mono, color: on ? INK : inkAt(60) }}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
      </footer>

      {/* Lightbox. Rendered inside the card so it inherits nothing it
          shouldn't: the dialog itself is transparent and the image sits on
          the platform backdrop. Clicking the backdrop (the dialog element
          itself, outside its content) closes it. */}
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        data-lenis-prevent
        className="m-auto max-h-none max-w-none border-0 bg-transparent p-0 outline-none backdrop:bg-black/85"
      >
        <div className="flex flex-col items-center gap-3 p-4">
          {/* Sized in CSS, not by the img's own attributes: with width:auto a
              responsive <Image> renders its chosen srcset candidate at that
              candidate's size, which on a 2x screen is smaller than the frame
              it was opened from. The width is the largest that keeps the
              whole document on screen: the viewport, 84vh at the image's own
              ratio, or twice the source (any more than that is just blur). */}
          <Image
            src={shown.src}
            width={shown.w}
            height={shown.h}
            alt={shown.alt}
            sizes="92vw"
            className="h-auto rounded-[6px]"
            style={{
              width: `min(92vw, ${shown.w * 2}px, calc(84vh * ${(shown.w / shown.h).toFixed(4)}))`,
              background: MAT,
            }}
          />
          <div className="flex w-full items-center justify-between gap-4">
            <span className="text-[11px] uppercase tracking-[0.1em]" style={{ fontFamily: mono, color: "#fff" }}>
              {shown.label}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.1em]"
              style={{ fontFamily: mono, color: INK, background: PAPER }}
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </article>
  );
}
