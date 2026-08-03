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
