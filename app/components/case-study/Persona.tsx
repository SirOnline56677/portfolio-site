import Image from "next/image";
import type { PersonaProps } from "./types";

// Persona dossier card — the research-canonical one-card layout, in the
// ident. The avatar cutout sits on a fixed cream disc so it reads the same
// in both themes; goals get the palette's green, worries the ident red, and
// the quote closes on a red period like the wordmark's dot.
const RED = "#E8472A";
const GREEN = "#2E7D52";
const CREAM = "#EFEAE0";
const inkAt = (pct: number) => `color-mix(in srgb, var(--color-ink) ${pct}%, transparent)`;

function Bullets({ label, items, color }: { label: string; items: string[]; color: string }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-label)] text-label-sm uppercase text-muted">
        {label}
      </p>
      <ul className="mt-2 flex list-none flex-col gap-2 p-0">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-baseline gap-[10px] font-[family-name:var(--font-body)] text-[13.5px] font-light leading-[1.45] text-ink"
          >
            <span
              className="h-[10px] w-[10px] flex-none translate-y-px rounded-full"
              style={{ background: color }}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Persona({ name, meta, chips, quote, bio, goals, worries, img }: PersonaProps) {
  return (
    <section
      aria-label={`Persona: ${name}`}
      className="my-12 grid grid-cols-1 gap-x-9 gap-y-7 rounded-[24px] border border-divider/40 bg-well p-7 md:grid-cols-[190px_1fr] md:p-8"
    >
      <div className="flex flex-col items-start gap-4">
        <span
          className="relative block h-[88px] w-[88px] overflow-clip rounded-full border-[1.5px]"
          style={{ background: CREAM, borderColor: inkAt(75) }}
        >
          <Image
            src={img.src}
            width={img.w}
            height={img.h}
            alt={name}
            className="absolute bottom-[-4px] left-1/2 w-auto -translate-x-1/2"
            style={{ height: "86%" }}
          />
        </span>
        <p className="font-[family-name:var(--font-body)] text-[17px] text-ink">
          <span className="font-medium">{name}</span>
          <span className="text-muted"> · {meta}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border px-[0.9em] py-[0.3em] font-[family-name:var(--font-body)] text-label font-light"
              style={{ borderColor: inkAt(40), color: inkAt(80) }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <p className="font-[family-name:var(--font-body)] text-[21px] font-medium leading-[1.35] text-ink [text-wrap:balance]">
          “{quote}
          <span style={{ color: RED }}>.</span>”
        </p>
        <p className="font-[family-name:var(--font-body)] text-meta font-light text-ink">{bio}</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Bullets label="Goals" items={goals} color={GREEN} />
          <Bullets label="Worries" items={worries} color={RED} />
        </div>
      </div>
    </section>
  );
}
