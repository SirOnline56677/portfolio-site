import type { MetadataRoute } from "next";
import { CASE_STUDY_SLUGS } from "./work/caseStudies";
import { SITE_URL } from "./lib/siteUrl";
import contentDates from "./lib/contentDates.json";

/**
 * Built from CASE_STUDY_SLUGS rather than the project list in data.ts. Both
 * name the same five routes, but the slug list is what actually generates the
 * pages, so a study added there can never be missing from here.
 *
 * Dates come from contentDates.json, written by scripts/content-dates.mjs from
 * git history before the build. They cannot be looked up here: this route runs
 * inside the Worker, which has no filesystem and no git, so both a file mtime
 * and a git call fall back to the current time and every deploy would claim all
 * seven pages changed. A sitemap that cries wolf is one search engines learn to
 * ignore, so a missing date is left missing instead.
 */
const dates: Record<string, string> = contentDates;
const when = (file: string) =>
  dates[file] ? new Date(dates[file]) : undefined;

export default function sitemap(): MetadataRoute.Sitemap {
  const studies = CASE_STUDY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: when(`content/work/${slug}.mdx`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: when("app/page.tsx"),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/exploration`,
      lastModified: when("app/exploration/page.tsx"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...studies,
  ];
}
