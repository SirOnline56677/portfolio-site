import Image from "next/image";
import Link from "next/link";
import { stack } from "../data";
import Clock from "./Clock";
import ContributionsGraph from "./ContributionsGraph";
import CopyEmail from "./CopyEmail";
import ExplorationFight from "./ExplorationFight";
import SectionLabel from "./SectionLabel";
import ThemeToggle from "./ThemeToggle";
import ThinkingOrbIcon from "./ThinkingOrbIcon";
import WorkingOnList from "./WorkingOnList";

function StackItem({
  name,
  icon,
  width,
  height,
  gap,
}: {
  name: string;
  icon: string;
  width: number;
  height: number;
  gap: number;
}) {
  return (
    <div className="flex shrink-0 items-center" style={{ gap }}>
      <Image
        src={icon}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        className="stack-icon shrink-0 object-cover"
        data-stack-icon={name.toLowerCase()}
        style={{ width, height }}
      />
      <span className="font-[family-name:var(--font-body)] font-medium text-stack text-muted">
        {name.toUpperCase()}
      </span>
    </div>
  );
}

/* The download mark: an 8-bit arrow on a 3px grid, three shaft rows then the
   head stepping out. Rendered twice, the second copy a full 24 units below the
   first, so .dl-march can slide the strip down by exactly one glyph and loop
   without a seam. Motion lives in globals.css. */
const DL_ROWS: [number, number, number][] = [
  [9, 3, 6],
  [9, 6, 6],
  [9, 9, 6],
  [3, 12, 18],
  [6, 15, 12],
  [9, 18, 6],
];

function DownloadArrow() {
  const glyph = (offset: number) =>
    DL_ROWS.map(([x, y, w]) => (
      <rect
        key={`${x}-${y}-${offset}`}
        x={x}
        y={y + offset}
        width={w}
        height={3}
        fill="currentColor"
      />
    ));

  return (
    <span className="dl-arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" focusable="false">
        <g className="dl-arrow-strip">
          {glyph(0)}
          {glyph(24)}
        </g>
      </svg>
    </span>
  );
}

function ExplorationArrow() {
  return (
    <span
      aria-hidden="true"
      className="relative h-[22px] w-[22px] shrink-0"
    >
      <span className="absolute inset-0 overflow-hidden">
        <svg
          viewBox="0 0 22 22"
          className="exploration-arrow-glyph absolute inset-0 h-[22px] w-[22px]"
        >
          <path
            d="m10.91 5.61-.93.93 3.99 3.99H5.06v1.3h8.91l-3.99 4.02.93.92 5.57-5.56-5.57-5.6Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <svg
        viewBox="0 0 22 22"
        className="pointer-events-none absolute inset-0 h-[22px] w-[22px] overflow-visible"
      >
        <path
          d="M.4 5.19V.4h4.79M21.16 17.17v4.79h-4.79M5.19 21.96H.4v-4.79M16.37.4h4.79v4.79"
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
        />
      </svg>
    </span>
  );
}

export default function LeftColumn() {
  return (
    <div className="flex flex-col gap-[82px]">
      {/* Intro + stack */}
      <div className="flex flex-col gap-[101px]">
        <div className="flex flex-col gap-[33px]">
          {/* Name + bio */}
          <div className="flex flex-col gap-[27px]">
            <ThemeToggle />
            <h1 className="font-[family-name:var(--font-display)] text-hero capitalize text-ink sm:text-hero-lg">
              Stephen Aguila
            </h1>
            <p className="max-w-[653px] font-[family-name:var(--font-body)] font-medium text-lede text-muted sm:text-lede-lg">
              A product designer who designs, ships and breaks things in the
              process. Working on building products for others and for myself.
            </p>
          </div>

          {/* Designing in / Building with */}
          <div className="flex flex-col gap-4">
            <div className="rule-dashed" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionLabel>Designing in</SectionLabel>
              <div className="flex items-center gap-6">
                {stack.designing.map((s) => (
                  <StackItem key={s.name} {...s} />
                ))}
              </div>
            </div>
            <div className="rule-dashed" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionLabel>Building with</SectionLabel>
              <div className="flex items-center gap-[15px]">
                {stack.building.map((s) => (
                  <StackItem key={s.name} {...s} />
                ))}
              </div>
            </div>
            <div className="rule-dashed" />
            {/* The word on the right carries the same type as the stack items
                above it, so the right edge of this column stays one column.
                `download` rather than a new tab because the label says so. */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SectionLabel>Resume</SectionLabel>
              <a
                href="/resume.pdf"
                download
                aria-label="Download resume, PDF"
                className="dl-link group flex items-center gap-[10px] font-[family-name:var(--font-body)] font-medium text-stack text-muted hover:text-ink focus-visible:text-ink"
              >
                <DownloadArrow />
                <span className="u-line">DOWNLOAD</span>
              </a>
            </div>
            <div className="rule-dashed" />
          </div>
        </div>

        {/* Currently working on */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[11px]">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <SectionLabel>Current Projects</SectionLabel>
              <div className="flex items-center gap-6">
                {(
                  [
                    ["Incubation", "#34a06f"],
                    ["Seeding", "#e8a33d"],
                  ] as const
                ).map(([label, color]) => (
                  <span key={label} className="flex items-center gap-[8px]">
                    <span
                      className="h-[9px] w-[9px] rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-[family-name:var(--font-body)] font-light text-[16px] leading-[22px] text-muted">
                      {label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
            <div className="rule-solid" />
          </div>
          <WorkingOnList />
        </div>
      </div>

      {/* GitHub contributions — live public activity, immediately above
          Exploration. */}
      <ContributionsGraph />

      {/* Exploration — side projects live on their own page */}
      <div className="flex flex-col gap-[11px]">
        <div className="flex flex-col gap-[11px] lg:hidden">
          <SectionLabel>Exploration</SectionLabel>
          <div className="rule-solid" />
        </div>
        <div className="relative hidden lg:block">
          <div className="pointer-events-none absolute bottom-[18px] left-0 z-10">
            <SectionLabel>Exploration</SectionLabel>
          </div>
          <ExplorationFight />
        </div>
        <Link
          href="/exploration"
          className="group mt-4 flex w-full items-end font-[family-name:var(--font-body)] font-light text-[20px] leading-[36px] tracking-[0.03em] text-ink hover:text-muted"
        >
          <span className="min-w-0 flex-1">
            This is my creative playground. A home for the work that doesn’t
            fit neatly into a case study: one-off digital projects, travel
            photography, branding experiments, and whatever I’m exploring with
            AI. Some start with a purpose. Others start with a simple, “What if?”
          </span>
          <ExplorationArrow />
        </Link>
      </div>

      {/* Get in touch */}
      <div className="flex flex-col gap-[11px]">
        <div className="flex items-center justify-between gap-3">
          <SectionLabel>Get in touch</SectionLabel>
          <div className="flex items-center gap-3">
            <ThinkingOrbIcon />
            {/* Tabular figures keep the clock a fixed width, so the orb beside
                it doesn't shuffle sideways every second. IvyStyle Sans ships
                `tnum`; without it the string swings ~24px across digit combos. */}
            <span
              className="font-[family-name:var(--font-label)] text-nav uppercase text-ink"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <Clock />
            </span>
          </div>
        </div>
        <div className="rule-solid" />
        <p className="mt-4 font-[family-name:var(--font-body)] font-light text-body-lg text-ink">
          You can reach me and say <em>Hi</em> on{" "}
          <a href="https://www.linkedin.com/in/stephen-aguila-7b466967/" className="u-line hover:text-muted">LinkedIn</a> or{" "}
          <a href="mailto:saguila21@gmail.com" className="u-line hover:text-muted">email</a>.
        </p>
        <CopyEmail address="saguila21@gmail.com" />
      </div>
    </div>
  );
}
