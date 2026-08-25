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

/** One phase of a project roadmap timeline. */
export type RoadmapPhase = {
  week: string;
  dates: string;
  name: string;
  items: string[];
};

export type RoadmapProps = {
  /** Small-caps line in the card head, e.g. "5 weeks · Mar 21 – Apr 23". */
  sub: string;
  phases: RoadmapPhase[];
};

/** One idea bubble on the brainstorm mindmap, in 900×560 logical space. */
export type MindmapNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  /** root = the center topic; spark = a starred/standout idea. */
  kind?: "root" | "idea" | "spark";
};

export type MindmapProps = {
  /** Small-caps line in the card head, e.g. the session date or prompt. */
  sub: string;
  nodes: MindmapNode[];
  /** Pairs of node ids to connect. */
  edges: [string, string][];
};

/** One competitor chip on the 2×2 positioning matrix, in 900×560 space. */
export type MatrixItem = {
  id: string;
  label: string;
  x: number;
  y: number;
  /** Brand mark rendered inside a white chip; `em` is display height. */
  img?: { src: string; w: number; h: number; em?: number };
  /** spark = the ident-red highlighted entrant. */
  kind?: "spark";
};

export type MatrixProps = {
  axes: { top: string; bottom: string; left: string; right: string };
  items: MatrixItem[];
};
