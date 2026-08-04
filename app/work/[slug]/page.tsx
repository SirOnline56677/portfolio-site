import { notFound } from "next/navigation";
import { CASE_STUDY_SLUGS, type CaseStudyMeta } from "../caseStudies";
import { caseStudyTemplate } from "../../components/case-study/template";
import type { Template } from "../../components/case-study/types";

// One page per case study, all prerendered.
export function generateStaticParams() {
  return CASE_STUDY_SLUGS.map((slug) => ({ slug }));
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
    sections: string[];
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
