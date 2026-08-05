export type Project = {
  title: string;
  tag: string;
  description: string;
  image: string;
  href: string;
  /** Shown inside the cursor pill on hover — the kind of piece this is. */
  kind: "CASE STUDY" | "WEBSITE";
};

// The five real case studies, migrated from the Webflow site into
// content/work/*.mdx and rendered by app/work/[slug].
export const projects: Project[] = [
  {
    title: "wynnbet (free spins)",
    tag: "Mobile / Web",
    description:
      "Redesigned the Free Spins experience so players could find, track and use spins from anywhere on the platform.",
    image: "/work/wb-free-spins/cover.jpg",
    href: "/work/wb-free-spins",
    kind: "CASE STUDY",
  },
  {
    title: "wynnbet (leaderboards)",
    tag: "Mobile / Web",
    description:
      "Brought leaderboards out of the promotions tab onto their own page, with direct opt-in and visible expiry.",
    image: "/work/wb-leaderboards/cover.jpg",
    href: "/work/wb-leaderboards",
    kind: "CASE STUDY",
  },
  {
    title: "wynnbet (sportsbook)",
    tag: "Mobile / Web",
    description:
      "A modular sportsbook and casino platform serving 11 states, each with its own legal restrictions.",
    image: "/work/wb-sportsbook/cover.jpg",
    href: "/work/wb-sportsbook",
    kind: "CASE STUDY",
  },
  {
    title: "bingo ai",
    tag: "Mobile",
    description:
      "A voice-supported job matching platform for older adults. First-ever Innovation Jam Hackathon winner at Go Studio, InComm Payments.",
    image: "/work/bingo-ai-job-matching-platform-for-seniors/cover.jpg",
    href: "/work/bingo-ai-job-matching-platform-for-seniors",
    kind: "CASE STUDY",
  },
  {
    title: "wrist check",
    tag: "Mobile",
    description:
      "A peer-to-peer marketplace for luxury watches, built around authenticity, seller reputation and buyer education.",
    image: "/work/wrist-check-a-peer-to-peer-market-place/cover.jpg",
    href: "/work/wrist-check-a-peer-to-peer-market-place",
    kind: "CASE STUDY",
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

export type WorkingOn = {
  name: string;
  description: string;
  /** Freeform range, e.g. "2026 — Now". */
  dates: string;
  /** active = green dot, simmering = amber dot. */
  status: "active" | "simmering";
  /** Thumbnail that floats beside the cursor on hover. */
  thumb?: string;
};

export const currentlyWorkingOn: WorkingOn[] = [
  {
    name: "Palleta",
    description: "Placeholder — a line on what Palleta is.",
    dates: "2026 — Now",
    status: "active",
    thumb: "/assets/wynnbet.png",
  },
  {
    name: "This site",
    description: "The portfolio you're looking at, designed and built in the open.",
    dates: "2026 — Now",
    status: "active",
    thumb: "/assets/paper.png",
  },
];
