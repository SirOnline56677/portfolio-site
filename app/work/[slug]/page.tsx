import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_STUDY_SLUGS, type CaseStudyMeta, type Section } from "../caseStudies";
import { buildMetadata } from "../../lib/seo";
import { caseStudyTemplate } from "../../components/case-study/template";
import type { Template } from "../../components/case-study/types";

// One page per case study, all prerendered.
export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

/**
 * Search and share copy lives in app/lib/seo.ts, not here.
 *
 * This used to take the title from the MDX headline and the description from
 * the homepage card blurb. Both were stopgaps: two of those headlines ran past
 * 90 characters and were cut mid-phrase in search results, and the card blurbs
 * were written for a card. Each study now has copy written for where it is
 * actually read.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!CASE_STUDY_SLUGS.includes(slug as (typeof CASE_STUDY_SLUGS)[number])) {
    return {};
  }
  return buildMetadata(`/work/${slug}`);
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!CASE_STUDY_SLUGS.includes(slug as (typeof CASE_STUDY_SLUGS)[number])) {
    notFound();
  }

  // Dynamic import rather than filesystem routing: the MDX lives in content/,
  // so one route renders any case study.
  const mod = (await import(`../../../content/work/${slug}.mdx`)) as {
    default: (props: { components: Template["components"] }) => React.ReactElement;
    meta: CaseStudyMeta;
    sections: Section[];
  };

  const { Shell, components } = caseStudyTemplate;
  const Post = mod.default;

  return (
    <main className="relative min-h-screen w-full px-6 py-12 sm:py-16">
      <Shell meta={mod.meta} sections={mod.sections}>
        <Post components={components} />
      </Shell>
    </main>
  );
}
