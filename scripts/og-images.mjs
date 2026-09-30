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

for (const [slug, src] of Object.entries(SOURCES)) {
  const input = path.join(root, src);
  await sharp(input)
    .resize(1200, 630, { fit: "cover", position: sharp.strategy.attention })
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toFile(path.join(root, `public/og/${slug}.jpg`));
  console.log(`og: ${slug} filled`);
}
