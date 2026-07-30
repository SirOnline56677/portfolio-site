// Subtle dithered-grain background — recreates the "ShaderDithering / darken"
// texture from the Paper design with a cheap fixed SVG noise overlay (no WebGL).
export default function DitherBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 mix-blend-multiply"
      style={{ opacity: 0.055 }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="dither">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            stitchTiles="stitch"
          />
          {/* posterize the noise into a few levels for a dithered look */}
          <feComponentTransfer>
            <feFuncA type="discrete" tableValues="0 0.5 1 0.5 0 1 0.5" />
          </feComponentTransfer>
        </filter>
        <rect width="100%" height="100%" filter="url(#dither)" />
      </svg>
    </div>
  );
}
