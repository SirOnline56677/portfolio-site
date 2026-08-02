import { projects } from "../data";
import ProjectCard from "./ProjectCard";
import CarouselGroup from "./CarouselGroup";
import CarouselColumn from "./CarouselColumn";

// Two-column project carousel. At lg+ each column is an endless loop that
// drifts slowly and travels under the wheel, in opposite directions. Below lg
// it collapses to an ordinary stacked list and the duplicates are hidden.
//
// COPIES must satisfy (COPIES - 1) * period >= paneHeight. At the narrow end of
// lg a column period is ~990px against a ~900px pane, so 2 copies would leave
// only 10% margin; 3 gives ~2x. The engine warns in dev if this ever fails.
const COPIES = 3;

export default function ProjectGrid() {
  const left = projects.filter((_, i) => i % 2 === 0);
  const right = projects.filter((_, i) => i % 2 === 1);

  const track = (items: typeof projects, key: string) =>
    Array.from({ length: COPIES }, (_, c) =>
      items.map((p, i) => (
        <ProjectCard
          key={`${key}-${c}-${i}`}
          project={p}
          square
          decorative={c > 0}
        />
      )),
    );

  return (
    <CarouselGroup className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2">
      <CarouselColumn
        dir={1}
        copies={COPIES}
        className="flex flex-col gap-20"
      >
        {track(left, "l")}
      </CarouselColumn>
      {/* The stagger is padding below lg, but an offset at lg — padding would
          corrupt the period measurement and leave a void after each wrap. */}
      <CarouselColumn
        dir={-1}
        copies={COPIES}
        offset={-96}
        className="flex flex-col gap-20 sm:pt-24 lg:pt-0"
      >
        {track(right, "r")}
      </CarouselColumn>
    </CarouselGroup>
  );
}
