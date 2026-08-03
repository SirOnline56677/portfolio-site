import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CASE_STUDY_SLUGS,
  VARIANTS,
  VARIANT_LABELS,
  type CaseStudyMeta,
  type Variant,
} from "../../caseStudies";
import { v1 } from "../../../components/case-study/v1";
import { v2 } from "../../../components/case-study/v2";
import { v3 } from "../../../components/case-study/v3";
import type { Template } from "../../../components/case-study/types";

const TEMPLATES: Record<Variant, Template> = { v1, v2, v3 };

// 3 variants x 5 case studies = 15 pages, all prerendered. The variant lives in
// the path rather than a ?query so the route stays static — searchParams would
// force the whole thing dynamic.
export function generateStaticParams() {
  return VARIANTS.flatMap((variant) =>
    CASE_STUDY_SLUGS.map((slug) => ({ variant, slug })),
  );
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ variant: string; slug: string }>;
}) {
  const { variant, slug } = await params;

  if (!VARIANTS.includes(variant as Variant)) notFound();
  if (!CASE_STUDY_SLUGS.includes(slug as (typeof CASE_STUDY_SLUGS)[number])) notFound();

  // Dynamic import rather than filesystem routing: the MDX lives in content/,
  // so one route can render any case study in any of the three designs.
  const mod = (await import(`../../../../content/work/${slug}.mdx`)) as {
    default: (props: { components: Template["components"] }) => React.ReactElement;
    meta: CaseStudyMeta;
    sections: string[];
  };

  const { Shell, components } = TEMPLATES[variant as Variant];
  const Post = mod.default;

  return (
    <main className="relative min-h-screen w-full px-6 py-12 sm:py-16">
      {/* Temporary: lets the three candidate designs be compared on the same
          content. Goes away once one wins and this collapses to /work/[slug]. */}
      <div className="mx-auto mb-12 flex w-full max-w-[1200px] flex-wrap items-center gap-3">
        <span className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em] text-muted">
          Design
        </span>
        {VARIANTS.map((v) => (
          <Link
            key={v}
            href={`/work/${v}/${slug}`}
            className={`rounded-full border px-3 py-1 font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.12em] transition-colors ${
              v === variant
                ? "border-ink bg-ink text-paper"
                : "border-divider/50 text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {v} · {VARIANT_LABELS[v]}
          </Link>
        ))}
      </div>

      <Shell meta={mod.meta} sections={mod.sections}>
        <Post components={components} />
      </Shell>
    </main>
  );
}
