import Image from "next/image";
import Link from "next/link";
import type { FigureProps, ShellProps, Template } from "./types";

// Variant 1 — in-system.
// Renders case studies in the portfolio's own language: Koulen section labels,
// Paralucent body, paper-and-ink palette. Inherits dark mode and the custom
// cursor for free, because every colour is a token.

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

function Shell({ meta, children }: ShellProps) {
  return (
    <article className="mx-auto w-full max-w-[820px]">
      <Link
        href="/"
        className="font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted hover:text-ink"
      >
        ← Back
      </Link>

      <p className="mt-12 font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted">
        {meta.client}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-[48px] leading-[1.05] capitalize text-ink sm:text-[64px] sm:leading-[72px]">
        {meta.title}
      </h1>

      {/* Metadata, as dashed rows — the same band rhythm as the left column's
          "Designing in / Building with". */}
      <dl className="mt-12 flex flex-col gap-4">
        {[
          ["Role", meta.role],
          ["Duration", meta.duration],
          ["Tools", meta.tools.join(", ")],
          ...(meta.team ? [["Team", meta.team]] : []),
          ["Responsibilities", meta.responsibilities],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-4">
            <div className="rule-dashed" />
            <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
              <dt className="font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-ink">
                {label}
              </dt>
              <dd className="max-w-[520px] font-[family-name:var(--font-body)] text-[18px] font-light leading-[28px] text-muted">
                {value}
              </dd>
            </div>
          </div>
        ))}
        <div className="rule-dashed" />
      </dl>

      <div className="mt-16">{children}</div>
    </article>
  );
}

export const v1: Template = {
  Shell,
  components: {
    h2: (p) => (
      <h2
        {...p}
        className="mt-20 mb-6 font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted"
      />
    ),
    h3: (p) => (
      <h3
        {...p}
        className="mt-12 mb-4 font-[family-name:var(--font-project)] text-[24px] leading-[30px] uppercase text-ink"
      />
    ),
    p: (p) => (
      <p
        {...p}
        className="mb-6 font-[family-name:var(--font-body)] text-[20px] font-light leading-[36px] tracking-[0.03em] text-ink"
      />
    ),
    ul: (p) => <ul {...p} className="mb-6 flex list-disc flex-col gap-2 pl-6" />,
    li: (p) => (
      <li
        {...p}
        className="font-[family-name:var(--font-body)] text-[20px] font-light leading-[32px] text-ink"
      />
    ),
    strong: (p) => <strong {...p} className="font-medium" />,
    Figure,
  },
};
