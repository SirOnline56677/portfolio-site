import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_STUDY_SLUGS, type CaseStudyMeta, type Section } from "../caseStudies";
import { projects } from "../../data";
import { caseStudyTemplate } from "../../components/case-study/template";
import type { Template } from "../../components/case-study/types";

// One page per case study, all prerendered.
export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
}

/**
 * Without this every case study inherited the root title, so all five pages
 * looked identical to a search engine and to anyone sharing a link.
 *
 * The title comes from the MDX, which is where the case study's own headline
 * already lives. The description reuses the card blurb from the project list
 * rather than inventing a second one: those lines are written problem-first
 * and are the best short summary of each study that exists.
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

  const { meta } = (await import(`../../../content/work/${slug}.mdx`)) as {
    meta: CaseStudyMeta;
  };
  const card = projects.find((p) => p.href === `/work/${slug}`);

  return {
    title: `${meta.title} — Stephen Aguila`,
    description: card?.description,
    alternates: { canonical: `/work/${slug}` },
  };
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
