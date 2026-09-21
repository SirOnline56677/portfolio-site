import Image from "next/image";
import type { FlowHeroProps } from "./types";
import { FlipDotMark, SCREEN_PAD_TOP, SHELL, WC_PAPER, boardGround, mono } from "./wristCheckBoard";

// The Wrist Check cover: the five-screen new-user flow on the flip-dot board.
// Same 1024x661 box the old Figure cover had. The phones stand along the
// bottom edge, centre one highest, and run off it, so the board reads as a
// counter they are set on rather than a frame they sit in. Sizes are container
// units off the figure, so the composition holds from phone width up.
//
// Chosen from four grounds (board / paper / red / boutique) in the
// "Wrist Check Hero Grounds" pitch; the wordmark was dropped at the same time.
const LIFT = ["5cqw", "2.5cqw", "0", "2.5cqw", "5cqw"];

export default function FlowHero({ screens, line }: FlowHeroProps) {
  return (
    <figure className="my-12" style={{ containerType: "inline-size" }}>
      <div
        className="relative overflow-clip rounded-[24px]"
        style={{ maxWidth: 1024, aspectRatio: "1024 / 661", ...boardGround("2.25cqw") }}
      >
        {/* Locked to the board: 13 cells wide at the board's own pitch, and
            offset so each of its dots sits where a resting dot would be. The
            mark is then dots on the board that have flipped, not a badge
            laid over it. */}
        <FlipDotMark className="absolute h-auto" style={{ top: "5.175cqw", left: "5.175cqw", width: "29.25cqw" }} />

        {line ? (
          <p
            className="absolute m-0 text-right uppercase"
            style={{ right: "5%", top: "6.4%", fontFamily: mono, fontSize: "1.45cqw", letterSpacing: "0.13em", opacity: 0.75 }}
          >
            {line.map((t) => (
              <span key={t} className="block">
                {t}
              </span>
            ))}
          </p>
        ) : null}

        <div
          className="absolute flex items-end justify-between"
          style={{ left: "4.5%", right: "4.5%", bottom: "-11%", gap: "2%" }}
        >
          {screens.map((s, i) => (
            <div
              key={s.src}
              className="flex-none overflow-clip"
              style={{
                width: "18.2%",
                transform: `translateY(${LIFT[i] ?? "0"})`,
                borderRadius: "4.2cqw",
                border: `0.95cqw solid ${SHELL}`,
                background: SHELL,
                boxShadow: "0 1.2cqw 3.2cqw rgba(0,0,0,0.32), 0 0 0 0.15cqw rgba(255,255,255,0.16), inset 0 0 0 0.2cqw #34373f",
              }}
            >
              <div className="overflow-clip" style={{ borderRadius: "3.3cqw", background: WC_PAPER, paddingTop: SCREEN_PAD_TOP }}>
                <Image
                  src={s.src}
                  width={s.w}
                  height={s.h}
                  alt={s.alt}
                  priority={i === 2}
                  sizes="(min-width: 1024px) 190px, 18vw"
                  className="block h-auto w-full"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </figure>
  );
}
