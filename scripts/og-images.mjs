#!/usr/bin/env node
/**
 * Generates the 1200x630 Open Graph cards in public/og/ from the homepage card
 * images in app/data.ts.
 *
 * Social cards crop to 1.91:1 and none of the source images are that shape, so
 * each one is cropped to fill the frame edge to edge.
 *
 * The crop is saliency-based, not centred. That distinction is the whole thing:
 * a centred crop cut the Wrist Check wordmark in half, slicing "CHECK" across
 * the bottom edge, while the saliency crop keeps the wordmark, the tagline and
 * the watch. Centred would also have pushed the Bingo logo against the edge.
 *
 * A slug in INSET is scaled down inside the frame instead, sitting on its own
 * dominant colour like a poster on a mount. Sportsbook is there because the
 * full-bleed version ran the odds board off both edges and read as too big.
 *
 * A slug in CROP_Y takes a fixed vertical position instead of a chosen one.
 * Free Spins is there because saliency landed low on the phone and Stephen
 * wanted its top in frame. The value is a fraction of the travel available to
 * the crop band, so it survives the source being re-exported at another size.
 *
 * Run after changing a card image. Output is committed.
 */
import sharp from "sharp";
import path from "node:path";
import { mkdirSync } from "node:fs";

const root = path.resolve(import.meta.dirname, "..");
const SOURCES = {
  "wb-free-spins": "public/work/wb-free-spins/wynnbet-free-spins-home-img-lite.webp",
  "wb-leaderboards": "public/work/wb-leaderboards/tile-shuffle.png",
  "wb-sportsbook": "public/work/wb-sportsbook/sportsbook-evolution-poster.png",
  "bingo-ai-job-matching-platform-for-seniors":
    "public/work/bingo-ai-job-matching-platform-for-seniors/bingo-ident-poster.jpg",
  "wrist-check-a-peer-to-peer-market-place":
    "public/work/wrist-check-a-peer-to-peer-market-place/tile-wordmark.png",
};

mkdirSync(path.join(root, "public/og"), { recursive: true });

const W = 1200;
const H = 630;

/** Fraction of the frame the image occupies. Absent means full bleed. */
const INSET = {
  "wb-sportsbook": 0.82,
};

/** Where the crop band sits: 0 is the top of the source, 1 the bottom. */
const CROP_Y = {
  "wb-free-spins": 0.12,
};

for (const [slug, src] of Object.entries(SOURCES)) {
  const input = path.join(root, src);
  const out = path.join(root, `public/og/${slug}.jpg`);
  const scale = INSET[slug];

  if (!scale) {
    const y = CROP_Y[slug];
    if (y === undefined) {
      await sharp(input)
        .resize(W, H, { fit: "cover", position: sharp.strategy.attention })
        .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
        .toFile(out);
      console.log(`og: ${slug} filled`);
    } else {
      const meta = await sharp(input).metadata();
      const bandH = Math.round((meta.width * H) / W);
      const top = Math.round((meta.height - bandH) * y);
      await sharp(input)
        .extract({ left: 0, top, width: meta.width, height: bandH })
        .resize(W, H)
        .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
        .toFile(out);
      console.log(`og: ${slug} filled from ${Math.round(y * 100)}% down`);
    }
    continue;
  }

  const { dominant } = await sharp(input).stats();
  const iw = Math.round(W * scale);
  const ih = Math.round(H * scale);
  const inner = await sharp(input)
    .resize(iw, ih, { fit: "contain", background: dominant })
    .toBuffer();

  await sharp({
    create: { width: W, height: H, channels: 3, background: dominant },
  })
    .composite([
      { input: inner, top: Math.round((H - ih) / 2), left: Math.round((W - iw) / 2) },
    ])
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toFile(out);
  console.log(`og: ${slug} inset to ${Math.round(scale * 100)}%`);
}
