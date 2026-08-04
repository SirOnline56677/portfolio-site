import Image from "next/image";
import Link from "next/link";
import type { FigureProps, ShellProps, Template } from "./types";

// The case study template.
//
// Chosen from three candidates (in-system / Webflow-alike / mix) that were built
// and compared on real content; this was the mix, and the other two are gone.
// Palette and typography are the portfolio's own tokens, so pages inherit dark
// mode and the custom cursor for free; the sticky section nav came from the
// Webflow-alike candidate.

function Figure({ src, w, h, alt = "", caption }: FigureProps) {
  return (
    <figure className="my-12">
      {/* Capped at the asset's own width so a 375px mobile screenshot isn't
          upscaled to the column width and blurred. Wide assets still fill. */}
      <div
        className="overflow-clip rounded-[24px] bg-well"
        style={{ maxWidth: w }}
      >
        <Image src={src} width={w} height={h} alt={alt} className="h-auto w-full" />
      </div>
      {caption ? (
        <figcaption className="mt-3 font-[family-name:var(--font-label)] text-[12px] leading-[16px] uppercase tracking-[0.03em] text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function Shell({ meta, sections, children }: ShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] gap-16">
      <article className="min-w-0 flex-1">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted hover:text-ink"
        >
          ← Back
        </Link>

        <p className="mt-10 font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted">
          {meta.client}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[48px] leading-[1.05] capitalize text-ink sm:text-[64px] sm:leading-[72px]">
          {meta.title}
        </h1>

        <dl className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 border-y border-divider/40 py-8 sm:grid-cols-4">
          {[
            ["Role", meta.role],
            ["Duration", meta.duration],
            ["Tools", meta.tools.join(", ")],
            ...(meta.team ? [["Team", meta.team]] : []),
            ["Responsibilities", meta.responsibilities],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em] text-muted">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-body)] text-[15px] font-light leading-[22px] text-ink">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">{children}</div>
      </article>

      {/* Active item is --color-ink (#070505); inactive is --nav-dim (#bbbbbb),
          which has its own dark-mode inverse. The first item stands in as active
          until scroll-spy exists. */}
      <nav className="hidden w-[220px] shrink-0 lg:block">
        <ul className="sticky top-12 flex flex-col gap-4">
          {sections.map((s, i) => (
            <li
              key={s}
              className={`font-[family-name:var(--font-display)] text-[16px] leading-[20px] uppercase tracking-[0.03em] transition-colors hover:text-ink ${
                i === 0 ? "text-ink" : "text-[var(--nav-dim)]"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export const caseStudyTemplate: Template = {
  Shell,
  components: {
    // Sections sit directly on the page ground — no raised surface. The 32px
    // horizontal inset and top radius went with it: both existed only to hold
    // text off the edge of a card, so keeping them would leave the copy
    // indented for no visible reason.
    h2: (p) => (
      <h2
        {...p}
        className="mt-14 mb-5 font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted"
      />
    ),
    h3: (p) => (
      <h3
        {...p}
        className="mb-4 font-[family-name:var(--font-project)] text-[24px] leading-[30px] uppercase text-ink"
      />
    ),
    p: (p) => (
      <p
        {...p}
        className="pb-6 font-[family-name:var(--font-body)] text-[18px] font-light leading-[32px] tracking-[0.03em] text-ink"
      />
    ),
    ul: (p) => <ul {...p} className="list-disc pb-6 pl-6" />,
    li: (p) => (
      <li
        {...p}
        className="font-[family-name:var(--font-body)] text-[18px] font-light leading-[30px] text-ink"
      />
    ),
    strong: (p) => <strong {...p} className="font-medium" />,
    Figure,
  },
};
