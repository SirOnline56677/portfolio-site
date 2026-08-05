// The five case studies, in display order. Slugs match content/work/<slug>.mdx
// and the routes generated in app/work/[slug]/.
export const CASE_STUDY_SLUGS = [
  "wb-free-spins",
  "wb-leaderboards",
  "wb-sportsbook",
  "bingo-ai-job-matching-platform-for-seniors",
  "wrist-check-a-peer-to-peer-market-place",
] as const;

export type CaseStudySlug = (typeof CASE_STUDY_SLUGS)[number];

/**
 * An entry in a case study's section nav.
 *
 * A bare string means "this label is also the heading text", which holds for most
 * entries. Some nav labels deliberately group two headings or abbreviate one —
 * "Problem / Solution" points at an `## Problem`, "User Flow" at
 * `## User Flow (new user)` — and those carry an explicit target id instead.
 */
export type Section = string | { label: string; id: string };

/** "Research & Insights" → "research-insights" */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const sectionLabel = (s: Section): string =>
  typeof s === "string" ? s : s.label;

/**
 * The heading id a nav entry scrolls to. Headings are unique within each case
 * study (verified across all five), so these ids don't collide.
 */
export const sectionId = (s: Section): string =>
  typeof s === "string" ? slugify(s) : s.id;

/** Metadata each case study MDX file exports as `meta`. */
export type CaseStudyMeta = {
  title: string;
  client: string;
  role: string;
  duration: string;
  tools: string[];
  team?: string;
  responsibilities: string;
  cover: string;
};
