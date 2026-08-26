import Image from "next/image";
import type { CompareCardsProps } from "./types";

// Feature-comparison cards (WynnBET competitor analysis): one card per
// feature, competitor rows stacked left, split-flap-style tiles right.
// The tiles and chips are fixed brand surfaces (sportsbook navy/gold, white
// logo chips) and stay identical in both themes; card chrome uses the well
// surface and inverts. A card with a miss gets a gold tint so the gap reads
// without hunting.
const NAVY = "#032B4A";
const GOLD = "#EEB111";
const divAt = (pct: number) => `color-mix(in srgb, var(--color-ink) ${pct}%, transparent)`;

function Tile({ on }: { on: boolean }) {
  return (
    <span
      className="flex h-[32px] w-[26px] flex-none items-center justify-center rounded-[4px] font-mono text-[14px] font-bold"
      style={{
        background: "linear-gradient(#0B3556 48%, #082B47 52%)",
        color: on ? GOLD : "rgba(232,228,216,0.35)",
        boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      aria-label={on ? "offered" : "not offered"}
    >
      {on ? "✓" : "–"}
    </span>
  );
}

export default function CompareCards({ books, features }: CompareCardsProps) {
  return (
    <div className="my-12 grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => {
        const miss = f.offers.includes(false);
        return (
          <div
            key={f.statement}
            className="flex flex-col gap-4 rounded-[18px] border p-5"
            style={
              miss
                ? {
                    borderColor: `color-mix(in srgb, ${GOLD} 55%, var(--color-divider))`,
                    background: `color-mix(in srgb, ${GOLD} 8%, var(--color-well))`,
                  }
                : { borderColor: divAt(25), background: "var(--color-well)" }
            }
          >
            <p className="font-[family-name:var(--font-body)] text-[14px] font-medium leading-[1.45] text-ink">
              {f.statement}
            </p>
            <div className="mt-auto flex flex-col gap-[9px]">
              {books.map((b, i) => (
                <div key={b.name} className="flex items-center justify-between gap-3">
                  <span
                    className="inline-flex items-center rounded-full border px-3 py-[5px]"
                    style={
                      b.dark
                        ? { background: NAVY, borderColor: NAVY }
                        : { background: "#ffffff", borderColor: divAt(22) }
                    }
                  >
                    <Image
                      src={b.logo.src}
                      width={b.logo.w}
                      height={b.logo.h}
                      alt={b.name}
                      className="w-auto"
                      style={{ height: "18px" }}
                    />
                  </span>
                  <Tile on={f.offers[i]} />
                </div>
              ))}
            </div>
            {f.note ? (
              <p className="font-[family-name:var(--font-body)] text-label font-light italic text-muted">
                {f.note}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
