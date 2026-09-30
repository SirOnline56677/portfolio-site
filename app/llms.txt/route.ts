import { CASE_STUDY_SLUGS } from "../work/caseStudies";
import { projects } from "../data";
import { SITE_URL } from "../lib/siteUrl";

/**
 * llms.txt: a plain-text map of the site for language models, per the
 * llmstxt.org convention. It is an index rather than a content dump, which is
 * what the convention asks for; the everything-inlined variant has its own
 * name, llms-full.txt.
 *
 * Generated from the same slug list that builds the pages and the same card
 * blurbs the homepage shows, so it cannot drift from the site the way a
 * hand-written file would. The case studies have been rewritten repeatedly;
 * a static copy would already be stale.
 */
export const dynamic = "force-static";

export function GET(): Response {
  const studies = CASE_STUDY_SLUGS.map((slug) => {
    const card = projects.find((p) => p.href === `/work/${slug}`);
    const name = card?.title ? card.title.toUpperCase() : slug;
    return `- [${name}](${SITE_URL}/work/${slug}): ${card?.description ?? ""}`;
  }).join("\n");

  const body = `# Stephen Aguila

> Product designer. I design and ship, so decisions get answered in production, not in review.

A portfolio of product design case studies. Most of the work is about the same
problem: something was already built, and nobody could find it, trust it, or use
it. The site is built with Next.js and runs on Cloudflare Workers; the designer
writes the code as well as the design.

## Case studies

${studies}

## Other

- [Exploration](${SITE_URL}/exploration): Side projects and personal work — photography, imagery, branding studies and experiments across mediums.

## Contact

- Email: saguila21@gmail.com
- LinkedIn: https://www.linkedin.com/in/stephen-aguila-7b466967/
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
