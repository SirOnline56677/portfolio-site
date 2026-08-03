import Image from "next/image";
import Link from "next/link";
import type { FigureProps, ShellProps, Template } from "./types";

// Variant 3 — the mix.
// v1's palette and typography (so it inverts with dark mode and belongs to the
// portfolio) combined with v2's structural furniture: the sticky section nav and
// the sense of each section sitting on its own raised surface.

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

      <nav className="hidden w-[220px] shrink-0 lg:block">
        <ul className="sticky top-12 flex flex-col gap-4">
          {sections.map((s) => (
            <li
              key={s}
              className="font-[family-name:var(--font-display)] text-[16px] leading-[20px] uppercase tracking-[0.03em] text-muted transition-colors hover:text-ink"
            >
              {s}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export const v3: Template = {
  Shell,
  components: {
    // Sections sit on the raised paper surface — v2's card idea, but drawn with
    // the portfolio's own tones so it still inverts in dark mode.
    h2: (p) => (
      <h2
        {...p}
        className="mt-14 mb-5 rounded-t-[16px] bg-well/60 px-8 pt-8 font-[family-name:var(--font-display)] text-[20px] leading-[23px] uppercase tracking-[0.03em] text-muted"
      />
    ),
    h3: (p) => (
      <h3
        {...p}
        className="mb-4 bg-well/60 px-8 font-[family-name:var(--font-project)] text-[24px] leading-[30px] uppercase text-ink"
      />
    ),
    p: (p) => (
      <p
        {...p}
        className="bg-well/60 px-8 pb-6 font-[family-name:var(--font-body)] text-[18px] font-light leading-[32px] tracking-[0.03em] text-ink"
      />
    ),
    ul: (p) => <ul {...p} className="list-disc bg-well/60 px-8 pb-6 pl-14" />,
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
