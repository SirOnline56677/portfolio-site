import Image from "next/image";
import { stack, currentlyWorkingOn } from "../data";
import Clock from "./Clock";
import ContributionsGraph from "./ContributionsGraph";
import ThinkingOrbIcon from "./ThinkingOrbIcon";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-[family-name:var(--font-display)] text-[20px] leading-[23px] tracking-[0.03em] uppercase text-ink">
      {children}
    </span>
  );
}

function StackItem({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-3">
      <Image src={icon} alt={name} width={28} height={28} className="h-7 w-7 object-contain" />
      <span className="font-[family-name:var(--font-body)] font-medium text-[20px] leading-[32px] text-muted">
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
            <h1 className="font-[family-name:var(--font-display)] text-[64px] leading-[1.05] capitalize text-ink sm:text-[96px] sm:leading-[116px]">
              Stephen Aguila
            </h1>
            <p className="max-w-[653px] font-[family-name:var(--font-body)] font-medium text-[22px] leading-[32px] text-muted sm:text-[24px]">
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
            <SectionLabel>Currently working on</SectionLabel>
            <div className="rule-solid" />
          </div>
          <div className="flex flex-col gap-[15px]">
            {currentlyWorkingOn.map((item, i) => (
              <span
                key={i}
                className="font-[family-name:var(--font-body)] font-light text-[20px] leading-[36px] tracking-[0.03em] text-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* GitHub contributions */}
      <div className="flex flex-col gap-[13px]">
        <SectionLabel>GitHub repo contributions</SectionLabel>
        <ContributionsGraph />
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
              className="font-[family-name:var(--font-label)] text-[16px] leading-[20px] uppercase text-ink"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              <Clock />
            </span>
          </div>
        </div>
        <div className="rule-solid" />
        <p className="mt-4 max-w-[641px] font-[family-name:var(--font-body)] font-light text-[20px] leading-[36px] tracking-[0.03em] text-ink">
          You can reach me and say Hi on{" "}
          <a href="#" className="underline underline-offset-4 hover:text-muted">LinkedIn</a> or on{" "}
          <a href="https://github.com/SirOnline56677" className="underline underline-offset-4 hover:text-muted">GitHub</a> or{" "}
          <a href="mailto:aguilasneakers56677@gmail.com" className="underline underline-offset-4 hover:text-muted">email</a> if you want to talk.
        </p>
      </div>
    </div>
  );
}
