import Image from "next/image";
import Link from "next/link";
import CompareCards from "./CompareCards";
import Matrix from "./Matrix";
import Mindmap from "./Mindmap";
import Persona from "./Persona";
import ProblemSpace from "./ProblemSpace";
import SectionNav from "./SectionNav";
import { slugify } from "../../work/caseStudies";
import type { FigureProps, RoadmapProps, ShellProps, Template } from "./types";

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

// Timeline on the page ground, like the section's siblings. Structure text
// and the track use theme tokens and invert; only the two-disc nodes keep
// the fixed ident red/blue, per the Mindmap/Matrix rule.
const RM = { red: "#E8472A", blue: "#2B2A6A" };

function RoadmapNode() {
  return (
    <span className="relative block h-[14px] w-[22px]" aria-hidden>
      <span
        className="absolute left-[8px] top-[5px] h-[14px] w-[14px] rounded-full"
        style={{ background: RM.blue }}
      />
      <span
        className="absolute left-0 top-0 h-[14px] w-[14px] rounded-full"
        style={{ background: RM.red }}
      />
    </span>
  );
}

function Roadmap({ sub, phases }: RoadmapProps) {
  return (
    <section
      aria-label="Project roadmap"
      className="mx-auto mb-12 max-w-[30rem] md:mx-0 md:max-w-none"
    >
      <p className="mb-7 font-[family-name:var(--font-label)] text-label font-bold uppercase tracking-[0.12em] text-muted md:mb-9">
        {sub}
      </p>

      <ol
        className="relative grid list-none grid-cols-1 gap-y-7 p-0 md:grid-cols-5 md:gap-x-5 md:gap-y-0"
        style={{ counterReset: "none" }}
      >
        {/* track: vertical spine when stacked, horizontal line through the
            node row at md+ (top offset = week+dates lines + node margin). */}
        <span
          aria-hidden
          className="absolute bottom-2 left-[6px] top-2 w-px md:bottom-auto md:left-0 md:right-0 md:top-[59px] md:h-px md:w-auto"
          style={{ background: "color-mix(in srgb, var(--color-ink) 30%, transparent)" }}
        />

        {phases.map((ph) => (
          <li
            key={ph.week}
            className="relative grid grid-cols-[22px_1fr] gap-x-4 md:block"
          >
            <span className="pt-px md:hidden">
              <RoadmapNode />
            </span>
            <span className="flex items-baseline gap-3 md:block">
              <span className="block font-[family-name:var(--font-label)] text-label font-bold uppercase tracking-[0.14em] text-ink">
                {ph.week}
              </span>
              <span className="block font-[family-name:var(--font-label)] text-label uppercase text-muted md:mt-1">
                {ph.dates}
              </span>
            </span>
            <span className="hidden md:mb-4 md:mt-[18px] md:block">
              <RoadmapNode />
            </span>
            <span className="col-start-2 mt-1 block font-[family-name:var(--font-display)] text-h3 uppercase leading-[1.1] text-ink md:mt-0">
              {ph.name}
            </span>
            <ul className="col-start-2 m-0 mt-2 list-none p-0">
              {ph.items.map((item) => (
                <li
                  key={item}
                  className="font-[family-name:var(--font-body)] text-[13px] font-light leading-[1.7] text-muted"
                >
                  {item}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
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
    CompareCards,
    Figure,
    Matrix,
    Mindmap,
    Persona,
    ProblemSpace,
    Roadmap,
  },
};
