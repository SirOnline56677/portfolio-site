import Image from "next/image";
import type { ScreenRowProps } from "./types";
import { SCREEN_PAD_TOP, SHELL, WC_INK, WC_PAPER, boardGround, mono } from "./wristCheckBoard";

// One to a handful of phone screens in the iPhone shell the Free Spins pair
// uses, on the study's own ground. Mobile-only studies had no home for a
// bare phone shot: ScreenPair wants a desktop half, Figure caps at the file's
// width. Server component, nothing animates. Wide rows scroll sideways in
// their own box the way PriceRuler and CapabilityBoard do.
export default function ScreenRow({ screens, caption, stage = "board", flow = false }: ScreenRowProps) {
  const centred = screens.length <= 2;
  const ground =
    stage === "board"
      ? boardGround("23px")
      : stage === "paper"
        ? { background: WC_PAPER, color: WC_INK }
        : undefined;
  return (
    <figure className="my-12">
      <div
        className={
          "overflow-x-auto [scrollbar-width:none] " +
          (stage === "page" ? "" : "rounded-[20px] px-7 py-6")
        }
        style={ground}
      >
        <div className={"flex min-w-full items-start gap-6 " + (centred ? "w-full justify-center" : "w-max")}>
          {screens.map((s, i) => (
            <div key={s.src} className="contents">
              {flow && i > 0 ? (
                <div
                  aria-hidden
                  className="mt-6 w-7 flex-none self-center text-center text-lg opacity-70"
                  style={{ fontFamily: mono }}
                >
                  →
                </div>
              ) : null}
              <div className="grid w-[200px] flex-none gap-2.5 sm:w-[220px] md:w-[240px]">
                {s.label ? (
                  <div
                    className="flex justify-between text-[11px] uppercase tracking-[0.08em] opacity-60"
                    style={{ fontFamily: mono }}
                  >
                    {/* Step numbers only mean something on a flow strip. */}
                    {flow ? <span>{String(i + 1).padStart(2, "0")}</span> : null}
                    <span>{s.label}</span>
                  </div>
                ) : null}
                <div
                  className="overflow-clip rounded-[44px] border-[10px]"
                  style={{
                    borderColor: SHELL,
                    background: SHELL,
                    boxShadow:
                      "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 2px #34373f",
                  }}
                >
                  <div className="overflow-clip rounded-[34px]" style={{ background: WC_PAPER, paddingTop: SCREEN_PAD_TOP }}>
                    <Image
                      src={s.src}
                      width={s.w}
                      height={s.h}
                      alt={s.alt}
                      sizes="(min-width: 768px) 240px, 60vw"
                      className="block h-auto w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {caption ? (
        <figcaption className="mt-3 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
