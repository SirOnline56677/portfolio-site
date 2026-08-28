import type { PriceRulerProps } from "./types";

// Approach shortlist as a price ruler: brand chips placed along the budget
// axis at their secondary-market entry prices, with the over-budget outlier
// pinned past the red ceiling. A fixed Wrist Check brand surface (paper/ink/
// red) in both themes; wide layout scrolls in its own container.
const PAPER = "#EFEDE6";
const INK = "#141414";
const RED = "#E23B22";
const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

export default function PriceRuler({ caption, min, max, items, over, footnote }: PriceRulerProps) {
  const fmt = (v: number) => "$" + v.toLocaleString("en-US");
  return (
    <div className="my-12 overflow-x-auto rounded-[20px] px-7 py-6" style={{ background: PAPER, color: INK }}>
      <div style={{ minWidth: 560 }}>
        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: "0.18em", opacity: 0.6, marginBottom: 6 }}>
          {caption}
        </div>
        <div className="relative" style={{ height: 124, marginTop: 4 }}>
          {items.map((it, i) => {
            const x = ((it.value - min) / (max - min)) * 88;
            const lane = i % 2;
            return (
              <div
                key={it.name}
                className="absolute rounded-full font-extrabold"
                style={{ left: `${x}%`, top: 36 + lane * 34, transform: "translateX(-50%)", background: INK, color: PAPER, padding: "4px 10px", fontSize: 9.5, whiteSpace: "nowrap" }}
              >
                {it.name}
              </div>
            );
          })}
          <div className="absolute rounded-full font-extrabold" style={{ right: -6, top: 2, background: RED, color: PAPER, padding: "4px 10px", fontSize: 9.5, whiteSpace: "nowrap" }}>
            {over} →
          </div>
          <div className="absolute" style={{ left: 0, right: 0, bottom: 14, height: 2, background: INK }} />
          <div className="absolute" style={{ left: 0, bottom: 6, width: 2, height: 18, background: INK }} />
          <div className="absolute" style={{ left: "50%", bottom: 6, width: 2, height: 14, background: INK }} />
          <div className="absolute" style={{ right: 0, bottom: 6, width: 2, height: 18, background: RED }} />
          <div className="absolute font-bold" style={{ left: 0, bottom: -10, fontFamily: mono, fontSize: 9 }}>{fmt(min)}</div>
          <div className="absolute" style={{ left: "50%", transform: "translateX(-50%)", bottom: -10, fontFamily: mono, fontSize: 9, opacity: 0.6 }}>{fmt((min + max) / 2)}</div>
          <div className="absolute font-bold" style={{ right: 0, bottom: -10, fontFamily: mono, fontSize: 9, color: RED }}>{fmt(max)}</div>
        </div>
        <div style={{ fontFamily: mono, fontSize: 8, letterSpacing: "0.08em", opacity: 0.55, marginTop: 20 }}>
          {footnote}
        </div>
      </div>
    </div>
  );
}
