import type { MetadataRoute } from "next";
import { execFileSync } from "node:child_process";
import { CASE_STUDY_SLUGS } from "./work/caseStudies";
import { SITE_URL } from "./lib/siteUrl";

/**
 * Built from CASE_STUDY_SLUGS rather than the project list in data.ts. Both
 * name the same five routes, but the slug list is what actually generates the
 * pages, so a study added there can never be missing from here.
 *
 * lastModified comes from the last commit that touched each MDX file. This runs
 * during `next build`, where git and the working tree exist; the route is
 * prerendered, so nothing here executes in the Worker, which has neither.
 *
 * When that lookup fails the field is omitted rather than filled with the
 * current time. A build timestamp would claim every page changed on every
 * deploy, and a sitemap that cries wolf is one search engines learn to ignore.
 * An absent lastmod is valid and simply tells them nothing.
 */
function lastCommitDate(file: string): Date | undefined {
  try {
    const iso = execFileSync("git", ["log", "-1", "--format=%cI", "--", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return iso ? new Date(iso) : undefined;
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const studies = CASE_STUDY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/work/${slug}`,
    lastModified: lastCommitDate(`content/work/${slug}.mdx`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: lastCommitDate("app/page.tsx"),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/exploration`,
      lastModified: lastCommitDate("app/exploration/page.tsx"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...studies,
  ];
}
