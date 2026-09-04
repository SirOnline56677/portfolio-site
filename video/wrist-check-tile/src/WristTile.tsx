import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

// Wrist Check homepage tile (D2 · wordmark over boutique image) with the
// flip-dot mark ticking: hour parked at NW, minute orbiting 8 positions —
// discrete jumps, seamless loop every 8 ticks.
const CELL = 11.5 * 2; // rendered at 2x (1140 square)
const INK = '#141414';
const RED = '#E23B22';
const PAPER = '#EFEDE6';
const FRAMES_PER_TICK = 11;

const baseDots: [number, number][] = [];
{
  const cx = 6, cy = 6;
  for (let y = 2; y <= 10; y++) for (let x = 0; x < 12; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d >= 3.6 && d <= 4.75) baseDots.push([x, y]);
  }
  for (const y of [0, 1, 11, 12]) for (let x = 4; x <= 8; x++) baseDots.push([x, y]);
  baseDots.push([11, 6]); // crown
  baseDots.push([6, 6]);  // center
  baseDots.push([5, 5]);  // hour, parked NW
}
const MIN: [number, number][][] = [
  [[6,5],[6,4]], [[7,5],[8,4]], [[7,6],[8,6]], [[7,7],[8,8]],
  [[6,7],[6,8]], [[5,7],[4,8]], [[5,6],[4,6]], [[5,5],[4,4]],
];

export const WristTile: React.FC = () => {
  const frame = useCurrentFrame();
  const mi = Math.floor(frame / FRAMES_PER_TICK) % 8;
  const dots = [...baseDots, ...MIN[mi]];
  const size = 13 * CELL;
  const dot = CELL - 4;
  return (
    <AbsoluteFill style={{background: INK}}>
      <Img src={staticFile('booth.jpg')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
      <AbsoluteFill style={{background: 'rgba(20,20,20,0.78)'}} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position: 'absolute', top: 68, right: 68}}>
        {dots.map(([x, y], i) => (
          <rect key={i} x={x * CELL + 2} y={y * CELL + 2} width={dot} height={dot} rx={CELL / 3} fill={RED} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 76, right: 76, bottom: 76, color: PAPER, fontFamily: 'system-ui, -apple-system, sans-serif'}}>
        <div style={{fontWeight: 800, fontSize: 168, letterSpacing: '-0.04em', lineHeight: 0.88}}>WRIST<br />CHECK</div>
        <div style={{fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontSize: 30, letterSpacing: '0.13em', marginTop: 44, opacity: 0.75}}>
          BUY / SELL / TRADE · EVERY WATCH AUTHENTICATED
        </div>
      </div>
    </AbsoluteFill>
  );
};
