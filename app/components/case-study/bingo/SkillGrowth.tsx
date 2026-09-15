"use client";

import { useEffect, useRef } from "react";
import ScaledScreen from "../free-spins/ScaledScreen";

// The Skills tab of the Bingo iOS app, alive: each beat is a job an employer
// reviewed, and the matching bubble inflates and shoves its neighbours until
// the cluster settles back onto the Figma layout ("03 · Skills", file
// smNLWmPHms3uvvvAmD2wYY). Hollow rings are skills still growing.
//
// The motion is a tiny spring-collide sim, tuned in prototypes/skill-growth.html:
// every bubble springs toward its target radius, overlapping pairs push apart,
// a weak pull drags each one home, and a sparse cluster (early beats) hugs the
// chart centre. Because home is the Figma position, the last beat is always the
// design. The "reviewed by" notice arrives through the Dynamic Island — every
// corner of the chart is occupied, and it reads as a real iOS notification.
//
// Server HTML carries the final beat, so pre-JS paint and reduced motion show
// the finished design; hydration rewinds to day one and plays while on screen
// (elapsed pauses off screen, per ProblemSpace). The phone is a fixed-colour
// framed object like DevicePair's shell; only the well follows the theme.

const W = 393;
const H = 852;
const CHART_W = 361;
const CHART_H = 262;

const SOFT = "#1e7bff";
const HARD = "#e8472a";
const EDU = "#141414";
const NAVY = "#2b2a6a";
const GOLD = "#f5bf57";
const RING = "#c9c5ba";
const IOS_BG = "#f4f1ea";
const FONT = '-apple-system, "SF Pro Text", Inter, system-ui, sans-serif';

// Tuned values (Stephen, 2026-09-15).
const K = 0.075; // radius spring stiffness
const D = 0.81; // radius spring damping (lower = bouncier)
const HOME = 0.035; // pull toward the home position
const GAP = 4; // px between bubbles
const BEAT_MS = 1700;
const HOLD_MS = 2400;
const POP = 1.19; // pop-in overshoot kick
const STEP_MS = 1000 / 60;

type Bubble = {
  id: string;
  label: string[];
  col: string | null;
  x: number;
  y: number;
  R: number;
};

// Final layout straight from the Figma frame (Group 1 offset 6,-1).
const BUBBLES: Bubble[] = [
  { id: "waiting", label: ["Waiting tables"], col: SOFT, x: 60, y: 68, R: 48 },
  { id: "bach", label: ["Bachelor's of", "Science"], col: EDU, x: 166, y: 54, R: 56 },
  { id: "cashier", label: ["Cashier"], col: HARD, x: 266, y: 82, R: 40 },
  { id: "g1", label: [], col: null, x: 336, y: 38, R: 6 },
  { id: "busboy", label: ["Busboy"], col: NAVY, x: 57, y: 155, R: 31 },
  { id: "math", label: ["Math"], col: null, x: 124, y: 144, R: 26 },
  { id: "teacher", label: ["Teacher"], col: GOLD, x: 192, y: 158, R: 36 },
  { id: "comm", label: ["Communication"], col: SOFT, x: 284, y: 184, R: 52 },
  { id: "team", label: ["Teamwork"], col: EDU, x: 91, y: 217, R: 35 },
  { id: "g2", label: [], col: null, x: 158, y: 220, R: 22 },
];

// r = fraction of the Figma radius; ring = hollow "growing" state; missing = absent.
type State = { r: number; ring?: boolean };
type Beat = { notice: string | null; s: Record<string, State> };
const BEATS: Beat[] = [
  {
    notice: null,
    s: {
      waiting: { r: 0.74 },
      bach: { r: 1 },
      busboy: { r: 0.8 },
      math: { r: 0.55, ring: true },
      cashier: { r: 0.3, ring: true },
    },
  },
  {
    notice: "Cashier · reviewed by Rosa’s Diner",
    s: {
      waiting: { r: 0.82 },
      bach: { r: 1 },
      busboy: { r: 0.85 },
      math: { r: 0.7, ring: true },
      cashier: { r: 1 },
      comm: { r: 0.35, ring: true },
      g1: { r: 1, ring: true },
    },
  },
  {
    notice: "Teacher · reviewed by Sunrise Tutoring",
    s: {
      waiting: { r: 0.9 },
      bach: { r: 1 },
      busboy: { r: 1 },
      math: { r: 0.85, ring: true },
      cashier: { r: 1 },
      comm: { r: 0.7 },
      teacher: { r: 1 },
      team: { r: 0.45, ring: true },
      g1: { r: 1, ring: true },
    },
  },
  {
    notice: "Waiting tables · reviewed by Café Luna",
    s: {
      waiting: { r: 1 },
      bach: { r: 1 },
      busboy: { r: 1 },
      math: { r: 1, ring: true },
      cashier: { r: 1 },
      comm: { r: 1 },
      teacher: { r: 1 },
      team: { r: 1 },
      g1: { r: 1, ring: true },
      g2: { r: 1, ring: true },
    },
  },
];
const FINAL = BEATS[BEATS.length - 1];

const fontFor = (R: number) => (R >= 50 ? 13 : R >= 30 ? 12 : 11);
const isRing = (id: string) => !!FINAL.s[id]?.ring;

type Sim = Bubble & {
  r: number;
  vr: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  fill: number;
  tr: number;
  ring: boolean;
  present: boolean;
};

export default function SkillGrowth({ caption }: { caption?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const islandRef = useRef<HTMLDivElement>(null);
  const noticeRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = rootRef.current!;
    const island = islandRef.current!;
    const notice = noticeRef.current!;
    const status = statusRef.current!;
    const groups = Array.from(chartRef.current!.querySelectorAll<SVGGElement>("g[data-id]"));

    const sim: Sim[] = BUBBLES.map((b) => ({
      ...b,
      r: 0,
      vr: 0,
      px: b.x,
      py: b.y,
      vx: 0,
      vy: 0,
      fill: 0,
      tr: 0,
      ring: true,
      present: false,
    }));
    const els = sim.map((n) => {
      const g = groups.find((el) => el.dataset.id === n.id)!;
      return { g, c: g.querySelector("circle")!, t: g.querySelector("text") };
    });

    let beat = 0;
    let tBeat = 0;
    let noticeTimer = 0;

    const showNotice = (text: string | null) => {
      window.clearTimeout(noticeTimer);
      const on = !!text;
      if (text) notice.textContent = text;
      island.style.width = on ? "290px" : "124px";
      island.style.setProperty("--notice", on ? "1" : "0");
      status.style.setProperty("--status", on ? "0" : "1");
      if (on) noticeTimer = window.setTimeout(() => showNotice(null), Math.max(900, BEAT_MS - 350));
    };

    const applyBeat = (i: number) => {
      beat = i;
      tBeat = 0;
      for (const n of sim) {
        const st = BEATS[i].s[n.id];
        const was = n.present;
        n.present = !!st;
        n.tr = st ? st.r * n.R : 0;
        n.ring = st ? !!st.ring : true;
        if (n.present && !was) n.vr = n.tr * (POP - 1) * 1.6;
      }
      showNotice(BEATS[i].notice);
    };

    const step = () => {
      let a = 0;
      let A = 0;
      for (const n of sim) {
        a += n.tr * n.tr;
        A += n.R * n.R;
      }
      const mix = 0.45 + 0.55 * Math.min(1, a / A);
      const cx = CHART_W / 2;
      const cy = CHART_H / 2;
      for (const n of sim) {
        n.vr += (n.tr - n.r) * K;
        n.vr *= D;
        n.r = Math.max(0, n.r + n.vr);
        const want = n.present && !n.ring ? 1 : 0;
        n.fill += (want - n.fill) * 0.12;
        const hx = cx + (n.x - cx) * mix;
        const hy = cy + (n.y - cy) * mix;
        n.vx += (hx - n.px) * HOME;
        n.vy += (hy - n.py) * HOME;
      }
      for (let i = 0; i < sim.length; i++) {
        for (let j = i + 1; j < sim.length; j++) {
          const p = sim[i];
          const q = sim[j];
          if (p.r < 1 || q.r < 1) continue;
          let dx = q.px - p.px;
          let dy = q.py - p.py;
          const d = Math.hypot(dx, dy) || 0.01;
          const min = p.r + q.r + GAP;
          if (d >= min) continue;
          const push = (min - d) * 0.35;
          dx /= d;
          dy /= d;
          const wp = q.r / (p.r + q.r);
          const wq = 1 - wp;
          p.vx -= dx * push * wp;
          p.vy -= dy * push * wp;
          q.vx += dx * push * wq;
          q.vy += dy * push * wq;
        }
      }
      for (const n of sim) {
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.px = Math.max(n.r + 4, Math.min(CHART_W - n.r - 4, n.px + n.vx));
        n.py = Math.max(n.r + 4, Math.min(CHART_H - n.r - 4, n.py + n.vy));
      }
    };

    const draw = () => {
      sim.forEach((n, i) => {
        const { g, c, t } = els[i];
        const vis = n.r > 0.5;
        g.style.display = vis ? "" : "none";
        if (!vis) return;
        g.setAttribute("transform", `translate(${n.px.toFixed(2)} ${n.py.toFixed(2)})`);
        c.setAttribute("r", n.r.toFixed(2));
        const f = Math.max(0, Math.min(1, n.fill));
        c.setAttribute("fill-opacity", n.col ? String(f) : "1");
        c.setAttribute("stroke", n.col && f > 0.5 ? "none" : RING);
        if (t) {
          const show = n.r > n.R * 0.66;
          t.style.opacity = show ? String(Math.min(1, (n.r - n.R * 0.66) / (n.R * 0.14))) : "0";
          t.setAttribute("font-size", (fontFor(n.R) * Math.min(1, n.r / n.R)).toFixed(2));
          t.setAttribute("fill", f > 0.5 ? "#fff" : "#6e6b63");
        }
      });
    };

    // Fixed 60 Hz sub-steps so the spring feels the same at any refresh rate.
    let acc = 0;
    let last = 0;
    let raf = 0;
    let running = false;
    const frame = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      tBeat += dt;
      acc += dt;
      const limit = beat === BEATS.length - 1 ? HOLD_MS : BEAT_MS;
      if (tBeat > limit) applyBeat((beat + 1) % BEATS.length);
      while (acc >= STEP_MS) {
        step();
        acc -= STEP_MS;
      }
      draw();
      raf = requestAnimationFrame(frame);
    };

    // Rewind the server-rendered final frame to day one.
    for (const n of sim) {
      n.px = n.x;
      n.py = n.y;
    }
    applyBeat(0);
    showNotice(null);
    for (const n of sim) {
      n.r = n.tr;
      n.vr = 0;
      n.fill = n.ring ? 0 : 1;
    }
    for (let i = 0; i < 120; i++) step();
    draw();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.3 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(noticeTimer);
    };
  }, []);

  return (
    <figure ref={rootRef} className="my-12">
      <div className="rounded-[24px] bg-well p-5 sm:p-8" style={{ maxWidth: 480 }}>
        <div className="mx-auto w-full max-w-[393px]">
          {/* DevicePair's iPhone shell, at the design's own width. */}
          <div
            className="overflow-clip rounded-[44px] border-[10px]"
            style={{
              borderColor: "#17191f",
              background: "#17191f",
              boxShadow:
                "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 2px #34373f",
            }}
          >
            <div className="relative overflow-clip rounded-[34px]" style={{ background: IOS_BG }}>
              <ScaledScreen designW={W} shownH={H}>
                <Screen chartRef={chartRef} islandRef={islandRef} noticeRef={noticeRef} statusRef={statusRef} />
              </ScaledScreen>
            </div>
          </div>
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

function Screen({
  chartRef,
  islandRef,
  noticeRef,
  statusRef,
}: {
  chartRef: React.RefObject<SVGSVGElement | null>;
  islandRef: React.RefObject<HTMLDivElement | null>;
  noticeRef: React.RefObject<HTMLSpanElement | null>;
  statusRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      className="relative"
      style={{ width: W, height: H, background: IOS_BG, color: "#141414", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}
      aria-hidden
    >
      {/* status bar + Dynamic Island; --status fades the clock/indicators while a notice is out */}
      <div ref={statusRef} className="relative" style={{ height: 54, ["--status" as string]: 1 }}>
        <span
          className="absolute text-[16px] font-semibold"
          style={{ left: 30, top: 22, letterSpacing: "-0.01em", opacity: "var(--status)", transition: "opacity .25s" }}
        >
          9:41
        </span>
        <div
          ref={islandRef}
          className="absolute left-1/2 z-[2] flex -translate-x-1/2 items-center justify-center gap-[7px] overflow-hidden whitespace-nowrap rounded-[18px] bg-black text-[12px] font-medium text-white"
          style={{
            top: 15,
            width: 124,
            height: 36,
            ["--notice" as string]: 0,
            transition: "width .45s cubic-bezier(.3,1.3,.4,1)",
          }}
        >
          <i
            className="block h-[7px] w-[7px] flex-none rounded-full"
            style={{ background: HARD, opacity: "var(--notice)", transition: "opacity .25s .2s" }}
          />
          <span ref={noticeRef} style={{ opacity: "var(--notice)", transition: "opacity .25s .2s" }} />
        </div>
        <span
          className="absolute flex items-end gap-[6px]"
          style={{ right: 30, top: 27, height: 12, opacity: "var(--status)", transition: "opacity .25s" }}
        >
          {[4, 6.5, 9, 12].map((h) => (
            <i key={h} className="block w-[3px] rounded-[1px] bg-black" style={{ height: h }} />
          ))}
          <b className="ml-[4px] block h-[12px] w-[24px] rounded-[3px] bg-black" />
        </span>
      </div>

      <div className="flex items-center justify-between" style={{ height: 92, padding: "40px 20px 0" }}>
        <h1 className="m-0 text-[34px] font-bold" style={{ letterSpacing: "-0.02em", lineHeight: "41px" }}>
          Skills
        </h1>
        <span className="text-[22px] font-extrabold" style={{ letterSpacing: "-0.03em" }}>
          Bingo
          <i className="ml-[1px] inline-block h-[7px] w-[7px] rounded-full" style={{ background: HARD }} />
        </span>
      </div>

      <div
        className="grid grid-cols-3 rounded-[9px] p-[2px] text-[13px] font-medium"
        style={{ margin: "4px 16px 0", height: 32, background: "#e9e5db" }}
      >
        <span className="grid place-items-center rounded-[7px] bg-white font-semibold" style={{ boxShadow: "0 1px 3px rgba(0,0,0,.12)" }}>
          Chart
        </span>
        <span className="grid place-items-center">List</span>
        <span className="grid place-items-center">History</span>
      </div>

      <div className="rounded-[12px] bg-white" style={{ margin: "16px 16px 0" }}>
        <div className="relative" style={{ height: CHART_H }}>
          <svg
            ref={chartRef}
            className="absolute inset-0 h-full w-full overflow-visible"
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            style={{ fontFamily: FONT, fontWeight: 600 }}
          >
            {BUBBLES.map((b) => {
              const ring = isRing(b.id);
              return (
                <g key={b.id} data-id={b.id} transform={`translate(${b.x} ${b.y})`}>
                  <circle r={b.R} fill={b.col ?? "#fff"} stroke={ring ? RING : "none"} strokeWidth={1.5} />
                  {b.label.length ? (
                    <text textAnchor="middle" fontSize={fontFor(b.R)} fill={ring ? "#6e6b63" : "#fff"}>
                      {b.label.map((ln, i) => (
                        <tspan key={ln} x={0} dy={i ? "1.15em" : b.label.length > 1 ? "-0.2em" : "0.35em"}>
                          {ln}
                        </tspan>
                      ))}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex gap-[12px] text-[12px]" style={{ padding: "0 16px 10px", color: "#4a4841" }}>
          {[
            ["Soft", SOFT],
            ["Hard", HARD],
            ["Education", EDU],
            ["Growing", null],
          ].map(([name, col]) => (
            <span key={name} className="flex items-center gap-[5px]">
              <i
                className="inline-block h-[10px] w-[10px] rounded-full"
                style={{ background: col ?? "transparent", border: `1.5px solid ${col ?? RING}` }}
              />
              {name}
            </span>
          ))}
        </div>
      </div>

      <div className="text-[13px] uppercase" style={{ margin: "16px 32px 7px", letterSpacing: "0.04em", color: "#6e6b63" }}>
        What employers say
      </div>
      <div className="overflow-hidden rounded-[12px] bg-white text-[17px]" style={{ margin: "0 16px" }}>
        <div style={{ padding: "12px 16px", lineHeight: "22px" }}>
          Great with customers and quick thinking. Enthusiastic, a fast learner, took his role head on.
        </div>
        {[
          ["Best at", "Service"],
          ["Likes", "Mid-day shifts"],
          ["Avoids", "Standing still"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between" style={{ padding: "13.5px 16px", borderTop: "1px solid #ecebe6" }}>
            <b className="font-semibold">{k}</b>
            <span>{v}</span>
          </div>
        ))}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 grid grid-cols-4"
        style={{ height: 83, background: IOS_BG, borderTop: "1px solid #e3dfd4", padding: "8px 10px 0" }}
      >
        <Tab label="Home">
          <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
        </Tab>
        <Tab label="Jobs">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </Tab>
        <Tab label="Skills" on>
          <circle cx="9" cy="9" r="5" />
          <circle cx="16.5" cy="13" r="4" />
          <circle cx="10" cy="17.5" r="3.5" />
        </Tab>
        <Tab label="Profile">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0z" />
        </Tab>
      </div>
      <div className="absolute rounded-[3px] bg-black" style={{ left: 126.5, bottom: 8, width: 140, height: 5 }} />
    </div>
  );
}

function Tab({ label, on, children }: { label: string; on?: boolean; children: React.ReactNode }) {
  const col = on ? "#e95136" : "#a6a39b";
  return (
    <div className="flex flex-col items-center gap-[3px] text-[10px]" style={{ color: col }}>
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill={on ? col : "none"}
        stroke={on ? "none" : col}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
      {label}
    </div>
  );
}
