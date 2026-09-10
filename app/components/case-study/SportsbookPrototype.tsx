"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ScaledScreen from "./free-spins/ScaledScreen";
import { GOLD, NAVY, sans, display } from "./free-spins/wb";

// The A-Z restructure, from the Figma file RcnTRw6KJFwSuEeRw8mReb: the home
// state (714:12598), Football opened in the sidebar (714:13575), the Live tab
// (714:14199) and Baseball (714:15257).
//
// Hybrid, deliberately: the header, the A-Z sidebar and the tab row are real
// markup, because they are what the restructure *is* and what a reader needs
// to click. The game tables under them are the frames' own pixels — four
// slices — since hand-building twenty rows of three-column odds four times
// over would buy fidelity we already have for free.
//
// Every coordinate is the frame's own 1728px space; ScaledScreen fits it to
// the column. Measured off the exports: sidebar ends at x307, the game card
// runs 307-1392, the betslip sits at 1401-1720, the tab row is y396-509 and
// content starts at y509.
const ART = "/work/wb-sportsbook/prototype";
const FRAME_W = 1728;
const VIEW_H = 1080; // a laptop viewport, not the full 2831px page
const SIDE_W = 307;
const HEADER_H = 80;
const SUBROW_H = 48;
const BANNER_TOP = 128;
const TAB_TOP = 396;
const CONTENT_TOP = 509;
const CARD_W = 1085;

type State = "home" | "football" | "live" | "baseball";

const CONTENT: Record<State, { src: string; h: number }> = {
  home: { src: `${ART}/content-home.png`, h: 1716 },
  football: { src: `${ART}/content-football.png`, h: 1716 },
  live: { src: `${ART}/content-live.png`, h: 1447 },
  baseball: { src: `${ART}/content-baseball.png`, h: 973 },
};

/** Tab row: icon centre in frame x, and which state it opens (if any). */
const TABS: { id: string; label: string; cx: number; go?: State }[] = [
  { id: "popular", label: "POPULAR", cx: 344.5, go: "home" },
  { id: "live", label: "LIVE", cx: 427, go: "live" },
  { id: "football", label: "FOOTBALL", cx: 506.5, go: "football" },
  { id: "basketball", label: "BASKETBALL", cx: 593.5 },
  { id: "baseball", label: "BASEBALL", cx: 679.5, go: "baseball" },
  { id: "hockey", label: "HOCKEY", cx: 766.5 },
  { id: "soccer", label: "SOCCER", cx: 852.5 },
];
/** Which tab reads as lit in each state. */
const TAB_FOR: Record<State, string> = {
  home: "popular",
  football: "football",
  live: "live",
  baseball: "baseball",
};

const FEATURES = [
  ["boosts", "Boosts"],
  ["sgp", "Same Game Parlay"],
  ["mlb", "MLB"],
  ["nba", "NBA"],
  ["nfl", "NFL"],
];

const SPORTS = [
  "Football",
  "Basketball",
  "Baseball",
  "Hockey",
  "Soccer",
  "Tennis",
  "Australian Rules",
  "Badminton",
  "Beach Volleyball",
  "Boxing",
  "Cricket",
  "Darts",
];

/**
 * Ring on anything you can actually click. It breathes until the first click
 * lands, then holds as a quiet outline — long enough to teach, not so long it
 * nags. Everything else in these frames is real design that simply has no
 * frame behind it, so it is left alone rather than dimmed.
 */
function LiveRing({ radius, pulse }: { radius: number; pulse: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-[3px]"
      style={{
        borderRadius: radius,
        boxShadow: `0 0 0 2px ${GOLD}`,
        opacity: pulse ? undefined : 0.45,
        animation: pulse ? "sb-ring 2.2s ease-out infinite" : undefined,
      }}
    />
  );
}

function Chevron({ down, color = "#fff" }: { down?: boolean; color?: string }) {
  return (
    <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden style={{ flex: "none" }}>
      <path
        d={down ? "M3 5.5 7 9.5l4-4" : "M5 3l4 4-4 4"}
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SideRow({
  label,
  onPick,
  open,
  sub,
  pulse,
}: {
  label: string;
  onPick?: () => void;
  open?: boolean;
  sub?: boolean;
  pulse?: boolean;
}) {
  const lit = open || undefined;
  const inner = (
    <>
      <span
        className="text-[17px]"
        style={{ color: lit ? GOLD : "#fff", fontWeight: sub ? 400 : 500 }}
      >
        {label}
      </span>
      <span className="ml-auto">
        <Chevron down={open} color={lit ? GOLD : "#fff"} />
      </span>
    </>
  );
  const style = { height: sub ? 44 : 46.4, paddingLeft: sub ? 34 : 14, paddingRight: 20, fontFamily: sans };
  return onPick ? (
    <button
      onClick={onPick}
      className="relative flex w-full cursor-pointer items-center text-left transition-colors hover:bg-white/10"
      style={style}
    >
      <LiveRing radius={6} pulse={!!pulse} />
      {inner}
    </button>
  ) : (
    <div className="flex w-full items-center" style={style}>
      {inner}
    </div>
  );
}

function Sidebar({
  state,
  onPick,
  pulse,
}: {
  state: State;
  onPick: (s: State) => void;
  pulse: boolean;
}) {
  const open = state === "football";
  return (
    <div
      className="absolute left-0 overflow-clip"
      style={{ top: HEADER_H + SUBROW_H, width: SIDE_W, bottom: 0, background: NAVY, fontFamily: sans }}
    >
      <div className="pl-[14px] pt-[14px] text-[15px] font-bold text-white">Features</div>
      {FEATURES.map(([icon, label]) => (
        <div key={icon} className="flex items-center pl-[14px]" style={{ height: 58.5 }}>
          <Image src={`${ART}/feat-${icon}.png`} width={48} height={42} alt="" style={{ width: 34, height: 30 }} />
          <span className="ml-[12px] text-[15px] text-white">{label}</span>
        </div>
      ))}

      <div className="mt-[16px] pl-[14px] text-[15px] font-bold text-white">All Sports</div>
      <div className="mt-[10px]">
        {SPORTS.map((s) =>
          s === "Football" ? (
            <div key={s}>
              <SideRow label={s} open={open} onPick={() => onPick("football")} pulse={pulse} />
              {/* The frame opens Football onto its own sub-list, and everything
                  below shifts down. Flow layout rather than absolute offsets,
                  so that shift happens on its own. */}
              {open ? (
                <>
                  <SideRow label="Futures Market" sub />
                  <SideRow label="🇺🇸  USA" sub />
                  <div className="mx-[30px] my-[10px] h-px" style={{ background: "rgba(255,255,255,0.5)" }} />
                </>
              ) : null}
            </div>
          ) : (
            <SideRow key={s} label={s} />
          )
        )}
      </div>
    </div>
  );
}

function TabRow({
  state,
  onPick,
  pulse,
}: {
  state: State;
  onPick: (s: State) => void;
  pulse: boolean;
}) {
  const lit = TAB_FOR[state];
  return (
    <div className="absolute" style={{ left: SIDE_W, top: TAB_TOP, width: CARD_W, height: CONTENT_TOP - TAB_TOP }}>
      {TABS.map((t) => {
        const on = t.id === lit;
        const body = (
          <>
            <Image
              src={`${ART}/tab-${t.id}${on ? "-on" : ""}.png`}
              width={36}
              height={31}
              alt=""
              style={{ height: 31, width: "auto" }}
            />
            <span
              className="mt-[6px] text-[11px] font-bold tracking-[0.04em]"
              style={{ color: on ? GOLD : "rgba(255,255,255,0.8)", fontFamily: sans }}
            >
              {t.label}
            </span>
          </>
        );
        const style = { left: t.cx - SIDE_W - 43, top: 26, width: 86 } as const;
        return t.go ? (
          <button
            key={t.id}
            onClick={() => onPick(t.go!)}
            className="absolute flex cursor-pointer flex-col items-center rounded-[8px] pb-[4px] pt-[2px] transition-colors hover:bg-white/10"
            style={style}
          >
            <LiveRing radius={8} pulse={pulse} />
            {body}
          </button>
        ) : (
          <span key={t.id} className="absolute flex flex-col items-center" style={style}>
            {body}
          </span>
        );
      })}
    </div>
  );
}

const HINTS: Record<State, string> = {
  home: "Try it: anything ringed in gold is live — open Football, or pick a tab",
  football: "Football, one click deep. Live and Baseball are wired too",
  live: "Live games, grouped by league",
  baseball: "Baseball, straight from the tab row",
};

export default function SportsbookPrototype() {
  const [state, setState] = useState<State>("home");
  const [touched, setTouched] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const go = (s: State) => {
    setTouched(true);
    setState(s);
  };

  // A new section starts at its own top, the way a real navigation would.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [state]);

  return (
    <div>
      <style>{`@keyframes sb-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes sb-ring { 0%, 100% { opacity: 0.3 } 50% { opacity: 0.95 } }
        @media (prefers-reduced-motion: reduce) { [style*="sb-ring"] { animation: none !important; opacity: 0.5 !important } }`}</style>
      <div className="my-12 rounded-[24px] p-5 sm:p-8" style={{ background: "#ffffff" }}>
        <div
          className="overflow-clip rounded-[10px] bg-white"
          style={{
            boxShadow:
              "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.10), 0 0 0 2px rgba(255,255,255,0.10)",
          }}
        >
          <ScaledScreen designW={FRAME_W} shownH={VIEW_H}>
            <div className="relative" style={{ width: FRAME_W, height: VIEW_H, background: NAVY }}>
              {/* header */}
              <div
                className="absolute left-0 top-0 flex w-full items-center"
                style={{ height: HEADER_H, background: NAVY, paddingLeft: 24, paddingRight: 24 }}
              >
                <Image
                  src="/work/wb-free-spins/games/wynnbet-logo.svg"
                  width={200}
                  height={28}
                  alt="WynnBET"
                  style={{ height: 22, width: "auto" }}
                />
                <Image
                  src="/work/wb-free-spins/games/rg-badge.png"
                  width={64}
                  height={64}
                  alt=""
                  style={{ height: 22, width: 22, marginLeft: 16 }}
                />
                <span className="ml-[36px] text-[15px] font-semibold text-white" style={{ fontFamily: sans }}>
                  Sports
                </span>
                <span
                  aria-hidden
                  className="ml-[6px]"
                  style={{ width: 44, height: 3, background: GOLD, alignSelf: "flex-end", marginBottom: 14, marginLeft: -44 }}
                />
                <span className="ml-[56px] text-[15px] text-white/85" style={{ fontFamily: sans }}>
                  Promotions
                </span>
                <span
                  className="ml-auto flex items-center gap-[8px] rounded-[6px] px-[12px]"
                  style={{ height: 34, background: "#0d2140", border: "1px solid #2b3a5e", fontFamily: sans }}
                >
                  <span
                    className="flex h-[16px] w-[16px] items-center justify-center rounded-full text-[11px] font-bold leading-none text-white"
                    style={{ background: "#2e9e4f" }}
                  >
                    +
                  </span>
                  <span className="text-[13px] font-bold text-white tabular-nums">$420.48</span>
                </span>
                <span
                  aria-hidden
                  className="ml-[10px] rounded-[6px]"
                  style={{ width: 34, height: 34, background: "#0d2140", border: "1px solid #2b3a5e" }}
                />
              </div>

              {/* Home / My Bets */}
              <div
                className="absolute flex items-end bg-white"
                style={{ left: SIDE_W, top: HEADER_H, width: FRAME_W - SIDE_W, height: SUBROW_H, fontFamily: sans }}
              >
                <span className="ml-[34px] pb-[8px] text-[14px] font-semibold" style={{ color: GOLD }}>
                  Home
                  <span aria-hidden className="mt-[6px] block h-[3px]" style={{ background: GOLD }} />
                </span>
                <span className="ml-[26px] pb-[14px] text-[14px]" style={{ color: "#5b6272" }}>
                  My Bets
                </span>
              </div>

              <Sidebar state={state} onPick={go} pulse={!touched} />

              {/* the promo strip and the betslip never change between the four
                  frames, so they are one shared plate each */}
              <Image
                src={`${ART}/banners.png`}
                width={1421}
                height={268}
                alt=""
                className="absolute"
                style={{ left: SIDE_W, top: BANNER_TOP, width: 1421, height: 268 }}
              />
              <Image
                src={`${ART}/betslip.png`}
                width={319}
                height={161}
                alt=""
                className="absolute"
                style={{ left: 1401, top: 421, width: 319, height: 161 }}
              />

              <TabRow state={state} onPick={go} pulse={!touched} />

              {/* The game table scrolls inside the window. data-lenis-prevent
                  or the site's smooth scroll takes the wheel and the article
                  moves instead of this. */}
              <div
                ref={scroller}
                data-lenis-prevent
                className="absolute overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ left: SIDE_W, top: CONTENT_TOP, width: CARD_W, height: VIEW_H - CONTENT_TOP }}
              >
                <div
                  key={state}
                  className="motion-reduce:animate-none"
                  style={{ animation: "sb-in 220ms ease-out" }}
                >
                  <Image
                    src={CONTENT[state].src}
                    width={CARD_W}
                    height={CONTENT[state].h}
                    alt={`The ${state} view of the restructured sportsbook`}
                    style={{ width: CARD_W, height: CONTENT[state].h }}
                  />
                </div>
              </div>
            </div>
          </ScaledScreen>
        </div>
        <p
          className="mt-6 text-center font-[family-name:var(--font-label)] text-label uppercase tracking-[0.05em]"
          style={{ color: "#666" }}
        >
          {HINTS[state]}
        </p>
      </div>
      <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
        Interactive prototype: the restructured A-Z menu, wired as designed in Figma
      </p>
    </div>
  );
}
