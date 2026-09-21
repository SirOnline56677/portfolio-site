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

/**
 * A looping clip used the way `Figure` uses a still. Unlike Figure, `w`/`h`
 * describe the box to crop TO, not the file's own dimensions: the source fills
 * that box and is cropped, so a square tile can sit at a landscape size.
 */
export type VideoProps = {
  src: string;
  /**
   * Frame shown until playback starts, whenever autoplay is refused, and as
   * the whole story under reduced motion — so it is required, not optional.
   */
  poster: string;
  w: number;
  h: number;
  /** object-position, for choosing which part of the source the crop keeps. */
  focus?: string;
  /** `<video>` takes no alt; this is announced in its place. Required, since
   *  a figure that opens a section is never decorative. */
  alt: string;
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

/**
 * A desktop + mobile screenshot pair shown in the Free Spins device shells.
 * The alt describes the screen once: the phone shot is the same screen, so it
 * is marked decorative rather than announced twice.
 */
export type ScreenPairProps = {
  desktopSrc: string;
  desktopW: number;
  desktopH: number;
  mobileSrc: string;
  mobileW: number;
  mobileH: number;
  alt: string;
  /** Browser tab label and address bar text on the desktop shell. */
  tab?: string;
  url?: string;
  /**
   * Breathing room above the phone shot, in that image's own pixels, filled
   * with `mobilePadColor`. Some captures crop tight to the app header and sit
   * against the bezel; this gives the header the space the design had.
   */
  mobilePadTop?: number;
  mobilePadColor?: string;
  caption?: string;
};

/** One phone screen for ScreenRow / FlowHero: the exported frame and a sentence saying what it shows. */
export type Screen = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Short name shown as a mono tag above the phone, e.g. "Market". */
  label?: string;
};

/**
 * Phone screens in the iPhone shell, on the study's ground. `board` is the
 * Wrist Check flip-dot board, `paper` its paper, `page` no card at all.
 * `flow` draws an arrow between phones for a step-by-step strip.
 */
export type ScreenRowProps = {
  screens: Screen[];
  caption?: string;
  stage?: "board" | "paper" | "page";
  flow?: boolean;
};

/** The Wrist Check cover: five screens along the bottom of the flip-dot board. */
export type FlowHeroProps = {
  screens: Screen[];
  /** Mono lines set top-right, one per entry. */
  line?: string[];
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

/** One Wrist Check primary per interviewee, by role. */
export type InterviewTone = "red" | "blue" | "yellow";

export type Interview = {
  name: string;
  /** e.g. "Buyer", "Trader", "Seller". */
  role: string;
  tone: InterviewTone;
  /** e.g. "Interview 1": the order the conversations happened in. */
  label: string;
  /** One-line stance, closed with a red period by the component — omit end punctuation. */
  stance: string;
  body: string[];
  img: { src: string; w: number; h: number };
};

/** Sticky-portrait interview rail (Wrist Check user interviews). */
export type InterviewRailProps = {
  interviews: Interview[];
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

/** A step on the research track: inside the five-day window, or one of the dated events after it. */
export type ResearchStepKind = "window" | "event" | "ok";

export type ResearchStep = {
  /** Small mono label above: a stage name inside the window, a date for events. */
  when: string;
  /** Bold lead-in (window) or the display-face verdict word (events). */
  lead: string;
  text: string;
  kind: ResearchStepKind;
};

/** Research track: the five-day window then the dated events (Wrist Check infield research). */
export type ResearchTrackProps = {
  windowLabel: string;
  steps: ResearchStep[];
};

export type LotFlag = { label: string; tone: "red" | "green" | "blue" };

/** Auction-style lot card for the watch bought during infield research. */
export type LotCardProps = {
  lot: string;
  title: string;
  subtitle: string;
  hammer: { label: string; amount: string; note: string };
  /** Spec rows; `strong` renders medium weight before `v`. */
  specs: { k: string; v?: string; strong?: string; flag?: LotFlag }[];
  /** Sentence after the bold "Provenance." lead. */
  provenance: string;
  /**
   * The documents. The first one opens in the big frame; the thumbnails
   * swap it. `fit: "contain"` mats a screenshot or a page instead of
   * cropping it; `focus` is the object-position for the 64px square thumb.
   */
  figs: LotFig[];
};

export type LotFig = {
  src: string;
  w: number;
  h: number;
  alt: string;
  label: string;
  fit?: "cover" | "contain";
  focus?: string;
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
