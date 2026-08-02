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
              `self-start` because a stretched grid item has no sticky travel. */}
          <div
            data-carousel-pane
            className="relative lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:self-start lg:overflow-clip lg:pl-8 lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-divider/40"
          >
            <ProjectGrid />
          </div>
        </div>
      </div>
    </main>
  );
}
