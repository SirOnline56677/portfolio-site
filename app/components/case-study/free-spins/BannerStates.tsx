"use client";

import ScaledScreen from "./ScaledScreen";
import { LobbyScreen } from "./SpinsPrototype";

// Results: the casino lobby with zero active free spins beside the same
// lobby with the FREE(SPINS) banner live. Rendered from the same components
// as the prototype, so the comparison stays crisp at any size.
const noop = () => {};

function Phone({ banner }: { banner: boolean }) {
  return (
    <div
      className="overflow-clip rounded-[44px] border-[10px]"
      style={{
        borderColor: "#17191f",
        background: "#17191f",
        boxShadow:
          "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 2px #34373f",
      }}
    >
      <div className="relative overflow-clip rounded-[34px] bg-white">
        <ScaledScreen designW={375} shownH={812}>
          <LobbyScreen onBanner={noop} active={false} showBanner={banner} />
        </ScaledScreen>
      </div>
    </div>
  );
}

export default function BannerStates() {
  return (
    <div className="my-12 rounded-[24px] p-5 sm:p-8" style={{ background: "#ffffff" }}>
      <div className="mx-auto flex max-w-[640px] flex-col items-center justify-center gap-10 sm:flex-row sm:items-start sm:gap-8">
        {[
          [false, "Zero active free spins"],
          [true, "Active free spins"],
        ].map(([banner, label]) => (
          <div key={String(banner)} className="w-2/3 max-w-[280px] sm:w-1/2 sm:max-w-none">
            <Phone banner={banner as boolean} />
            <p
              className="mt-4 text-center font-[family-name:var(--font-label)] text-label uppercase tracking-[0.05em]"
              style={{ color: "#666" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
