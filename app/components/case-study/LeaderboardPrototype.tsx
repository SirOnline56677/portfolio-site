"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ScaledScreen from "./free-spins/ScaledScreen";
import { GOLD, NAVY, PLAY_BLUE, sans, display } from "./free-spins/wb";
import { StatusBar } from "./free-spins/ui";

// The opt-in flow, ported from the Leaderboards Figma file (file
// 2TiJibS7rgLUznggzMIqKE, "Opted In" section 2230:1398 → the Lobby frame
// 2765:5423, its OPT-IN variant 2765:5534, and the success bar 2765:5532),
// plus the opted-in detail state from 2230:1400.
//
// Tapping OPT IN does what the Figma variant does: the gold button becomes a
// blue PLAY NOW, an OPTED IN badge lands on the card, and the green success
// bar slides in. PLAY NOW then opens the match, which is where the study's
// point lands — your own row pinned above the standings.
//
// Built at the Figma frame's own 428x926, so every coordinate below is the
// design's, and ScaledScreen fits it to the column. Shared primitives come
// from free-spins/ because that is where this shell was first built.
const ART = "/work/wb-leaderboards/prototype";
const GREEN = "#2e9e4f";
const MUTED_DATE = "#777d8b";
const DETAIL_BG = "linear-gradient(175deg, #0B2242 0%, #0A1B33 40%, #081527 100%)";

/** Soft attention ring on the screen's primary tap target. */
function PulseRing({ radius }: { radius: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-[5px] motion-reduce:hidden"
      style={{ borderRadius: radius, boxShadow: `0 0 0 3px ${GOLD}`, animation: "lb-pulse 2s ease-out infinite" }}
    />
  );
}

function DepositPill() {
  return (
    <span
      className="absolute flex items-center gap-[7px] rounded-[6px] px-[9px]"
      style={{ left: 315, top: 40, width: 91, height: 39, background: "#0d2140", border: "1px solid #2b3a5e" }}
    >
      <span
        className="flex h-[16px] w-[16px] items-center justify-center rounded-full text-[11px] font-bold leading-none text-white"
        style={{ background: GREEN }}
      >
        +
      </span>
      <span className="text-[10px] font-bold text-white tabular-nums">$1,987.24</span>
    </span>
  );
}

function TopNav({ onBack, backPulse }: { onBack?: () => void; backPulse?: boolean }) {
  return (
    <div
      className="absolute left-0 top-0 w-[428px]"
      style={{ height: 100, background: NAVY, boxShadow: "0 4px 4px 0 rgba(0,0,0,0.55)" }}
    >
      <StatusBar compact />
      <button
        onClick={onBack}
        aria-label="Back"
        disabled={!onBack}
        className="absolute flex items-center justify-center disabled:cursor-default"
        style={{ left: 10, top: 48, width: 30, height: 30, cursor: onBack ? "pointer" : "default" }}
      >
        {backPulse ? <PulseRing radius={999} /> : null}
        <svg width={9} height={15} viewBox="0 0 9 15" aria-hidden>
          <path d="M7.5 1.2 1.6 7.5l5.9 6.3" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span
        className="absolute text-[20px] text-white"
        style={{ left: 42, top: 50, fontFamily: display, letterSpacing: "0.4px" }}
      >
        LEADERBOARD
      </span>
      <DepositPill />
    </div>
  );
}

const NAV_ITEMS: [string, string][] = [
  ["ic-casino", "CASINO"],
  ["ic-sports", "SPORTS"],
  ["ic-mybets", "MY BETS"],
  ["ic-promos", "PROMOS"],
  ["ic-more", "MORE"],
];

function BottomNav() {
  return (
    <div
      className="absolute left-0 flex w-[428px] items-start justify-between px-[14px] pt-[13px]"
      style={{ top: 844, height: 82, background: NAVY, boxShadow: "0 -3.3px 4.4px 0 rgba(0,0,0,0.15)" }}
    >
      {/* One opacity for all five. The exporter had baked Figma's inactive
          state into ic-mybets and ic-promos, so those two were being dimmed
          twice and sat at half the shade of CASINO and SPORTS; that attribute
          is stripped from the files and the state lives here instead. */}
      {NAV_ITEMS.map(([icon, label]) => (
        <span key={label} className="flex w-[76px] flex-col items-center gap-[6px]" style={{ opacity: 0.5 }}>
          {/* A pinned box with object-fit: contain, as NavIcon does in
              SpinsPrototype. Free height with auto width blew MORE up: its
              viewBox is 29x7, so a 20px height scaled it 2.8x and each dot
              came out as tall as the whole CASINO square. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- exported Figma glyph */}
          <img src={`${ART}/${icon}.svg`} alt="" width={20} height={20} style={{ width: 20, height: 20, objectFit: "contain" }} />
          <span className="text-[9.88px] font-bold text-white" style={{ fontFamily: sans }}>
            {label}
          </span>
        </span>
      ))}
      <span
        aria-hidden
        className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full"
        style={{ background: "rgba(255,255,255,0.85)" }}
      />
    </div>
  );
}

function Tabs() {
  return (
    <div
      className="absolute left-0 w-[428px] bg-white"
      style={{ top: 110, height: 50, boxShadow: "0 4px 4px 0 rgba(0,0,0,0.15)" }}
    >
      {/* The bar is a child of the label rather than a positioned box in frame
          coordinates: Figma's 104px was measured in Montserrat, and this
          renders in the site's own sans, so a fixed width lands short. */}
      <span
        className="absolute inline-block text-[14px] font-bold"
        style={{ left: 91, top: 14, color: NAVY, fontFamily: sans }}
      >
        Live &amp; Upcoming
        <span className="absolute -bottom-[6px] left-0 right-0" style={{ height: 2, background: GOLD }} />
      </span>
      <span className="absolute text-[14px] font-bold" style={{ left: 283, top: 14, color: NAVY, fontFamily: sans }}>
        Results
      </span>
    </div>
  );
}

/** The two promos in the lobby carousel, transcribed from the shipped page. */
const PROMOS = {
  tenk: {
    art: `${ART}/card-art.png`,
    trophy: true,
    title: "Exclusive $10,000 Leaderboard",
    dates: "May 20, 2023 - June 1, 2023",
    copy: "Earn leaderboard points when you wager on Masai Mara Megaways and more selected titles to win a share of $10,000!",
  },
  slots: {
    // Cropped from leaderboard-desktop.jpg, the only shot where this card is
    // not cut off. Its wordmark is part of the artwork, so no overlay.
    art: `${ART}/card-art-slots.png`,
    trophy: false,
    title: "Mega Slots Leaderboards",
    dates: "June 15, 2023 - June 29, 2023",
    copy: "Experience the thrill of the first Mega Slots Leaderboards! Spin to win big with a chance at $15,000!",
  },
} as const;

/**
 * One carousel card. `decorative` is the second promo: it is there to be
 * dragged to, not used, so its buttons render as plain spans — no tab stop,
 * and a second identical OPT IN never reaches a screen reader.
 *
 * Not `inert` on the card: that also blocks pointer events, so once the rail
 * had moved to this card there was nothing left to grab and you could not
 * drag back.
 */
function Card({
  x,
  promo,
  optedIn,
  onOptIn,
  onPlay,
  pulse,
  decorative,
}: {
  x: number;
  promo: (typeof PROMOS)[keyof typeof PROMOS];
  optedIn?: boolean;
  onOptIn?: () => void;
  onPlay?: () => void;
  pulse?: boolean;
  decorative?: boolean;
}) {
  return (
    <div
      className="absolute overflow-clip rounded-[6px] bg-white"
      style={{ left: x, top: 0, width: 355, height: 635, boxShadow: "0 2px 10px 2px rgba(0,0,0,0.18)" }}
      aria-hidden={decorative || undefined}
    >
      <div className="relative h-[425px] w-[355px] overflow-clip">
        <Image
          src={promo.art}
          width={355}
          height={425}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {promo.trophy ? (
          <>
            <Image
              src={`${ART}/trophy-10k.png`}
              width={934}
              height={692}
              alt=""
              draggable={false}
              className="absolute"
              style={{ left: 55, top: 79, width: 242, height: 180 }}
            />
            <span
              className="absolute w-full text-center text-[55px] leading-none text-white"
              style={{ top: 285, fontFamily: display }}
            >
              LEADERBOARD
            </span>
          </>
        ) : null}
      </div>

      {/* Below the art, above the title — where the shipped page puts it. */}
      {optedIn ? (
        <span
          className="absolute rounded-[2px] px-[7px] py-[2px] text-[8px] font-bold tracking-[0.08em] text-white"
          style={{ left: 26, top: 434, background: GREEN, fontFamily: sans }}
        >
          OPTED IN
        </span>
      ) : null}

      <p className="absolute text-[14px] font-bold" style={{ left: 26, top: 460, color: NAVY, fontFamily: sans }}>
        {promo.title}
      </p>
      <p className="absolute text-[10px] font-medium" style={{ left: 26, top: 478, color: MUTED_DATE, fontFamily: sans }}>
        {promo.dates}
      </p>
      <p
        className="absolute text-[12px] font-medium leading-[15px] text-black"
        style={{ left: 25, top: 498, width: 305, fontFamily: sans }}
      >
        {promo.copy}
      </p>

      <span
        className="absolute flex items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
        style={{ left: 26, top: 567, width: 150, height: 35, background: NAVY, fontFamily: sans }}
      >
        LEARN MORE
      </span>
      {decorative ? (
        <span
          className="absolute flex items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 181, top: 567, width: 150, height: 35, background: GOLD, fontFamily: sans }}
        >
          OPT IN
        </span>
      ) : optedIn ? (
        <button
          onClick={onPlay}
          className="absolute flex cursor-pointer items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 181, top: 567, width: 150, height: 35, background: PLAY_BLUE, fontFamily: sans }}
        >
          {pulse ? <PulseRing radius={2} /> : null}
          PLAY NOW
        </button>
      ) : (
        <button
          onClick={onOptIn}
          className="absolute flex cursor-pointer items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 181, top: 567, width: 150, height: 35, background: GOLD, fontFamily: sans }}
        >
          {pulse ? <PulseRing radius={2} /> : null}
          OPT IN
        </button>
      )}
    </div>
  );
}

// --- the carousel rail ---------------------------------------------------
const PITCH = 375; // 355 card + 20 gutter, straight off the Figma frame
const LAST = 1;
const MIN_OFF = -LAST * PITCH;
const RUBBER = 0.35; // resistance past either end
const FLICK = 0.5; // design px per ms
const SLOP = 6; // client px: past this, a tap has become a drag
const AXIS_LOCK = 4; // client px: past this, the gesture has picked an axis

const rubber = (x: number) =>
  x > 0 ? x * RUBBER : x < MIN_OFF ? MIN_OFF + (x - MIN_OFF) * RUBBER : x;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The two promos on a rail. Figma leaves 30px of the second card peeking; this
 * makes that peek mean something.
 *
 * The offset lives in a ref and is written straight to the transform — a
 * pointermove has to move a transform, not re-render two 355x635 cards — and
 * only the settled index reaches React. Listeners sit on window rather than
 * using setPointerCapture for the reason CanvasGallery records: pointerup
 * still targets the button, so its click survives and we get to decide
 * whether to let it through.
 */
function CardCarousel({
  optedIn,
  onOptIn,
  onPlay,
  active,
  resetKey,
}: {
  optedIn?: boolean;
  onOptIn?: () => void;
  onPlay?: () => void;
  active: boolean;
  resetKey: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const g = useRef({
    id: -1, // active pointerId, -1 when idle
    scale: 1, // client px -> design px, measured once per gesture
    startX: 0,
    startY: 0,
    base: 0,
    off: 0,
    axis: "" as "" | "x" | "y",
    v: 0, // design px per ms, smoothed
    lastX: 0,
    lastT: 0,
    dragged: false,
  });

  const paint = (off: number) => {
    const el = trackRef.current;
    if (el) el.style.transform = `translate3d(${off}px,0,0)`;
  };

  const settle = useCallback((i: number) => {
    const el = trackRef.current;
    if (el) el.style.transition = "";
    paint(-i * PITCH);
    setIndex(i);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (e.button !== 0 || !el || g.current.id !== -1) return;
    // The rect is post-transform, so it already folds in ScaledScreen's
    // scale(); reading --fs-scale would race its ResizeObserver.
    const w = el.getBoundingClientRect().width;
    g.current = {
      id: e.pointerId,
      scale: w > 0 ? 428 / w : 1,
      startX: e.clientX,
      startY: e.clientY,
      base: -index * PITCH,
      off: -index * PITCH,
      axis: "",
      v: 0,
      lastX: 0,
      lastT: performance.now(),
      dragged: false,
    };
    el.style.transition = "none";
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const s = g.current;
      if (e.pointerId !== s.id) return;
      const dxc = e.clientX - s.startX;
      const dyc = e.clientY - s.startY;

      // A mostly-vertical gesture belongs to the page: bow out for the rest of
      // it and never paint, so the reader can scroll past the prototype.
      if (!s.axis) {
        if (Math.abs(dxc) < AXIS_LOCK && Math.abs(dyc) < AXIS_LOCK) return;
        s.axis = Math.abs(dxc) > Math.abs(dyc) ? "x" : "y";
        if (s.axis === "y") {
          s.id = -1;
          if (trackRef.current) trackRef.current.style.transition = "";
          return;
        }
      }
      if (Math.abs(dxc) > SLOP) s.dragged = true;

      const x = dxc * s.scale;
      const t = performance.now();
      const dt = t - s.lastT;
      if (dt > 0) {
        s.v = 0.7 * ((x - s.lastX) / dt) + 0.3 * s.v;
        s.lastX = x;
        s.lastT = t;
      }
      s.off = rubber(s.base + x);
      paint(s.off);
    };

    const onUp = (e: PointerEvent) => {
      const s = g.current;
      if (e.pointerId !== s.id) return;
      s.id = -1;
      const moved = s.off - s.base;
      // A finger that stopped before lifting did not flick, and nor does
      // anyone who asked for reduced motion: distance decides instead.
      const v = performance.now() - s.lastT > 100 || reducedMotion() ? 0 : s.v;
      let next = index;
      if (moved < -PITCH * 0.25 || v < -FLICK) next = index + 1;
      else if (moved > PITCH * 0.25 || v > FLICK) next = index - 1;
      settle(Math.min(LAST, Math.max(0, next)));
    };

    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== g.current.id) return;
      g.current.id = -1;
      settle(index);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
    };
  }, [index, settle]);

  // Advancing the flow re-centres the rail: the hint points at a button, so
  // that button has to be on screen.
  useEffect(() => {
    settle(0);
  }, [resetKey, settle]);

  return (
    <div
      ref={trackRef}
      onPointerDown={onPointerDown}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        // The buttons ride inside the rail, so a drag has to eat its own click
        // before it reaches OPT IN. detail === 0 is keyboard-synthesised and
        // is never a drag.
        if (g.current.dragged && e.detail !== 0) {
          g.current.dragged = false;
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="absolute left-0 cursor-grab touch-pan-y select-none transition-transform duration-300 ease-out will-change-transform active:cursor-grabbing motion-reduce:transition-none"
      style={{ top: 183, width: 428, height: 635, transform: `translate3d(${-index * PITCH}px,0,0)` }}
    >
      <Card
        x={23}
        promo={PROMOS.tenk}
        optedIn={optedIn}
        onOptIn={onOptIn}
        onPlay={onPlay}
        pulse={active && index === 0}
      />
      <Card x={398} promo={PROMOS.slots} decorative />
    </div>
  );
}

function LobbyScreen({
  optedIn,
  onOptIn,
  onPlay,
  active,
}: {
  optedIn?: boolean;
  onOptIn?: () => void;
  onPlay?: () => void;
  active: boolean;
}) {
  return (
    <div className="relative h-[926px] w-[428px] overflow-clip" style={{ background: "#f2f3f6" }}>
      <TopNav />
      <Tabs />
      <CardCarousel
        optedIn={optedIn}
        onOptIn={onOptIn}
        onPlay={onPlay}
        active={active}
        resetKey={optedIn ? 1 : 0}
      />
      {/* The success bar sits above the tab bar, as in frame 2765:5532. */}
      <div
        className="pointer-events-none absolute left-0 flex w-[428px] items-center justify-center px-[45px] transition-all duration-500 ease-out motion-reduce:transition-none"
        style={{
          top: 789,
          height: 55,
          background: GREEN,
          opacity: optedIn ? 1 : 0,
          transform: `translateY(${optedIn ? 0 : 55}px)`,
        }}
        aria-hidden={!optedIn}
      >
        <span className="text-center text-[12px] font-medium text-white" style={{ fontFamily: sans }}>
          You have successfully opted into the Exclusive $10,000 Leaderboard.
        </span>
      </div>
      <BottomNav />
    </div>
  );
}

const ROWS: [string, string, string][] = [
  ["JOHN A.", "26,253", "$2,500"],
  ["AMY S.", "23,098", "$2,500"],
  ["DAVID G.", "21,865", "$2,500"],
  ["HENRY H.", "19,028", "$500"],
  ["SARAH F.", "18,765", "$400"],
];

// Medal treatments carried over from the tile video's composition, so the
// prototype and the hero loop describe the same leaderboard.
const MEDALS: Record<number, { background: string; borderColor: string }> = {
  0: { background: "linear-gradient(90deg, #E8C520 0%, #9C7E12 45%, #23283A 100%)", borderColor: "#EEB111" },
  1: { background: "linear-gradient(90deg, #C9CDD4 0%, #7C838E 45%, #23283A 100%)", borderColor: "#C9CDD4" },
  2: { background: "linear-gradient(90deg, #C08A1D 0%, #7A5A14 45%, #23283A 100%)", borderColor: "#C08A1D" },
};
const ROW_DEFAULT = {
  background: "linear-gradient(90deg, #10233C 0%, #0C1B30 100%)",
  borderColor: "rgba(255,255,255,0.07)",
};

function DetailScreen({ onBack, active }: { onBack: () => void; active: boolean }) {
  return (
    <div className="relative h-[926px] w-[428px] overflow-clip" style={{ background: DETAIL_BG }}>
      <TopNav onBack={onBack} backPulse={active} />

      <Image
        src={`${ART}/trophy-10k.png`}
        width={934}
        height={692}
        alt=""
        className="absolute"
        style={{ left: 120, top: 116, width: 188, height: 139 }}
      />

      <div
        className="absolute flex rounded-[6px] px-[18px] py-[12px]"
        style={{ left: 24, top: 262, width: 380, background: "rgba(255,255,255,0.06)" }}
      >
        {[
          ["TOTAL PRIZES", "$10,000.00"],
          ["TOP PRIZE", "$2,500.00"],
          ["PLAYERS", "54"],
        ].map(([k, v]) => (
          <div key={k} style={{ width: "34%" }}>
            <div className="text-[8px] font-semibold tracking-[0.12em] text-white/60" style={{ fontFamily: sans }}>
              {k}
            </div>
            <div className="mt-[3px] text-[13px] font-bold text-white" style={{ fontFamily: sans }}>
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        className="absolute w-full text-center text-[21px] font-bold tracking-[0.06em] text-white"
        style={{ top: 336, fontFamily: sans }}
      >
        STANDINGS
      </div>

      <div
        className="absolute text-[10px] font-semibold tracking-[0.14em] text-white/65"
        style={{ left: 26, top: 378, fontFamily: sans }}
      >
        MY RANK
      </div>
      {/* The pinned row: the whole point of the redesign, so it gets the
          blue card treatment rather than a place in the list. */}
      <div
        className="absolute rounded-[8px] px-[20px] py-[14px]"
        style={{
          left: 24,
          top: 396,
          width: 380,
          background: "linear-gradient(100deg, #2D9CDB 0%, #1D5FA8 55%, #12365F 100%)",
        }}
      >
        <div className="text-[22px] font-extrabold text-white" style={{ fontFamily: sans }}>
          John D.
        </div>
        <div className="mt-[8px] flex">
          {[
            ["RANK", "9"],
            ["SCORE", "11,099"],
            ["PRIZE", "$50"],
          ].map(([k, v]) => (
            <div key={k} style={{ width: "33%" }}>
              <div className="text-[9px] font-semibold tracking-[0.12em] text-white/70" style={{ fontFamily: sans }}>
                {k}
              </div>
              <div className="mt-[2px] text-[14px] font-bold text-white" style={{ fontFamily: sans }}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute flex px-[24px]" style={{ left: 0, top: 508, width: 428 }}>
        {[
          ["RANK", 66],
          ["NAME", 0],
        ].map(([k, w]) => (
          <span
            key={k as string}
            className="text-[9px] font-semibold tracking-[0.12em] text-white/60"
            style={{ width: (w as number) || undefined, fontFamily: sans }}
          >
            {k}
          </span>
        ))}
        <span className="ml-auto text-[9px] font-semibold tracking-[0.12em] text-white/60" style={{ fontFamily: sans }}>
          SCORE
        </span>
        <span
          className="text-right text-[9px] font-semibold tracking-[0.12em] text-white/60"
          style={{ width: 108, fontFamily: sans }}
        >
          PRIZE
        </span>
      </div>

      {ROWS.map(([name, score, prize], i) => {
        const medal = MEDALS[i] ?? ROW_DEFAULT;
        return (
          <div
            key={name}
            className="absolute flex items-center rounded-[6px] px-[20px]"
            style={{
              left: 24,
              top: 528 + i * 60,
              width: 380,
              height: 52,
              border: `1.5px solid ${medal.borderColor}`,
              background: medal.background,
              fontFamily: sans,
            }}
          >
            <span className="text-[16px] font-extrabold text-white" style={{ width: 46 }}>
              {i + 1}
            </span>
            <span className="text-[14px] font-semibold tracking-[0.02em] text-white">{name}</span>
            <span className="ml-auto text-[13px] font-medium text-white tabular-nums">{score}</span>
            <span className="text-right text-[13px] font-bold text-white" style={{ width: 96 }}>
              {prize}
            </span>
          </div>
        );
      })}

      <BottomNav />
    </div>
  );
}

const HINTS = [
  "Try it: tap OPT IN",
  "Opted in. Tap PLAY NOW to open the match",
  "Your rank is pinned above the standings. Tap back to step out",
];

export default function LeaderboardPrototype() {
  const [step, setStep] = useState(0);

  return (
    <div>
      <style>{`@keyframes lb-pulse { 0% { opacity: 0.9; transform: scale(0.99); } 70% { opacity: 0; transform: scale(1.04); } 100% { opacity: 0; transform: scale(1.04); } }`}</style>
      <div className="my-12 rounded-[24px] p-5 sm:p-8" style={{ background: "#ffffff" }}>
        <div className="mx-auto w-2/3 max-w-[300px]">
          <div
            className="overflow-clip rounded-[44px] border-[10px]"
            style={{
              borderColor: "#17191f",
              background: "#17191f",
              boxShadow: "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 2px #34373f",
            }}
          >
            <div className="relative overflow-clip rounded-[34px] bg-white">
              <ScaledScreen designW={428} shownH={926}>
                <div className="relative h-[926px] w-[428px] overflow-clip">
                  {/* One lobby, not two: opting in is a change of state on the
                      same screen, so the button swap and the success bar
                      animate in place the way the Figma variant reads. Only
                      the detail screen is a push, so only it slides. */}
                  <div className="absolute inset-0" aria-hidden={step === 2}>
                    <LobbyScreen
                      optedIn={step >= 1}
                      onOptIn={() => setStep(1)}
                      onPlay={() => setStep(2)}
                      active={step <= 1}
                    />
                  </div>
                  <div
                    className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `translateX(${step === 2 ? 0 : 100}%)` }}
                    aria-hidden={step !== 2}
                  >
                    <DetailScreen onBack={() => setStep(1)} active={step === 2} />
                  </div>
                </div>
              </ScaledScreen>
            </div>
          </div>
        </div>
        <p
          className="mt-6 text-center font-[family-name:var(--font-label)] text-label uppercase tracking-[0.05em]"
          style={{ color: "#666" }}
        >
          {HINTS[step]}
        </p>
      </div>
      <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
        Interactive prototype: opting in, wired as designed in Figma
      </p>
    </div>
  );
}
