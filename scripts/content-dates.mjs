#!/usr/bin/env node
/**
 * Writes app/lib/contentDates.json: the last commit date for each page source.
 *
 * The sitemap needs real dates, and it cannot find them itself. It runs inside
 * the Worker, which has neither a filesystem nor git, so any lookup there falls
 * back to the current time and every deploy claims all seven pages changed.
 * Baking the dates into a file the bundle carries is the only way they survive.
 *
 * Run before `next build`. Committed, so a build works without running it.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = [
  "app/page.tsx",
  "app/exploration/page.tsx",
  ...readdirSync(path.join(root, "content/work"))
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => `content/work/${f}`),
];

const dates = {};
for (const file of files) {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (iso) dates[file] = iso;
  } catch {
    // Uncommitted or git unavailable: leave it out, so the sitemap omits the
    // field rather than inventing one.
  }
}

const out = path.join(root, "app/lib/contentDates.json");
writeFileSync(out, JSON.stringify(dates, null, 2) + "\n");
console.log(`content-dates: wrote ${Object.keys(dates).length} dates`);
