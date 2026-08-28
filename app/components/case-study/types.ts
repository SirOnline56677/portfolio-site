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

/** One Problem Space card; `art` keys a built-in ident-geometry SVG. */
export type ProblemSpaceItem = {
  title: string;
  copy: string;
  art: "savings" | "eclipse" | "drift";
};

export type ProblemSpaceProps = {
  items: ProblemSpaceItem[];
};

/** Persona dossier card content. */
export type PersonaProps = {
  name: string;
  /** After the name, e.g. "67 · Retired". */
  meta: string;
  chips: string[];
  /** Rendered in quote marks with a red closing period — omit end punctuation. */
  quote: string;
  bio: string;
  goals: string[];
  worries: string[];
  /** Avatar cutout, shown on a cream disc. */
  img: { src: string; w: number; h: number };
};

/** A competitor column on the feature-comparison cards. */
export type CompareBook = {
  name: string;
  logo: { src: string; w: number; h: number };
  /** Render the logo chip on the brand's dark ground (light-on-dark marks). */
  dark?: boolean;
};

/** One animated Bonus Spins product moment, on a desktop + phone pair. */
export type FreeSpinsMomentProps = {
  /** Which micro-story plays: finding the page, or a spin completing. */
  story: "account" | "spins";
  caption?: string;
};

export type CompareCardsProps = {
  books: CompareBook[];
  features: {
    statement: string;
    /** One entry per book, same order. */
    offers: boolean[];
    /** Optional caption under the rows, e.g. naming the odd one out. */
    note?: string;
  }[];
};

/** "Who does what" capability board (competitor analysis). */
export type CapabilityBoardProps = {
  title: string;
  byline: string;
  /** Capability groups; span = number of columns covered. */
  groups: { label: string; color: string; labelColor?: string; span: number }[];
  /** Column headings; use \n for two-line heads. */
  columns: string[];
  rows: { name: string; caps: boolean[]; note?: string }[];
  /** The product's highlighted row. */
  highlight: { name: string; caps: boolean[] };
  punchline: string;
};

/** Approach shortlist on a budget axis. */
export type PriceRulerProps = {
  caption: string;
  min: number;
  max: number;
  /** Brands placed at their entry price along the axis. */
  items: { name: string; value: number }[];
  /** The over-budget outlier pinned past the ceiling. */
  over: string;
  footnote: string;
};
