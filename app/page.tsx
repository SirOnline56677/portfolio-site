import LeftColumn from "./components/LeftColumn";
import ProjectGrid from "./components/ProjectGrid";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full">
      <div className="mx-auto w-full max-w-[1440px] px-6 py-12 sm:px-10 sm:py-[13px]">
        <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-[654px_1fr] lg:gap-x-10">
          {/* Left column */}
          <div className="lg:pt-[13px]">
            <LeftColumn />
          </div>

          {/* Vertical divider + right column */}
          <div className="relative lg:pl-10 lg:before:absolute lg:before:left-0 lg:before:top-0 lg:before:h-full lg:before:w-px lg:before:bg-divider/40">
            <div className="lg:pt-14">
              <ProjectGrid />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
