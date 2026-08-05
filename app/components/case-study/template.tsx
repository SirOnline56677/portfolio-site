import Image from "next/image";
import Link from "next/link";
import SectionNav from "./SectionNav";
import { slugify } from "../../work/caseStudies";
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
        <figcaption className="mt-3 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
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
          className="font-[family-name:var(--font-display)] text-section uppercase text-muted hover:text-ink"
        >
          ← Back
        </Link>

        <p className="mt-10 font-[family-name:var(--font-display)] text-section uppercase text-muted">
          {meta.client}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-title capitalize text-ink sm:text-title-lg">
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
              <dt className="font-[family-name:var(--font-label)] text-label-sm uppercase text-muted">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-body)] text-meta font-light text-ink">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-12">{children}</div>
      </article>

      <SectionNav sections={sections} />
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
    // Only h2 gets an id — these are the section nav's scroll targets, and
    // `scroll-mt` keeps a heading clear of the viewport edge when linked to.
    // Sub-heads are deliberately skipped: they're never nav targets, and
    // several repeat verbatim ("Challenge", "Approach", "Dedicated page"),
    // so slugging them would mint duplicate ids.
    h2: (p) => (
      <h2
        {...p}
        id={typeof p.children === "string" ? slugify(p.children) : undefined}
        className="mt-14 mb-5 scroll-mt-12 font-[family-name:var(--font-display)] text-h2 uppercase text-ink"
      />
    ),
    // Two sub-head levels, not one. `###` is the Koulen sub-head that opens a
    // topic; `####` is the smaller sans label used for the recurring
    // Challenge / Approach pairs that repeat inside several sections.
    h3: (p) => (
      <h3
        {...p}
        className="mb-4 font-[family-name:var(--font-display)] text-h3 uppercase text-ink"
      />
    ),
    h4: (p) => (
      <h4
        {...p}
        className="mb-3 font-[family-name:var(--font-body)] text-h4 uppercase text-ink"
      />
    ),
    p: (p) => (
      <p
        {...p}
        className="pb-6 font-[family-name:var(--font-body)] text-body font-light text-ink"
      />
    ),
    ul: (p) => <ul {...p} className="list-disc pb-6 pl-6" />,
    li: (p) => (
      <li
        {...p}
        className="font-[family-name:var(--font-body)] text-body font-light text-ink"
      />
    ),
    strong: (p) => <strong {...p} className="font-medium" />,
    Figure,
  },
};
