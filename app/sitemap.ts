import type { MetadataRoute } from "next";
import { stat } from "node:fs/promises";
import path from "node:path";
import { CASE_STUDY_SLUGS } from "./work/caseStudies";
import { SITE_URL } from "./lib/siteUrl";

/**
 * Built from CASE_STUDY_SLUGS rather than the project list in data.ts. Both
 * name the same five routes, but the slug list is what actually generates the
 * pages, so a study added there can never be missing from here.
 *
 * lastModified comes from each MDX file's mtime, so an edit to a case study
 * shows up as a real date instead of a build timestamp that claims every page
 * changed on every deploy.
 */
async function lastModified(slug: string): Promise<Date> {
  try {
    const file = path.join(process.cwd(), "content", "work", `${slug}.mdx`);
    return (await stat(file)).mtime;
  } catch {
    // The Worker bundles the MDX at build time rather than shipping the source
    // tree, so a missing file here is expected rather than a fault.
    return new Date();
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const studies = await Promise.all(
    CASE_STUDY_SLUGS.map(async (slug) => ({
      url: `${SITE_URL}/work/${slug}`,
      lastModified: await lastModified(slug),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/exploration`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...studies,
  ];
}
