import Image from "next/image";
import Link from "next/link";
import { stack } from "../data";
import Clock from "./Clock";
import ContributionsGraph from "./ContributionsGraph";
import ExplorationFight from "./ExplorationFight";
import SectionLabel from "./SectionLabel";
import ThemeToggle from "./ThemeToggle";
import ThinkingOrbIcon from "./ThinkingOrbIcon";
import WorkingOnList from "./WorkingOnList";

function StackItem({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={icon} alt={name} width={28} height={28} className="stack-icon h-7 w-7 object-contain" />
      <span className="font-[family-name:var(--font-body)] font-medium text-stack text-muted">
        {name.toUpperCase()}
      </span>
    </div>
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
              <div className="flex items-center gap-4">
                {stack.building.map((s) => (
                  <StackItem key={s.name} {...s} />
                ))}
              </div>
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
                    ["Working", "#34a06f"],
                    ["Unfinished", "#e8a33d"],
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

      {/* GitHub contributions — renders nothing (heading included) when the
          contribution data is unavailable. */}
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
          data-cursor-label="EXPLORE"
          className="mt-4 w-fit font-[family-name:var(--font-body)] font-light text-[20px] leading-[36px] tracking-[0.03em] text-ink u-line hover:text-muted"
        >
          Photography, AI imagery, branding &amp; experiments →
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
          You can reach me and say Hi on{" "}
          <a href="https://www.linkedin.com/in/stephen-aguila-7b466967/" className="u-line hover:text-muted">LinkedIn</a> or on{" "}
          <a href="https://github.com/SirOnline56677" className="u-line hover:text-muted">GitHub</a> or{" "}
          <a href="mailto:saguila21@gmail.com" className="u-line hover:text-muted">email</a> if you want to talk.
        </p>
      </div>
    </div>
  );
}
