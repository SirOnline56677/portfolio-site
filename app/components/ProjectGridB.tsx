import { projects } from "../data";
import ProjectCard from "./ProjectCard";
import ParallaxColumn from "./ParallaxColumn";

// Option B — loloagency-style 3-column masonry of square images, generous
// spacing, columns staggered and parallaxing at clearly different speeds.
export default function ProjectGridB() {
  const cols = [
    projects.filter((_, i) => i % 3 === 0),
    projects.filter((_, i) => i % 3 === 1),
    projects.filter((_, i) => i % 3 === 2),
  ];
  // Different start offsets (masonry stagger) and parallax speeds per column.
  const offsets = ["", "sm:pt-16", "sm:pt-32"];
  const speeds = [0.11, -0.03, -0.14];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3">
      {cols.map((items, c) => (
        <ParallaxColumn
          key={c}
          speed={speeds[c]}
          className={`flex flex-col gap-16 ${offsets[c]}`}
        >
          {items.map((p, i) => (
            <ProjectCard key={`${c}-${i}`} project={p} square />
          ))}
        </ParallaxColumn>
      ))}
    </div>
  );
}
