// A Chrome-style browser window and an iPhone side by side in a Figure-style
// well, showing the same product moment (the joshglucas.com/ai-mode layout).
// The well chrome uses theme tokens and inverts; the device shells are part
// of the framed object and stay fixed.

const ICON = "#5f6368";

function ChromeTopBar() {
  return (
    <div style={{ background: "#DEE1E6" }}>
      <div className="relative flex h-[30px] items-end pl-[74px]">
        <div className="absolute left-[12px] top-1/2 flex -translate-y-1/2 gap-[6px]">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <span key={c} className="h-[9px] w-[9px] rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex h-[24px] items-center gap-[6px] rounded-t-[8px] bg-white px-[12px]">
          <span
            className="flex h-[12px] w-[12px] items-center justify-center rounded-full text-[7px] font-bold text-white"
            style={{ background: "#c38e2c" }}
          >
            W
          </span>
          <span className="text-[10px] font-medium" style={{ color: "#3c4043" }}>
            WynnBET | My Account
          </span>
          <svg width={7} height={7} viewBox="0 0 8 8" aria-hidden>
            <path d="M1 1l6 6M7 1L1 7" stroke={ICON} strokeWidth={1.2} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="flex h-[32px] items-center gap-[10px] border-b bg-white px-[12px]" style={{ borderColor: "#e8eaed" }}>
        <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden>
          <path d="M8 1 3 6l5 5" fill="none" stroke={ICON} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden style={{ opacity: 0.45 }}>
          <path d="M4 1l5 5-5 5" fill="none" stroke={ICON} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width={12} height={12} viewBox="0 0 12 12" aria-hidden>
          <path d="M10.5 6a4.5 4.5 0 1 1-1.4-3.3M9.5 0.6v2.6H7" fill="none" stroke={ICON} strokeWidth={1.4} strokeLinecap="round" />
        </svg>
        <div className="flex h-[20px] min-w-0 flex-1 items-center gap-[6px] rounded-full px-[10px]" style={{ background: "#F1F3F4" }}>
          <svg width={9} height={11} viewBox="0 0 10 12" aria-hidden>
            <rect x={1} y={5} width={8} height={6.5} rx={1.4} fill={ICON} />
            <path d="M3 5V3.6a2 2 0 0 1 4 0V5" fill="none" stroke={ICON} strokeWidth={1.3} />
          </svg>
          <span className="truncate text-[10px]" style={{ color: "#3c4043" }}>
            wynnbet.com/account/bonus-spins
          </span>
        </div>
        <span
          className="flex h-[16px] w-[16px] items-center justify-center rounded-full text-[8px] font-bold text-white"
          style={{ background: "#c38e2c" }}
        >
          J
        </span>
      </div>
    </div>
  );
}

export default function DevicePair({
  desktop,
  mobile,
}: {
  desktop: React.ReactNode;
  mobile: React.ReactNode;
}) {
  return (
    // Fixed white stage in both themes — the mockups sit on the same clean
    // ground whether the page is light or dark; the window's hairline ring
    // and shadows keep its edge readable on white.
    <div className="my-12 rounded-[24px] p-5 sm:p-8" style={{ background: "#ffffff" }}>
      <div className="flex flex-col-reverse items-center gap-8 sm:flex-row sm:items-start sm:gap-6 md:gap-8">
        <div className="w-full min-w-0 sm:basis-[66%]">
          {/* rims read on both grounds: hairline dark on the light well, a
              faint light ring so the window edge holds on the dark well */}
          <div
            className="overflow-clip rounded-[10px] bg-white"
            style={{
              boxShadow:
                "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.10), 0 0 0 2px rgba(255,255,255,0.10)",
            }}
          >
            <ChromeTopBar />
            {desktop}
          </div>
        </div>
        <div className="w-3/5 max-w-[240px] flex-none sm:w-auto sm:basis-[26%]">
          <div
            className="overflow-clip rounded-[44px] border-[10px]"
            style={{
              borderColor: "#17191f",
              background: "#17191f",
              boxShadow:
                "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 2px #34373f",
            }}
          >
            <div className="relative overflow-clip rounded-[34px] bg-white">{mobile}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
