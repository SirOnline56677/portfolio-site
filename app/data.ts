export type Project = {
  title: string;
  tag: string;
  description: string;
  image: string;
  href: string;
  /** Shown inside the cursor pill on hover — the kind of piece this is. */
  kind: "CASE STUDY" | "WEBSITE";
};

// Case studies shown in the right-hand grid.
// Placeholder imagery/copy carried over from the Paper design — swap per project.
export const projects: Project[] = [
  {
    title: "bingo ai",
    tag: "Mobile / Web",
    description:
      "Led WynnBET's flexible, seamless sportsbook and casino redesign across 11 states with varying regulations.",
    image: "/assets/wynnbet.png",
    href: "#",
    kind: "CASE STUDY",
  },
  {
    title: "bingo ai",
    tag: "Mobile / Web",
    description:
      "Led WynnBET's flexible, seamless sportsbook and casino redesign across 11 states with varying regulations.",
    image: "/assets/wynnbet.png",
    href: "#",
    kind: "WEBSITE",
  },
  {
    title: "wynnbet (sportsbook)",
    tag: "Mobile / Web",
    description:
      "Led WynnBET's flexible, seamless sportsbook and casino redesign across 11 states with varying regulations.",
    image: "/assets/wynnbet.png",
    href: "#",
    kind: "CASE STUDY",
  },
  {
    title: "bingo ai",
    tag: "Mobile / Web",
    description:
      "Led WynnBET's flexible, seamless sportsbook and casino redesign across 11 states with varying regulations.",
    image: "/assets/wynnbet.png",
    href: "#",
    kind: "WEBSITE",
  },
  {
    title: "wynnbet (sportsbook)",
    tag: "Mobile / Web",
    description:
      "Led WynnBET's flexible, seamless sportsbook and casino redesign across 11 states with varying regulations.",
    image: "/assets/wynnbet.png",
    href: "#",
    kind: "CASE STUDY",
  },
  {
    title: "bingo ai",
    tag: "Mobile / Web",
    description:
      "Led WynnBET's flexible, seamless sportsbook and casino redesign across 11 states with varying regulations.",
    image: "/assets/wynnbet.png",
    href: "#",
    kind: "WEBSITE",
  },
];

export type ExplorationVersion = {
  label: string;
  image: string;
};

export type ExplorationPiece = {
  id: string;
  title: string;
  /** Medium/tool — shown in the cursor pill on hover and as the tag in the popup. */
  medium: string;
  /** When it was made/shot — freeform ("March 2026", "Summer 2019", "2024"). */
  date?: string;
  description: string;
  image: string;
  /** Alternate takes / iterations, switchable inside the popup. */
  versions?: ExplorationVersion[];
  /** World-space placement on the floating canvas (px at scale 1). */
  x: number;
  y: number;
  w: number;
  h: number;
};

// Pieces scattered across the /exploration floating canvas.
// Placeholder imagery/copy — swap per piece, same as `projects` above.
export const explorationPieces: ExplorationPiece[] = [
  {
    id: "photo-01",
    title: "untitled 01",
    medium: "35mm",
    date: "August 2026",
    description:
      "Placeholder — a frame caught while out in the world. Swap in the real photo and the story behind it.",
    image: "/assets/wynnbet.png",
    x: 0, y: 0, w: 380, h: 380,
  },
  {
    id: "photo-02",
    title: "untitled 02",
    medium: "Digital",
    description:
      "Placeholder — light study. Swap in the real photo and the story behind it.",
    image: "/assets/wynnbet.png",
    x: 520, y: -180, w: 300, h: 400,
  },
  {
    id: "mj-01",
    title: "study 01",
    medium: "Midjourney",
    date: "July 2026",
    description:
      "Placeholder — an image conjured in Midjourney. The versions below are earlier iterations of the same prompt.",
    image: "/assets/wynnbet.png",
    versions: [
      { label: "v2", image: "/assets/claude.png" },
      { label: "v1", image: "/assets/codex.png" },
    ],
    x: -460, y: -260, w: 320, h: 240,
  },
  {
    id: "mj-02",
    title: "study 02",
    medium: "Midjourney",
    description:
      "Placeholder — prompt iteration, happy accident kept on purpose.",
    image: "/assets/wynnbet.png",
    x: 980, y: 120, w: 360, h: 360,
  },
  {
    id: "brand-01",
    title: "mark 01",
    medium: "Identity",
    description:
      "Placeholder — identity system for a real or imagined brand. The versions show the wordmark and the reversed lockup.",
    image: "/assets/figma.png",
    versions: [{ label: "Wordmark", image: "/assets/paper.png" }],
    x: -820, y: 60, w: 280, h: 350,
  },
  {
    id: "brand-02",
    title: "mark 02",
    medium: "Wordmark",
    description: "Placeholder — type study.",
    image: "/assets/paper.png",
    x: 240, y: 420, w: 420, h: 300,
  },
  {
    id: "exp-01",
    title: "experiment 01",
    medium: "Motion",
    description:
      "Placeholder — personal exploration in motion. Swap for a still and link out to the clip.",
    image: "/assets/claude.png",
    x: -350, y: 520, w: 300, h: 300,
  },
  {
    id: "exp-02",
    title: "experiment 02",
    medium: "Code",
    description: "Placeholder — a sketch built in code.",
    image: "/assets/codex.png",
    x: 760, y: -520, w: 280, h: 210,
  },
  {
    id: "photo-03",
    title: "untitled 03",
    medium: "35mm",
    description:
      "Placeholder — a frame caught while out in the world.",
    image: "/assets/wynnbet.png",
    x: -900, y: -560, w: 340, h: 430,
  },
  {
    id: "exp-03",
    title: "experiment 03",
    medium: "Print",
    description: "Placeholder — print exploration.",
    image: "/assets/paper.png",
    x: 1300, y: -300, w: 260, h: 260,
  },
];

export const stack = {
  designing: [
    { name: "Figma", icon: "/assets/figma.png" },
    { name: "Paper", icon: "/assets/paper.png" },
  ],
  building: [
    { name: "Claude", icon: "/assets/claude.png" },
    { name: "Codex", icon: "/assets/codex.png" },
  ],
};

export const currentlyWorkingOn = ["Palleta —", "Palleta —"];
