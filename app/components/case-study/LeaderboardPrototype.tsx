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
  onLearnMore,
  pulse,
  decorative,
}: {
  x: number;
  promo: (typeof PROMOS)[keyof typeof PROMOS];
  optedIn?: boolean;
  onOptIn?: () => void;
  onLearnMore?: () => void;
  /** Which button wears the attention ring, if any. */
  pulse?: "optin" | "learn";
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

      {/* LEARN MORE is the one that opens the leaderboard. On the real page
          PLAY NOW launches the game itself, which is not what this prototype
          is about, so it is left as a label. */}
      {decorative ? (
        <span
          className="absolute flex items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 26, top: 567, width: 150, height: 35, background: NAVY, fontFamily: sans }}
        >
          LEARN MORE
        </span>
      ) : (
        <button
          onClick={onLearnMore}
          className="absolute flex cursor-pointer items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 26, top: 567, width: 150, height: 35, background: NAVY, fontFamily: sans }}
        >
          {pulse === "learn" ? <PulseRing radius={2} /> : null}
          LEARN MORE
        </button>
      )}
      {decorative ? (
        <span
          className="absolute flex items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 181, top: 567, width: 150, height: 35, background: GOLD, fontFamily: sans }}
        >
          OPT IN
        </span>
      ) : optedIn ? (
        <span
          className="absolute flex items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 181, top: 567, width: 150, height: 35, background: PLAY_BLUE, fontFamily: sans }}
        >
          PLAY NOW
        </span>
      ) : (
        <button
          onClick={onOptIn}
          className="absolute flex cursor-pointer items-center justify-center rounded-[2px] text-[12px] font-bold text-white"
          style={{ left: 181, top: 567, width: 150, height: 35, background: GOLD, fontFamily: sans }}
        >
          {pulse === "optin" ? <PulseRing radius={2} /> : null}
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
  onLearnMore,
  pulse,
  resetKey,
}: {
  optedIn?: boolean;
  onOptIn?: () => void;
  onLearnMore?: () => void;
  pulse?: "optin" | "learn";
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
        onLearnMore={onLearnMore}
        pulse={index === 0 ? pulse : undefined}
      />
      <Card x={398} promo={PROMOS.slots} decorative />
    </div>
  );
}

function LobbyScreen({
  optedIn,
  toast,
  onOptIn,
  onLearnMore,
  pulse,
  resetKey,
}: {
  optedIn?: boolean;
  toast?: boolean;
  onOptIn?: () => void;
  onLearnMore?: () => void;
  pulse?: "optin" | "learn";
  resetKey: number;
}) {
  return (
    <div className="relative h-[926px] w-[428px] overflow-clip" style={{ background: "#f2f3f6" }}>
      <TopNav />
      <Tabs />
      <CardCarousel
        optedIn={optedIn}
        onOptIn={onOptIn}
        onLearnMore={onLearnMore}
        pulse={pulse}
        resetKey={resetKey}
      />
      {/* The success bar (frame 2765:5532) is a confirmation, not a state:
          it slides in on opt-in, holds, then leaves — and only once it has
          gone does the card settle into PLAY NOW. */}
      <div
        className="pointer-events-none absolute left-0 flex w-[428px] items-center justify-center px-[45px] transition-all duration-500 ease-out motion-reduce:transition-none"
        style={{
          top: 789,
          height: 55,
          background: GREEN,
          opacity: toast ? 1 : 0,
          transform: `translateY(${toast ? 0 : 55}px)`,
        }}
        aria-hidden={!toast}
      >
        <span className="text-center text-[12px] font-medium text-white" style={{ fontFamily: sans }}>
          You have successfully opted into the Exclusive $10,000 Leaderboard.
        </span>
      </div>
      <BottomNav />
    </div>
  );
}

const ROWS: { name: string; score: string; prize: string; you?: boolean }[] = [
  { name: "JOHN A.", score: "26,253", prize: "$2,500" },
  { name: "AMY S.", score: "23,098", prize: "$2,500" },
  { name: "DAVID G.", score: "21,865", prize: "$2,500" },
  { name: "HENRY H.", score: "19,028", prize: "$500" },
  { name: "SARAH F.", score: "18,765", prize: "$400" },
  { name: "SAM B.", score: "17,421", prize: "$300" },
  { name: "BOB W.", score: "15,980", prize: "$100" },
  { name: "SANDY R.", score: "13,928", prize: "$50" },
  { name: "JOHN D.", score: "11,099", prize: "$50", you: true },
  { name: "BARBARA E.", score: "9,811", prize: "$50" },
];

const PRIZE_TABLE: [string, string][] = [
  ["1", "$2,500"],
  ["2", "$1,700"],
  ["3", "$1,100"],
];

const MY_BLUE = "linear-gradient(100deg, #2D9CDB 0%, #1D5FA8 55%, #12365F 100%)";

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

/**
 * The ••• control. Same file the bottom nav uses, painted through a mask so
 * the one asset can be navy here and white down there — the InkIcon trick
 * from SpinsPrototype.
 */
function MoreDots() {
  const mask = `url(${ART}/ic-more.svg)`;
  return (
    <span
      aria-hidden
      className="block"
      style={{
        width: 28,
        height: 6,
        // Figma draws these navy, but its card is lighter at the right than
        // ours (ours matches the tile video's gradient), where navy-on-navy
        // disappears. Light dots keep the control findable.
        background: "rgba(255,255,255,0.85)",
        maskImage: mask,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: mask,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/** A label/value pair in the prize panel. */
function Meta({ k, v, w }: { k: string; v: string; w: string }) {
  return (
    <div style={{ width: w }}>
      <div className="text-[8px] font-semibold tracking-[0.12em] text-white/60" style={{ fontFamily: sans }}>
        {k}
      </div>
      <div className="mt-[3px] text-[13px] font-bold text-white" style={{ fontFamily: sans }}>
        {v}
      </div>
    </div>
  );
}

function DetailScreen({
  onBack,
  onOptOut,
  active,
}: {
  onBack: () => void;
  onOptOut: () => void;
  active: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Coming back to this screen starts closed, so the panel is never left
  // hanging open from a previous visit.
  useEffect(() => {
    if (!active) setMenuOpen(false);
  }, [active]);

  return (
    <div className="relative h-[926px] w-[428px] overflow-clip" style={{ background: DETAIL_BG }}>
      <TopNav onBack={onBack} backPulse={active} />

      {/*
        The page scrolls between the two bars, as the real one does — the
        standings run to ten and the prize table sits under them, which is
        more than a phone screen holds.

        data-lenis-prevent: the site's smooth scroll owns the wheel, and
        without it a wheel over the phone scrolls the article instead of the
        screen. Touch is native and needs nothing.
      */}
      <div
        data-lenis-prevent
        className="absolute left-0 right-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ top: 100, bottom: 82 }}
      >
        <Image
          src={`${ART}/trophy-10k.png`}
          width={934}
          height={692}
          alt=""
          className="mx-auto mt-[16px] block"
          style={{ width: 188, height: 139 }}
        />

        <div
          className="mx-[24px] mt-[8px] rounded-[6px] px-[18px] py-[12px]"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex">
            <Meta k="TOTAL PRIZES" v="$10,000.00" w="38%" />
            <Meta k="TOP PRIZE" v="$2,500.00" w="34%" />
            <Meta k="PLAYERS" v="54" w="28%" />
          </div>
          <div className="mt-[12px] flex">
            <Meta k="START DATE" v="May 20, 2023, 10:00 AM EST" w="50%" />
            <Meta k="END DATE" v="June 1, 2023, 11:59 PM EST" w="50%" />
          </div>
        </div>

        <div
          className="mt-[26px] text-center text-[21px] font-bold tracking-[0.06em] text-white"
          style={{ fontFamily: sans }}
        >
          STANDINGS
        </div>

        <div
          className="mx-[26px] mt-[14px] text-[10px] font-semibold tracking-[0.14em] text-white/65"
          style={{ fontFamily: sans }}
        >
          MY RANK
        </div>
        {/* The pinned row: the whole point of the redesign, so it gets the
            blue card treatment rather than a place in the list. The ••• opens
            it out (Figma "Leaderboard / Details - More Menu", 2735:3885) onto
            the last game played and the way out — 224 tall open, 150 closed. */}
        <div
          className="mx-[24px] mt-[6px] overflow-clip rounded-[8px] px-[20px] py-[14px] transition-[height] duration-300 ease-out motion-reduce:transition-none"
          style={{ background: MY_BLUE, height: menuOpen ? 224 : 150 }}
        >
          <div className="text-[22px] font-extrabold text-white" style={{ fontFamily: sans }}>
            John D.
          </div>
          <div className="mt-[8px] flex items-end">
            <Meta k="RANK" v="9" w="33%" />
            <Meta k="SCORE" v="11,099" w="33%" />
            <Meta k="PRIZE" v="$50" w="33%" />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close rank options" : "Rank options"}
              aria-expanded={menuOpen}
              className="-mr-[4px] flex h-[26px] w-[36px] cursor-pointer items-center justify-center"
            >
              <MoreDots />
            </button>
          </div>

          <div
            className="mt-[16px] transition-opacity duration-200 ease-out motion-reduce:transition-none"
            style={{ opacity: menuOpen ? 1 : 0 }}
            aria-hidden={!menuOpen}
          >
            <div
              className="text-[10px] font-semibold tracking-[0.12em] text-white/80"
              style={{ fontFamily: sans }}
            >
              RECENTLY PLAYED
            </div>
            <div className="mt-[8px] flex items-center">
              <Image
                src="/work/wb-free-spins/games/starburst.png"
                width={240}
                height={240}
                alt=""
                className="rounded-[8px]"
                style={{ width: 68, height: 68 }}
              />
              <button
                onClick={onOptOut}
                className="ml-auto flex cursor-pointer items-center justify-center rounded-[4px] text-[15px] font-bold tracking-[0.04em] text-white"
                style={{
                  width: 155,
                  height: 55,
                  border: "1.5px solid rgba(255,255,255,0.9)",
                  fontFamily: sans,
                }}
                tabIndex={menuOpen ? undefined : -1}
              >
                OPT OUT
              </button>
            </div>
          </div>
        </div>

        <div className="mx-[24px] mt-[16px] flex px-[20px]" style={{ fontFamily: sans }}>
          <span className="text-[9px] font-semibold tracking-[0.12em] text-white/60" style={{ width: 46 }}>
            RANK
          </span>
          <span className="text-[9px] font-semibold tracking-[0.12em] text-white/60">NAME</span>
          <span className="ml-auto text-[9px] font-semibold tracking-[0.12em] text-white/60">SCORE</span>
          <span className="text-right text-[9px] font-semibold tracking-[0.12em] text-white/60" style={{ width: 96 }}>
            PRIZE
          </span>
        </div>

        {ROWS.map((r, i) => {
          const medal = r.you
            ? { background: MY_BLUE, borderColor: "#2D9CDB" }
            : (MEDALS[i] ?? ROW_DEFAULT);
          return (
            <div
              key={r.name}
              className="mx-[24px] mt-[8px] flex items-center rounded-[6px] px-[20px]"
              style={{
                height: 52,
                border: `1.5px solid ${medal.borderColor}`,
                background: medal.background,
                fontFamily: sans,
              }}
            >
              <span className="text-[16px] font-extrabold text-white" style={{ width: 46 }}>
                {i + 1}
              </span>
              <span className="text-[14px] font-semibold tracking-[0.02em] text-white">{r.name}</span>
              <span className="ml-auto text-[13px] font-medium text-white tabular-nums">{r.score}</span>
              <span className="text-right text-[13px] font-bold text-white" style={{ width: 96 }}>
                {r.prize}
              </span>
            </div>
          );
        })}

        <div
          className="mx-[24px] mt-[12px] flex h-[44px] items-center justify-center rounded-[6px] text-[13px] font-bold tracking-[0.06em] text-white"
          style={{ background: "rgba(255,255,255,0.16)", fontFamily: sans }}
        >
          VIEW ALL
        </div>

        <div
          className="mt-[30px] text-center text-[21px] font-bold tracking-[0.06em] text-white"
          style={{ fontFamily: sans }}
        >
          PRIZES
        </div>
        <div className="mx-[24px] mt-[12px] flex px-[20px]" style={{ fontFamily: sans }}>
          <span className="text-[9px] font-semibold tracking-[0.12em] text-white/60">POSITION</span>
          <span className="ml-auto text-[9px] font-semibold tracking-[0.12em] text-white/60">PRIZE</span>
        </div>
        {PRIZE_TABLE.map(([pos, prize]) => (
          <div
            key={pos}
            className="mx-[24px] mt-[8px] flex items-center rounded-[6px] px-[20px]"
            style={{ height: 44, background: "rgba(255,255,255,0.08)", fontFamily: sans }}
          >
            <span className="text-[14px] font-semibold text-white">{pos}</span>
            <span className="ml-auto text-[13px] font-bold text-white">{prize}</span>
          </div>
        ))}

        <div style={{ height: 28 }} />
      </div>

      <BottomNav />
    </div>
  );
}

/** How long the success bar holds before the card settles into PLAY NOW. */
const TOAST_MS = 2400;

export default function LeaderboardPrototype() {
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState(false);

  // Opting in is a confirmation with a beat in it: the bar arrives, holds,
  // then goes, and the button only becomes PLAY NOW once it has.
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => {
      setToast(false);
      setStep(1);
    }, TOAST_MS);
    return () => clearTimeout(t);
  }, [toast]);

  const hint =
    step === 2
      ? "Your rank is pinned above the standings. Tap the ••• for your last game"
      : toast
        ? "Opted in"
        : step === 1
          ? "Now tap LEARN MORE to open the leaderboard"
          : "Try it: tap OPT IN";

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
                      toast={toast}
                      onOptIn={() => setToast(true)}
                      onLearnMore={() => setStep(2)}
                      pulse={step === 1 ? "learn" : step === 0 && !toast ? "optin" : undefined}
                      resetKey={step}
                    />
                  </div>
                  <div
                    className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `translateX(${step === 2 ? 0 : 100}%)` }}
                    aria-hidden={step !== 2}
                  >
                    <DetailScreen
                      onBack={() => setStep(1)}
                      onOptOut={() => {
                        setToast(false);
                        setStep(0);
                      }}
                      active={step === 2}
                    />
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
          {hint}
        </p>
      </div>
      <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
        Interactive prototype: opting in, wired as designed in Figma
      </p>
    </div>
  );
}
