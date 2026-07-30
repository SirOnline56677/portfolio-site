// CRT scanlines overlay — thin horizontal lines over the whole screen, like the
// glass of a CRT. Values measured from the Paper/Figma "Desktop - 8" layer.
// Pure CSS, static (no roll), sits above content but is very subtle + non-blocking.

const SCAN_COLOR = "0, 0, 0"; // black
const SCAN_OPACITY = 0.08; // ~2% average darkening at 1px / 4px
const SCAN_THICK = 1; // px
const SCAN_PERIOD = 4; // px (line height)

export default function Scanlines() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60]"
      style={{
        background: `repeating-linear-gradient(
          to bottom,
          rgba(${SCAN_COLOR}, ${SCAN_OPACITY}) 0,
          rgba(${SCAN_COLOR}, ${SCAN_OPACITY}) ${SCAN_THICK}px,
          transparent ${SCAN_THICK}px,
          transparent ${SCAN_PERIOD}px
        )`,
      }}
    />
  );
}
