export type Project = {
  title: string;
  tag: string;
  description: string;
  image: string;
  /** Optional silent looping preview for the homepage card. */
  video?: string;
  /** Scale the card media without changing the card's square footprint. */
  mediaScale?: number;
  /** Choose whether card media fills the well or remains fully visible. */
  mediaFit?: "cover" | "contain";
  /** Optional homepage-card focal point for off-center artwork. */
  imagePosition?: string;
  href: string;
  /** Shown inside the cursor pill on hover — the kind of piece this is. */
  kind: "CASE STUDY" | "HACKATHON" | "WEBSITE";
};

// The five real case studies, migrated from the Webflow site into
// content/work/*.mdx and rendered by app/work/[slug].
export const projects: Project[] = [
  {
    title: "wynnbet (free spins)",
    tag: "Mobile / Web",
    description:
      "Free spins players were given, then lost without knowing. Making them visible before they expire.",
    image: "/work/wb-free-spins/wynnbet-free-spins-home-img-lite.webp",
    imagePosition: "50% 51%",
    href: "/work/wb-free-spins",
    kind: "CASE STUDY",
  },
  {
    title: "wynnbet (leaderboards)",
    tag: "Mobile / Web",
    description:
      "The competition was there. Finding it wasn't. Rethinking how players discover, join and follow leaderboard matches.",
    image: "/work/wb-leaderboards/tile-shuffle.png",
    video: "/work/wb-leaderboards/tile-shuffle.mp4",
    href: "/work/wb-leaderboards",
    kind: "CASE STUDY",
  },
  {
    title: "wynnbet (sportsbook)",
    tag: "Mobile / Web",
    description:
      "The launch of the redesigned sportsbook platform in 11 states, each with its own legal restrictions.",
    image: "/work/wb-sportsbook/sportsbook-evolution-poster.png",
    video: "/work/wb-sportsbook/sportsbook-evolution.mp4",
    mediaScale: 1,
    mediaFit: "cover",
    imagePosition: "50% 50%",
    href: "/work/wb-sportsbook",
    kind: "CASE STUDY",
  },
  {
    title: "bingo ai",
    tag: "Mobile",
    description:
      "A voice-supported job matching platform for retirees 65+. First-ever Innovation Jam Hackathon winner at Go Studio, InComm Payments.",
    image: "/work/bingo-ai-job-matching-platform-for-seniors/bingo-ident-poster.jpg",
    video: "/work/bingo-ai-job-matching-platform-for-seniors/bingo-ident.mp4",
    href: "/work/bingo-ai-job-matching-platform-for-seniors",
    kind: "HACKATHON",
  },
  {
    title: "wrist check",
    tag: "Mobile",
    description:
      "A peer-to-peer marketplace for luxury watches, built around authenticity, seller reputation and buyer education.",
    image: "/work/wrist-check-a-peer-to-peer-market-place/tile-wordmark.png",
    video: "/work/wrist-check-a-peer-to-peer-market-place/tile-wordmark.mp4",
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
 * - `photo` — photography. One frame full-bleed, the writing beneath it, the
 *   rest of the set as thumbnails alongside.
 * - `interactive` — a working build. The popup shows a screenshot full bleed
 *   with the writing beneath; the live demo opens full screen from a link.
 */
export type ExplorationLayout = "generative" | "photo" | "interactive";

/**
 * A self-contained static build in `public/`, opened full screen from an
 * `interactive` piece's popup. `w`/`h` are the window size it was designed for
 * — the size the piece's screenshot (`image`) was captured at.
 */
export type ExplorationDemo = {
  src: string;
  w: number;
  h: number;
  /** Shown beside the "Open full screen" link — what the demo is. */
  note?: string;
};

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
  /** The live build. `interactive` layout only. */
  demo?: ExplorationDemo;
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
// between them.
//
// Set `layout` to match the medium. Each one was designed for its own kind of
// work — don't put a piece in a layout built for something else.
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
    // Placement is deliberately tight while the field is this small: the
    // camera fits the whole world on load, so two pieces left where they were
    // (1460px apart) would have opened at about 37% and read as two stamps in
    // an empty room. Spread them back out as more land.
    x: -260, y: -180, w: 360, h: 360,
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
    x: 180, y: -140, w: 420, h: 280,
  },
  {
    id: "strikeline",
    title: "strikeline",
    layout: "interactive",
    medium: "React · Python",
    // DRAFT — written from the demo page's own copy, for Stephen to edit.
    description: [
      "Strikeline is a day-trading desk I built for myself, for buying calls "
      + "and puts on one account through the Schwab Trader API. It streams the "
      + "option chain and one-minute candles, and gets me into a contract with "
      + "one click, or by dragging an order straight onto the chart.",

      "Speed was the point, but so was restraint. I set the rules: a max daily "
      + "loss, contracts per order, open contracts. The app refuses any order "
      + "that breaks them. Hit the daily loss and new entries lock for the rest "
      + "of the day; closing out still works.",

      "Before it was allowed to place a single order, it ran read-only against "
      + "the real account for a full trading week, logging every market minute.",
    ].join("\n\n"),
    // A screenshot of the demo at its designed 1600×940, captured at 2× and
    // downsized. Used for both the canvas tile and the popup; the live demo
    // only runs full screen.
    image: "/exploration/strikeline/cover.webp",
    demo: {
      src: "/exploration/strikeline/demo/index.html",
      w: 1600,
      h: 940,
      note: "Live demo on simulated market data · no real orders are placed",
    },
    x: -120, y: 240, w: 480, h: 282,
  },
];

export const stack = {
  designing: [
    { name: "Figma", icon: "/assets/figma.png", width: 27, height: 27, gap: 15 },
    { name: "Paper", icon: "/assets/paper.png", width: 34, height: 34, gap: 11 },
  ],
  building: [
    { name: "Claude", icon: "/assets/claude.png", width: 34, height: 32, gap: 12 },
    { name: "Codex", icon: "/assets/codex.png", width: 30, height: 30, gap: 10 },
  ],
};

export type WorkingOn = {
  name: string;
  description: string;
  /** Freeform range, e.g. "2026 — Now". */
  dates: string;
  /** active = green dot ("Incubation"), simmering = amber dot ("Seeding"). */
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
    name: "Grocery Market (temporary name)",
    description:
      "A grocery spending tracker that reads receipts with AI — snap a photo and every line item gets named, categorized, and priced over time.",
    dates: "2026 — Now",
    status: "simmering",
    thumb: "/assets/grocery-market.png",
  },
];
