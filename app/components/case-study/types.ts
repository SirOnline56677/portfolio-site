import type { MDXComponents } from "mdx/types";
import type { CaseStudyMeta, Section } from "../../work/caseStudies";

/** Props every variant's page shell receives. */
export type ShellProps = {
  meta: CaseStudyMeta;
  /** Section entries, exported by each MDX file, used for the section nav. */
  sections: Section[];
  children: React.ReactNode;
};

/** A design variant: how to wrap the page, and how to render the MDX inside it. */
export type Template = {
  Shell: (props: ShellProps) => React.ReactElement;
  components: MDXComponents;
};

/**
 * Content images carry their real pixel dimensions so next/image can reserve
 * the right space — markdown's `![]()` can't express that, and guessing a ratio
 * would shift the layout as each image loads.
 */
export type FigureProps = {
  src: string;
  w: number;
  h: number;
  alt?: string;
  caption?: string;
};
