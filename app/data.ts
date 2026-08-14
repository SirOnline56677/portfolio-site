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

/**
 * One frame in a `photo` piece. Unlike `versions` these are distinct
 * photographs, not takes on the same image, so each carries its own caption.
 * `w`/`h` are the file's real pixel dimensions — they reserve the right box
 * before the image loads, which matters when the frames are full-bleed and
 * mixed orientation.
 */
export type ExplorationPhoto = {
  image: string;
  caption?: string;
  w: number;
  h: number;
};

/**
 * Which popup layout a piece gets. Kept explicit rather than inferred from
 * `medium` so a new medium can't silently pick up a layout it was never
 * designed for.
 *
 * - `generative` — AI imagery. Square image with the take-switcher beneath it
 *   and the writing alongside. The switcher only appears at two or more images.
 * - `photo` — photography. Its own layout, not designed yet; until it exists
 *   these fall through to `generative`.
 */
export type ExplorationLayout = "generative" | "photo";

export type ExplorationPiece = {
  id: string;
  title: string;
  /** Defaults to `generative`. Photography must say so explicitly. */
  layout?: ExplorationLayout;
  /** Medium/tool — shown in the cursor pill on hover and as the tag in the popup. */
  medium: string;
  /** When it was made/shot — freeform ("March 2026", "Summer 2019", "2024"). */
  date?: string;
  description: string;
  image: string;
  /**
   * Label for `image` in the popup's version switcher. Defaults to "Original",
   * which is wrong for a set where the cover is just one variation among
   * equals — those pass their own ("v4", "Take 2"…).
   */
  coverLabel?: string;
  /** Alternate takes / iterations, switchable inside the popup. `generative`. */
  versions?: ExplorationVersion[];
  /** The frames of a photo essay, in order. `photo` layout only. */
  photos?: ExplorationPhoto[];
  /** World-space placement on the floating canvas (px at scale 1). */
  x: number;
  y: number;
  w: number;
  h: number;
};

// Pieces scattered across the /exploration floating canvas.
//
// Adding a group: drop the files in `public/exploration/<group>/` and add one
// entry below. Where a group is several takes on one idea it stays ONE piece —
// the cover goes in `image`, the rest in `versions`, and the popup switches
// between them. Entries still carrying "Placeholder —" copy are unfilled.
//
// Set `layout` to match the medium. Only `generative` is built; photography is
// getting its own and should not be filled in against this one.
export const explorationPieces: ExplorationPiece[] = [
  {
    id: "mj-footballer",
    title: "the striker",
    layout: "generative",
    medium: "Midjourney",
    date: "March 2026",
    // Stephen's own words. Blank lines separate paragraphs; `[label](href)` is
    // the only markup the popup understands.
    description: [
      "This started with the World Cup. I wanted to capture what makes the "
      + "game feel so alive: the speed, the movement, the constant change of "
      + "direction. That's where the lines came from. They're meant to feel "
      + "like traces of motion, almost like you're watching the path of a "
      + "player cutting across the field.",

      "Visually, I pulled inspiration from [Shin-chan](https://i.pinimg.com"
      + "/736x/9e/19/11/9e1911f38eb26a69e7ce7c58d9137a9b.jpg) creator Yoshito "
      + "Usui and his loose lines, strange shapes, and imperfect style. I also "
      + "kept coming back to Yoshihiro Togashi's work on [Hunter × Hunter]"
      + "(https://x.com/HxHSource/status/767924453279952896/photo/1), "
      + "especially the rougher, more expressive drawings from periods when "
      + "his health affected the manga's production.",

      "I liked that tension: something energetic and intentional, but still "
      + "raw. Not overly polished. Not trying to make every line perfect. The "
      + "imperfections are part of what gives it movement and personality.",
    ].join("\n\n"),
    image: "/exploration/footballer/04.png",
    coverLabel: "v4",
    versions: [
      { label: "v1", image: "/exploration/footballer/01.png" },
      { label: "v2", image: "/exploration/footballer/02.png" },
      { label: "v3", image: "/exploration/footballer/03.png" },
      { label: "v5", image: "/exploration/footballer/05.png" },
    ],
    x: 120, y: -620, w: 360, h: 360,
  },
  {
    id: "photo-japan-2016",
    title: "japan",
    layout: "photo",
    medium: "Fujifilm X100T",
    // EXIF puts the set at 23 Dec 2016 – 4 Jan 2017; the folder just says 2016.
    date: "December 2016 — January 2017",
    // Not rendered, on purpose. The photo popup shows `photo.caption` and only
    // falls back to this when a frame has none — and every frame here has one.
    // It stays as the set's own description, and as the safety net if a frame
    // is ever added without a caption.
    description: "Japan Trip Dec 2016 - Jan 2017",
    image: "/exploration/japan-2016/01.jpg",
    photos: [
      {
        image: "/exploration/japan-2016/01.jpg",
        w: 2400,
        h: 1600,
        caption:
          "8AM, wandering around the Ryōgoku District. Checking out the sumo "
          + "stables, just after the wrestlers' first workout.",
      },
      {
        image: "/exploration/japan-2016/02.jpg",
        w: 2400,
        h: 1338,
        caption:
          "The buzzing Dotonbori, empty at 8AM two days after Christmas.",
      },
      {
        image: "/exploration/japan-2016/03.jpg",
        w: 2400,
        h: 1522,
        caption: "Kiyomizu-dera on a rainy afternoon.",
      },
      {
        image: "/exploration/japan-2016/04.jpg",
        w: 2302,
        h: 2400,
        caption: "Stone steps up to Kiyomizu-dera.",
      },
      {
        image: "/exploration/japan-2016/05.jpg",
        w: 2400,
        h: 1600,
        caption: "The Kamo River on a grey December morning.",
      },
      {
        image: "/exploration/japan-2016/06.jpg",
        w: 2400,
        h: 1600,
        caption: "The cold and chrome of Tokyo.",
      },
      {
        image: "/exploration/japan-2016/07.jpg",
        w: 1810,
        h: 2400,
        caption: "Ginza, first light.",
      },
    ],
    x: 700, y: 560, w: 420, h: 280,
  },
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
  /** External link; the project name becomes an anchor when set. */
  url?: string;
};

export const currentlyWorkingOn: WorkingOn[] = [
  {
    name: "Palleta",
    description:
      "A point-of-sale and inventory app for a small wholesale distributor — live in production, headed to the App Store.",
    dates: "2026 — Now",
    status: "active",
    thumb: "/assets/palleta.png",
    url: "https://www.aguiladistributor.com/",
  },
  {
    name: "Grocery Market",
    description:
      "A grocery spending tracker that reads receipts with AI — snap a photo and every line item gets named, categorized, and priced over time.",
    dates: "2026 — Now",
    status: "active",
    thumb: "/assets/grocery-market.png",
  },
  {
    name: "This site",
    description: "The portfolio you're looking at, designed and built in the open.",
    dates: "2026 — Now",
    status: "active",
    thumb: "/assets/paper.png",
  },
];
