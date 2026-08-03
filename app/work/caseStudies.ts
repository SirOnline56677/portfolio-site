// The five case studies, in display order. Slugs match content/work/<slug>.mdx
// and the routes generated in app/work/[variant]/[slug]/.
export const CASE_STUDY_SLUGS = [
  "wb-free-spins",
  "wb-leaderboards",
  "wb-sportsbook",
  "bingo-ai-job-matching-platform-for-seniors",
  "wrist-check-a-peer-to-peer-market-place",
] as const;

export type CaseStudySlug = (typeof CASE_STUDY_SLUGS)[number];

/** The three candidate designs, rendered from identical MDX for comparison. */
export const VARIANTS = ["v1", "v2", "v3"] as const;
export type Variant = (typeof VARIANTS)[number];

export const VARIANT_LABELS: Record<Variant, string> = {
  v1: "In-system",
  v2: "Webflow-alike",
  v3: "Mix",
};

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
