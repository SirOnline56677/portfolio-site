import { projects } from "../data";
import ProjectCard from "./ProjectCard";
import ParallaxColumn from "./ParallaxColumn";

// Two-column project grid with large square images and generous spacing
// (loloagency-style). Columns scroll at slightly different speeds (parallax)
// so they drift past each other.
export default function ProjectGrid() {
  const left = projects.filter((_, i) => i % 2 === 0);
  const right = projects.filter((_, i) => i % 2 === 1);

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2">
      <ParallaxColumn speed={0.09} className="flex flex-col gap-20">
        {left.map((p, i) => (
          <ProjectCard key={`l-${i}`} project={p} square />
        ))}
      </ParallaxColumn>
      <ParallaxColumn speed={-0.11} className="flex flex-col gap-20 sm:pt-24">
        {right.map((p, i) => (
          <ProjectCard key={`r-${i}`} project={p} square />
        ))}
      </ParallaxColumn>
    </div>
  );
}
