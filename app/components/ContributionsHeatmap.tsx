import type { Contributions } from "../lib/github";

// Intensity scale (levels 0–4), as CSS variables so the ramp follows
// [data-theme] — see globals.css. React passes var(…) through to the style
// attribute verbatim, so this stays a Server Component. Green in light mode;
// in dark it inverts to purple, which sits on the same violet cast as the
// inverted body wash.
const LEVELS = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function ContributionsHeatmap({
  data,
}: {
  data: Contributions;
}) {
  const cal = data;

  // Determine month label positions (first week where the month changes).
  const monthLabels: { index: number; label: string }[] = [];
  let lastMonth = -1;
  cal.weeks.forEach((week, i) => {
    const firstDay = week[0];
    if (!firstDay) return;
    const m = new Date(firstDay.date).getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ index: i, label: MONTHS[m] });
      lastMonth = m;
    }
  });

  return (
    <div className="w-full rounded-[10px] border border-divider/25 bg-[var(--card)] p-4">
      <div className="mb-2 font-[family-name:var(--font-label)] text-[12px] uppercase tracking-wide text-muted">
        {cal.total.toLocaleString()} contributions in the last year
      </div>

      {/* Scrollable on narrow screens */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1">
          {/* Month labels */}
          <div className="relative h-3" style={{ width: cal.weeks.length * 14 }}>
            {monthLabels.map(({ index, label }) => (
              <span
                key={`${label}-${index}`}
                className="absolute font-[family-name:var(--font-label)] text-[9px] uppercase text-muted"
                style={{ left: index * 14 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Week columns */}
          <div className="flex gap-[3px]">
            {cal.weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => (
                  <span
                    key={di}
                    title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                    className="h-[11px] w-[11px] rounded-[2px]"
                    style={{ backgroundColor: LEVELS[day.level] }}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-1 flex items-center gap-1 self-end font-[family-name:var(--font-label)] text-[9px] uppercase text-muted">
            <span className="mr-1">Less</span>
            {LEVELS.map((c) => (
              <span key={c} className="h-[11px] w-[11px] rounded-[2px]" style={{ backgroundColor: c }} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
