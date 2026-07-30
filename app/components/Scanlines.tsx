// CRT scanlines overlay — thin horizontal lines over the whole screen, like the
// glass of a CRT. Values tuned in the Dither Lab against the Figma design.
// Rolls vertically; the animation is disabled under prefers-reduced-motion.

const SCAN_COLOR = "255, 216, 216"; // #FFD8D8
const SCAN_OPACITY = 0.4;
const SCAN_THICK = 1; // px
const SCAN_PERIOD = 4; // px (line height)
const SCAN_ROLL = 4; // px / second (0 = static)

export default function Scanlines() {
  const line = `rgba(${SCAN_COLOR}, ${SCAN_OPACITY})`;
  return (
    <div
      aria-hidden
      className="scanlines pointer-events-none fixed inset-0 z-[60]"
      style={{
        background: `repeating-linear-gradient(
          to bottom,
          ${line} 0,
          ${line} ${SCAN_THICK}px,
          transparent ${SCAN_THICK}px,
          transparent ${SCAN_PERIOD}px
        )`,
        // one full loop = move down exactly one period
        animation:
          SCAN_ROLL > 0
            ? `scanline-roll ${SCAN_PERIOD / SCAN_ROLL}s linear infinite`
            : undefined,
      }}
    />
  );
}
