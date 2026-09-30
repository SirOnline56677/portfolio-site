#!/usr/bin/env node
/**
 * Generates the 1200x630 Open Graph cards in public/og/ from the homepage card
 * images in app/data.ts.
 *
 * Social cards crop to 1.91:1 and none of the source images are that shape: the
 * Free Spins phone is portrait, so a raw crop would keep about a third of it and
 * lose the phone. Each image is instead fitted whole and padded, using its own
 * dominant colour so the fill harmonizes with the photo rather than framing a
 * dark image in white.
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
  const { dominant } = await sharp(input).stats();
  await sharp(input)
    .resize(1200, 630, { fit: "contain", background: dominant })
    .flatten({ background: dominant })
    .jpeg({ quality: 88, chromaSubsampling: "4:4:4" })
    .toFile(path.join(root, `public/og/${slug}.jpg`));
  console.log(`og: ${slug} padded rgb(${dominant.r},${dominant.g},${dominant.b})`);
}
