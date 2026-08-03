import type { MDXComponents } from "mdx/types";

// Required by @next/mdx in the App Router. Case studies pass their own
// component map per design variant (see app/components/case-study/), so this
// stays empty on purpose — anything set here would apply to every variant and
// defeat the comparison.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return components;
}
