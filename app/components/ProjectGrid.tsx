import { projects } from "../data";
import ProjectCard from "./ProjectCard";
import ParallaxColumn from "./ParallaxColumn";

// Two-column project grid. Split projects into two columns so they stagger
// like the Paper design (left column slightly offset from the right).
// The columns scroll at slightly different speeds (parallax) so they drift
// past each other, loloagency-style.
export default function ProjectGrid() {
  const left = projects.filter((_, i) => i % 2 === 0);
  const right = projects.filter((_, i) => i % 2 === 1);

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2">
      <ParallaxColumn speed={0.09} className="flex flex-col gap-12">
        {left.map((p, i) => (
          <ProjectCard key={`l-${i}`} project={p} />
        ))}
      </ParallaxColumn>
      <ParallaxColumn speed={-0.11} className="flex flex-col gap-12 sm:pt-16">
        {right.map((p, i) => (
          <ProjectCard key={`r-${i}`} project={p} />
        ))}
      </ParallaxColumn>
    </div>
  );
}
