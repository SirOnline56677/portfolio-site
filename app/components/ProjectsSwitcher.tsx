"use client";

import { useState } from "react";
import ProjectGrid from "./ProjectGrid";
import ProjectGridB from "./ProjectGridB";

// Lets you compare the two project layouts:
//   A — the original 2-column grid
//   B — a loloagency-style 3-column square masonry
export default function ProjectsSwitcher() {
  const [view, setView] = useState<"A" | "B">("A");

  return (
    <div className="flex flex-col gap-6">
      {/* Toggle — echoes lolo's LIST / GALLERY pill */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-full bg-black/5 p-1 font-[family-name:var(--font-label)] text-[13px] uppercase tracking-wide">
          {(["A", "B"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full px-4 py-1.5 transition-colors ${
                view === v ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {v === "A" ? "Grid A" : "Grid B"}
            </button>
          ))}
        </div>
      </div>

      {view === "A" ? <ProjectGrid /> : <ProjectGridB />}
    </div>
  );
}
