import type { ProblemSpaceProps } from "./types";

// Problem Space cards: ident-geometry illustrations built from the brand's
// disc/thread vocabulary. Transparent on the page ground like the section's
// siblings — structure strokes use theme tokens and invert; the one red
// accent per piece is the fixed ident red, per the Mindmap/Matrix rule.
const RED = "#E8472A";
const stroke = {
  fill: "none",
  stroke: "var(--color-ink)",
  strokeOpacity: 0.75,
  strokeWidth: 1.5,
} as const;
const thread = {
  stroke: "var(--color-ink)",
  strokeOpacity: 0.4,
  strokeWidth: 1,
} as const;

// Savings running out: coin stacks stepping down to the one that's left.
function Savings() {
  const cols: [number, number][] = [
    [52, 6],
    [104, 5],
    [156, 3],
    [208, 2],
  ];
  return (
    <svg viewBox="0 0 300 200" className="w-full" aria-hidden>
      <line x1={24} y1={172} x2={276} y2={172} {...thread} />
      {cols.map(([cx, n]) =>
        Array.from({ length: n }, (_, i) => (
          <circle key={`${cx}-${i}`} cx={cx} cy={160 - i * 24} r={12} {...stroke} />
        )),
      )}
      <circle cx={260} cy={160} r={12} fill={RED} />
    </svg>
  );
}

// Cognition dimming: an eclipse with a red sliver still showing.
function Eclipse() {
  return (
    <svg viewBox="0 0 300 200" className="w-full" aria-hidden>
      <circle cx={132} cy={100} r={62} {...stroke} />
      <circle cx={176} cy={86} r={58} fill={RED} />
      <circle cx={184} cy={82} r={58} fill="var(--color-ink)" />
    </svg>
  );
}

// Isolation: a connected cluster, one disc drifted off, its thread broken.
function Drift() {
  const cluster: [number, number][] = [
    [76, 64],
    [152, 52],
    [128, 96],
    [86, 140],
  ];
  const links: [number, number][] = [
    [0, 2],
    [2, 3],
    [0, 3],
    [2, 1],
    [0, 1],
  ];
  return (
    <svg viewBox="0 0 300 200" className="w-full" aria-hidden>
      {links.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          x1={cluster[a][0]}
          y1={cluster[a][1]}
          x2={cluster[b][0]}
          y2={cluster[b][1]}
          {...thread}
        />
      ))}
      <line x1={128} y1={96} x2={238} y2={150} {...thread} strokeDasharray="5 7" />
      {cluster.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={15} {...stroke} fill="var(--color-paper)" />
      ))}
      <circle cx={252} cy={157} r={15} fill={RED} />
    </svg>
  );
}

const ART = { savings: Savings, eclipse: Eclipse, drift: Drift };

export default function ProblemSpace({ items }: ProblemSpaceProps) {
  return (
    <div className="my-12 grid grid-cols-1 gap-x-9 gap-y-12 md:grid-cols-3">
      {items.map((it) => {
        const Art = ART[it.art];
        return (
          <div key={it.art} className="flex flex-col gap-4">
            <Art />
            <h4 className="font-[family-name:var(--font-body)] text-h4 uppercase text-ink">
              {it.title}
            </h4>
            <p className="font-[family-name:var(--font-body)] text-meta font-light text-muted">
              {it.copy}
            </p>
          </div>
        );
      })}
    </div>
  );
}
