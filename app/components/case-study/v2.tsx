import Image from "next/image";
import Link from "next/link";
import type { FigureProps, ShellProps, Template } from "./types";

// Variant 2 — Webflow-alike.
// Reproduces the current stephenaguila.com treatment: neutral grey section
// cards, a sticky right-hand section nav, Istok-ish sans throughout. Uses
// literal greys rather than tokens on purpose — this variant is meant to look
// like the old site, so it deliberately does NOT invert with dark mode.

function Figure({ src, w, h, alt = "", caption }: FigureProps) {
  return (
    <figure className="my-10" style={{ maxWidth: w }}>
      {/* Capped at the asset's own width so small mobile screenshots aren't
          upscaled and blurred. */}
      <Image src={src} width={w} height={h} alt={alt} className="h-auto w-full rounded-lg" />
      {caption ? (
        <figcaption className="mt-2 text-[13px] leading-[18px] text-[#666]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Shell({ meta, sections, children }: ShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] gap-16 text-[#1a1a1a]">
      <article className="min-w-0 flex-1">
        <Link href="/" className="text-[14px] uppercase tracking-wide text-[#666] hover:text-black">
          ← Home
        </Link>

        <p className="mt-10 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#888]">
          {meta.client}
        </p>
        <h1 className="mt-2 text-[44px] font-semibold leading-[1.15] text-black">
          {meta.title}
        </h1>

        <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 border-y border-[#e5e5e5] py-8 sm:grid-cols-4">
          {[
            ["Role", meta.role],
            ["Duration", meta.duration],
            ["Tools", meta.tools.join(", ")],
            ...(meta.team ? [["Team", meta.team]] : []),
            ["Responsibilities", meta.responsibilities],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#888]">
                {label}
              </dt>
              <dd className="mt-1 text-[15px] leading-[22px] text-[#333]">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">{children}</div>
      </article>

      {/* Sticky section nav, as on the current site. Hidden below lg, where
          there isn't room for a second column. */}
      <nav className="hidden w-[220px] shrink-0 lg:block">
        <ul className="sticky top-12 flex flex-col gap-4">
          {sections.map((s) => (
            <li
              key={s}
              className="text-[14px] font-semibold leading-[18px] text-[#bbb] transition-colors hover:text-[#333]"
            >
              {s}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export const v2: Template = {
  Shell,
  components: {
    // Each h2 opens a new grey card. The cards are drawn by the heading's own
    // negative-margin padding rather than by wrapping elements, because MDX
    // gives a flat stream of siblings with nowhere to hang a wrapper.
    h2: (p) => (
      <h2
        {...p}
        className="mt-14 mb-5 rounded-t-lg bg-[#f5f5f5] px-8 pt-8 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#888]"
      />
    ),
    h3: (p) => (
      <h3 {...p} className="mb-3 bg-[#f5f5f5] px-8 text-[22px] font-bold uppercase text-black" />
    ),
    p: (p) => (
      <p {...p} className="bg-[#f5f5f5] px-8 pb-6 text-[16px] leading-[26px] text-[#333]" />
    ),
    ul: (p) => <ul {...p} className="list-disc bg-[#f5f5f5] px-8 pb-6 pl-14" />,
    li: (p) => <li {...p} className="text-[16px] leading-[26px] text-[#333]" />,
    strong: (p) => <strong {...p} className="font-semibold text-black" />,
    Figure,
  },
};
