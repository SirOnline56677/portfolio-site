import Image from "next/image";
import type { MatrixProps } from "./types";

// 2×2 positioning matrix. Transparent like the mindmap — hairline axes on the
// page ground, competitors as white chips so their brand marks read in both
// themes (the marks are baked on white and mostly dark), and the spark item
// as the fixed ident red, consistent with the mindmap's rule.
const W = 900;
const H = 560;
const RED = "#E8472A";
const CREAM = "#EFEAE0";

const axisLabel =
  "absolute font-[family-name:var(--font-label)] text-label uppercase tracking-[0.13em] text-muted whitespace-nowrap";

export default function Matrix({ axes, items }: MatrixProps) {
  return (
    <section aria-label="Competitor positioning matrix" className="my-12">
      <div
        className="relative w-full"
        style={{ aspectRatio: `${W} / ${H}`, containerType: "inline-size" }}
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <line x1={W / 2} y1={30} x2={W / 2} y2={H - 30} stroke="var(--color-ink)" strokeOpacity={0.35} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1={60} y1={H / 2} x2={W - 60} y2={H / 2} stroke="var(--color-ink)" strokeOpacity={0.35} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        </svg>
        <span className={axisLabel} style={{ left: "50%", top: 0, transform: "translateX(-50%)" }}>{axes.top}</span>
        <span className={axisLabel} style={{ left: "50%", bottom: 0, transform: "translateX(-50%)" }}>{axes.bottom}</span>
        {/* horizontal-axis labels sit clear of the line: left above, right below */}
        <span className={axisLabel} style={{ left: 0, top: "50%", transform: "translateY(calc(-100% - 7px))" }}>{axes.left}</span>
        <span className={axisLabel} style={{ right: 0, top: "50%", transform: "translateY(7px)" }}>{axes.right}</span>

        {items.map((it) => (
          <span
            key={it.id}
            className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full border px-[0.9em] py-[0.42em]"
            style={{
              left: `${(it.x / W) * 100}%`,
              top: `${(it.y / H) * 100}%`,
              fontSize: "clamp(9px, 1.5cqw, 13px)",
              ...(it.kind === "spark"
                ? { background: RED, borderColor: RED, color: CREAM, fontWeight: 700, fontFamily: "var(--font-body)" }
                : {
                    background: "#ffffff",
                    borderColor: "color-mix(in srgb, var(--color-ink) 30%, transparent)",
                  }),
            }}
          >
            {it.img ? (
              <Image
                src={it.img.src}
                width={it.img.w}
                height={it.img.h}
                alt={it.label}
                className="w-auto"
                style={{ height: `${it.img.em ?? 1.5}em` }}
              />
            ) : (
              it.label
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
