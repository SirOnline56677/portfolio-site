import type { CSSProperties } from "react";

// Wrist Check's flip-dot board, shared by the study's hero and its screen
// rows. Fixed brand surface: ink ground with the unflipped dot field across
// it, the same in both themes, like PriceRuler and LotCard's paper.
export const WC_INK = "#141414";
export const WC_PAPER = "#EFEDE6";
export const WC_RED = "#E23B22";
export const SHELL = "#17191f";
export const mono = "ui-monospace, 'SF Mono', Menlo, monospace";

// The exported frames set the status bar 14px below the top edge, and the
// shell's screen radius (about 56px in the frame's own scale) curves through
// that band, so 9:41 and the battery graze the corner. Paper above the shot,
// as a share of its width so it scales, drops the bar under the curve. Same
// idea as ScreenPair's mobilePadTop.
export const SCREEN_PAD_TOP = "7%";

/** Ink ground with resting dots on a `cell`-sized grid (CSS length). */
export function boardGround(cell: string): CSSProperties {
  return {
    backgroundColor: WC_INK,
    backgroundImage: "radial-gradient(circle at center, #2a2a2a 30%, transparent 32%)",
    backgroundSize: `${cell} ${cell}`,
    backgroundPosition: `calc(${cell} * 0.3) calc(${cell} * 0.3)`,
    color: WC_PAPER,
  };
}

// The mark: same 12x13 geometry as video/wrist-check-tile/src/WristTile.tsx.
// Hour parked NW, minute stepping through eight positions. Each minute
// position is its own group; globals.css steps their opacity in turn
// (.wc-tick), so the tick needs no client JS. Reduced motion holds position 0.
const CELL = 12;
const DOT = CELL - 4;
const MARK_SIZE = 13 * CELL;

const baseDots: [number, number][] = [];
for (let y = 2; y <= 10; y++) {
  for (let x = 0; x < 12; x++) {
    const d = Math.hypot(x - 6, y - 6);
    if (d >= 3.6 && d <= 4.75) baseDots.push([x, y]);
  }
}
for (const y of [0, 1, 11, 12]) for (let x = 4; x <= 8; x++) baseDots.push([x, y]);
baseDots.push([11, 6]); // crown
baseDots.push([6, 6]); // centre
baseDots.push([5, 5]); // hour, parked NW

const MINUTE: [number, number][][] = [
  [[6, 5], [6, 4]],
  [[7, 5], [8, 4]],
  [[7, 6], [8, 6]],
  [[7, 7], [8, 8]],
  [[6, 7], [6, 8]],
  [[5, 7], [4, 8]],
  [[5, 6], [4, 6]],
  [[5, 5], [4, 4]],
];

const TICK_SECONDS = 0.37; // FRAMES_PER_TICK 11 at 30fps, as the tile renders

function Dot({ x, y }: { x: number; y: number }) {
  return <rect x={x * CELL + 2} y={y * CELL + 2} width={DOT} height={DOT} rx={CELL / 3} />;
}

export function FlipDotMark({ className, style, fill = WC_RED }: { className?: string; style?: CSSProperties; fill?: string }) {
  return (
    <svg viewBox={`0 0 ${MARK_SIZE} ${MARK_SIZE}`} className={className} style={{ fill, ...style }} aria-hidden>
      {baseDots.map(([x, y], i) => (
        <Dot key={i} x={x} y={y} />
      ))}
      {MINUTE.map((hand, i) => (
        <g key={i} className="wc-tick" data-i={i} style={{ animationDelay: `${-i * TICK_SECONDS}s` }}>
          {hand.map(([x, y], j) => (
            <Dot key={j} x={x} y={y} />
          ))}
        </g>
      ))}
    </svg>
  );
}

export { TICK_SECONDS };
