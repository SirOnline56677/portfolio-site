import LeftColumn from "./components/LeftColumn";
import ProjectGrid from "./components/ProjectGrid";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full">
      {/* Full-width, edge-to-edge with ~24px margins (loloagency-style) */}
      <div className="w-full px-6 py-12 sm:py-6">
        <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-[654px_1fr] lg:gap-x-8">
          {/* Left column */}
          <div className="lg:pt-[13px]">
            <LeftColumn />
          </div>

          {/* Vertical divider + right column.
              At lg the pane pins beside the scrolling left column and clips the
              looping tracks. `overflow-clip` rather than `hidden` on purpose:
              `hidden` makes a scroll container, and a focused off-screen card
              would set scrollTop and permanently desync the transform math.
              `self-start` because a stretched grid item has no sticky travel.

              Full-bleed vertically so the columns read as passing *through* the
              viewport: `-my-6` pulls the pane out of the wrapper's 24px vertical
              padding so it's already flush at scrollY 0 (top-0 alone wouldn't
              be — sticky hasn't engaged yet), then h-screen reaches the bottom
              edge exactly. The negative BOTTOM margin is load-bearing too: it
              gives back the 24px of sticky travel the negative top margin costs,
              otherwise the pane un-pins early and opens a gap at the foot of the
              page. */}
          <div
            data-carousel-pane
            className="relative lg:sticky lg:top-0 lg:-my-6 lg:h-screen lg:self-start lg:overflow-clip lg:pl-8 lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-divider/40"
          >
            <ProjectGrid />
          </div>
        </div>
      </div>
    </main>
  );
}
