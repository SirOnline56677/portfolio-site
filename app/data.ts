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
