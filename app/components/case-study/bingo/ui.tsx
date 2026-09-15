"use client";

import type { CSSProperties, ReactNode } from "react";
import { BLUE, GHOST, GREEN, GROUND, HAIR, INK, NAVY, PH, RED, SEC, TINT, TRACK, W, WHITE, YELLOW, ui } from "./tokens";
import type { VoiceState } from "./state";

// Shared pieces of the Bingo onboarding screens at their Figma pixel values
// (393 wide). The frame itself is a fixed box that ScaledScreen scales, so
// ordinary flex layout inside it lands exactly where the design put things.

export const font: CSSProperties = { fontFamily: ui, color: INK };

/* ---------- chrome ---------- */

export function StatusBar() {
  return (
    <div aria-hidden className="flex shrink-0 items-center justify-between" style={{ height: 54, padding: "18px 30px 6px" }}>
      <span style={{ fontWeight: 600, fontSize: 16 }}>9:41</span>
      <span style={{ width: 124, height: 36, borderRadius: 20, background: "#000" }} />
      <span className="flex items-center" style={{ gap: 6 }}>
        {[4, 6.5, 9, 12].map((h, i) => (
          <i key={i} style={{ display: "block", width: 3, height: h, background: INK, borderRadius: 1 }} />
        ))}
        <i style={{ display: "block", width: 24, height: 12, background: INK, borderRadius: 3 }} />
      </span>
    </div>
  );
}

export function Nav({
  step,
  onBack,
  onHelp,
  muted,
  onMute,
  right,
}: {
  step?: string;
  onBack?: () => void;
  onHelp?: () => void;
  muted?: boolean;
  onMute?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between" style={{ height: 44, padding: "6px 16px 4px", fontSize: 17 }}>
      <button
        type="button"
        onClick={onBack}
        disabled={!onBack}
        aria-label="Back"
        className="flex items-center"
        style={{ gap: 4, color: RED, visibility: onBack ? "visible" : "hidden", minWidth: 55 }}
      >
        <b style={{ fontSize: 28, lineHeight: "20px", fontWeight: 400 }}>‹</b>
        <span>Back</span>
      </button>
      <span style={{ color: SEC }}>{step ?? ""}</span>
      <span className="flex items-center" style={{ gap: 6 }}>
        {right}
        {onMute ? (
          <button
            type="button"
            onClick={onMute}
            aria-pressed={muted}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className="flex items-center justify-center"
            style={{ width: 32, height: 32, borderRadius: 16, background: muted ? GHOST : TINT }}
          >
            <SpeakerGlyph off={muted} />
          </button>
        ) : null}
        {onHelp ? (
          <button
            type="button"
            onClick={onHelp}
            className="flex items-center"
            style={{ gap: 6, padding: "6px 12px", borderRadius: 16, background: TINT, color: RED, fontSize: 13, fontWeight: 600 }}
          >
            <QuestionGlyph />
            Need a hand?
          </button>
        ) : null}
      </span>
    </div>
  );
}

export function LargeTitle({ children, id }: { children: ReactNode; id: string }) {
  return (
    <div className="shrink-0" style={{ height: 52, padding: "0 20px 10px" }}>
      <h3
        id={id}
        tabIndex={-1}
        className="outline-none"
        style={{ margin: 0, fontWeight: 700, fontSize: 34, letterSpacing: -0.6, lineHeight: "41px", whiteSpace: "nowrap", color: INK }}
      >
        {children}
      </h3>
    </div>
  );
}

export function Content({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ gap: 16, padding: "4px 16px 40px", ...style }}>
      {children}
    </div>
  );
}

export function Progress({ pct }: { pct: number }) {
  return (
    <div aria-hidden className="shrink-0" style={{ height: 4, borderRadius: 2, background: TRACK }}>
      <i style={{ display: "block", height: 4, borderRadius: 2, background: RED, width: `${pct * 100}%` }} />
    </div>
  );
}

/** The prompt. In `reading` mode the words up to `readWord` turn red. */
export function Lead({ text, readWord = -1, reading = false }: { text: string; readWord?: number; reading?: boolean }) {
  if (!reading) return <p style={{ margin: 0, fontSize: 17, lineHeight: "24px", color: SEC }}>{text}</p>;
  const words = text.split(" ");
  return (
    <p style={{ margin: 0, fontSize: 17, lineHeight: "24px", color: INK, fontWeight: 500 }}>
      {words.map((w, i) => (
        <span key={i} style={{ color: i <= readWord ? RED : INK }}>
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}

export function Group({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="flex flex-col" style={{ gap: 7 }}>
      <p className="flex items-center" style={{ margin: 0, paddingLeft: 16, gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: 0.2, color: SEC, textTransform: "uppercase" }}>
        {label}
        {optional ? <span style={{ color: RED, textTransform: "none", letterSpacing: 0 }}>Optional</span> : null}
      </p>
      {children}
    </div>
  );
}

export function Card({ children, style, role, ariaLabel }: { children: ReactNode; style?: CSSProperties; role?: string; ariaLabel?: string }) {
  return (
    <div role={role} aria-label={ariaLabel} className="overflow-hidden" style={{ background: WHITE, borderRadius: 14, ...style }}>
      {children}
    </div>
  );
}

const rowBase: CSSProperties = { minHeight: 48, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, fontSize: 17, width: "100%", textAlign: "left", background: WHITE };

export function Row({
  children,
  first,
  onClick,
  role,
  ariaChecked,
  ariaPressed,
  ariaLabel,
  style,
}: {
  children: ReactNode;
  first?: boolean;
  onClick?: () => void;
  role?: string;
  ariaChecked?: boolean;
  ariaPressed?: boolean;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  const s: CSSProperties = { ...rowBase, borderTop: first ? "none" : `1px solid ${HAIR}`, ...style };
  if (onClick) {
    return (
      <button type="button" role={role} aria-checked={ariaChecked} aria-pressed={ariaPressed} aria-label={ariaLabel} onClick={onClick} style={s}>
        {children}
      </button>
    );
  }
  return <div style={s}>{children}</div>;
}

export const Spacer = () => <div className="flex-1" />;
export const Sp = () => <span className="flex-1" />;

export function Help({ children }: { children: ReactNode }) {
  return <p style={{ margin: 0, paddingLeft: 16, fontSize: 13, color: SEC }}>{children}</p>;
}

export function Said({ text }: { text: string }) {
  return (
    <div style={{ background: TINT, borderRadius: 14, padding: "10px 14px" }}>
      <b style={{ display: "block", fontSize: 13, fontWeight: 600, color: RED, marginBottom: 2 }}>You said</b>
      <span style={{ fontSize: 15, lineHeight: "20px", color: INK }}>“{text}”</span>
    </div>
  );
}

/** An in-place text field styled like a row value. */
export function Field({
  value,
  placeholder,
  onChange,
  onEnter,
  inputMode,
  red,
  ariaLabel,
  autoFocus,
  style,
}: {
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  inputMode?: "text" | "tel" | "numeric";
  red?: boolean;
  ariaLabel: string;
  autoFocus?: boolean;
  style?: CSSProperties;
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => { if (e.key === "Enter") onEnter?.(); }}
      inputMode={inputMode}
      aria-label={ariaLabel}
      autoFocus={autoFocus}
      className="min-w-0 flex-1 bg-transparent outline-none"
      style={{ fontFamily: ui, fontSize: 17, fontWeight: value ? 600 : 400, color: red ? RED : INK, border: 0, padding: 0, ...style }}
    />
  );
}

/* ---------- controls ---------- */

export function Btn({ children, kind = "pri", onClick, w, disabled }: { children: ReactNode; kind?: "pri" | "tint" | "ghost"; onClick?: () => void; w?: number; disabled?: boolean }) {
  const bg = kind === "pri" ? RED : kind === "tint" ? TINT : GHOST;
  const color = kind === "pri" ? WHITE : kind === "tint" ? RED : INK;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center whitespace-nowrap disabled:opacity-50"
      style={{ height: 50, minHeight: 50, borderRadius: 14, fontSize: 17, fontWeight: 600, padding: "0 18px", background: bg, color, flex: w ? `0 0 ${w}px` : "1 1 auto" }}
    >
      {children}
    </button>
  );
}

export function Buttons({ children, col }: { children: ReactNode; col?: boolean }) {
  return (
    <div className={`flex shrink-0 ${col ? "flex-col" : ""}`} style={{ gap: 10 }}>
      {children}
    </div>
  );
}

export function Check({ on }: { on: boolean }) {
  return on ? (
    <svg width={26} height={26} viewBox="0 0 26 26" aria-hidden>
      <circle cx={13} cy={13} r={13} fill={RED} />
      <path d="M8 13.5l3.5 3.5L18.5 10" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width={26} height={26} viewBox="0 0 26 26" aria-hidden>
      <circle cx={13} cy={13} r={12} fill="none" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
    </svg>
  );
}

export function Radio({ on }: { on: boolean }) {
  return on ? (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={12} fill={RED} />
      <circle cx={12} cy={12} r={5} fill="#fff" />
    </svg>
  ) : (
    <svg width={24} height={24} viewBox="0 0 24 24" aria-hidden>
      <circle cx={12} cy={12} r={11} fill="none" stroke={INK} strokeOpacity={0.12} strokeWidth={2} />
    </svg>
  );
}

export function Done() {
  return (
    <svg width={26} height={26} viewBox="0 0 26 26" aria-hidden>
      <circle cx={13} cy={13} r={13} fill={GREEN} />
      <path d="M8 13.5l3.5 3.5L18.5 10" stroke="#fff" strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Num({ n, dim }: { n: number | string; dim?: boolean }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center justify-center" style={{ width: 28, height: 28, borderRadius: 14, background: dim ? GHOST : typeof n === "string" ? INK : RED, color: dim ? SEC : WHITE, fontWeight: 700, fontSize: 15 }}>
      {n}
    </span>
  );
}

export function Day({ letter, name, on, onClick }: { letter: string; name: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={name}
      className="flex items-center justify-center"
      style={{ width: 44, height: 44, margin: -2 }}
    >
      <span className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 20, background: on ? RED : GROUND, color: on ? WHITE : SEC, fontWeight: 600, fontSize: 17 }}>
        {letter}
      </span>
    </button>
  );
}

export function Pill({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className="flex flex-1 items-center justify-center"
      style={{ height: 40, borderRadius: 20, background: on ? INK : GROUND, color: on ? WHITE : SEC, fontSize: 15, fontWeight: 500 }}
    >
      {label}
    </button>
  );
}

export function Segments({ children, ariaLabel }: { children: ReactNode; ariaLabel: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex" style={{ gap: 8, padding: "12px 14px" }}>
      {children}
    </div>
  );
}

export function Wave({ live = true }: { live?: boolean }) {
  return (
    <span aria-hidden className="flex items-center" style={{ gap: 3 }}>
      {[6, 14, 20, 10, 16, 7].map((h, i) => (
        <i
          key={i}
          className={live ? "motion-reduce:animate-none" : ""}
          style={{ display: "block", width: 3, height: h, borderRadius: 1.5, background: RED, animation: live ? `bg-wave 0.9s ${i * 0.1}s ease-in-out infinite alternate` : undefined, transformOrigin: "center" }}
        />
      ))}
    </span>
  );
}

/* ---------- the voice block ---------- */

const MIC_LOOK: Record<VoiceState, { bg: string; ring?: string; glyph: string; halo?: string }> = {
  idle: { bg: WHITE, ring: RED, glyph: RED },
  reading: { bg: WHITE, ring: RED, glyph: RED, halo: RED },
  listening: { bg: RED, ring: "rgba(232,71,42,.35)", glyph: WHITE, halo: RED },
  heard: { bg: TINT, glyph: RED },
  done: { bg: GREEN, glyph: WHITE, halo: GREEN },
  off: { bg: GHOST, glyph: PH },
  record: { bg: RED, ring: "rgba(232,71,42,.35)", glyph: WHITE, halo: RED },
};

export function VoiceBlock({ state, caption, onTap, label }: { state: VoiceState; caption: string; onTap?: () => void; label?: string }) {
  const look = MIC_LOOK[state];
  const pressed = state === "listening" || state === "record";
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ gap: 12 }}>
      <button
        type="button"
        onClick={onTap}
        disabled={!onTap}
        aria-pressed={pressed}
        aria-label={label ?? "Tap to talk"}
        className="relative flex items-center justify-center disabled:cursor-default"
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          background: look.bg,
          border: look.ring ? `2px solid ${look.ring}` : "2px solid transparent",
          boxShadow: look.halo ? `0 8px 12px ${look.halo}59` : "none",
        }}
      >
        {state === "listening" ? (
          <span aria-hidden className="pointer-events-none absolute -inset-[5px] rounded-full motion-reduce:hidden" style={{ boxShadow: `0 0 0 3px ${RED}`, animation: "bg-pulse 1.6s ease-out infinite" }} />
        ) : null}
        {state === "done" ? (
          <svg width={34} height={26} viewBox="0 0 34 26" aria-hidden>
            <path d="M4 13.5l9 9L30 4" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : state === "reading" ? (
          <SpeakerGlyph size={30} color={RED} />
        ) : state === "record" ? (
          <span style={{ width: 26, height: 26, borderRadius: 13, background: look.glyph }} />
        ) : (
          <span style={{ width: 14, height: 24, borderRadius: 7, background: look.glyph }} />
        )}
      </button>
      <p style={{ margin: 0, fontSize: 15, color: SEC, textAlign: "center" }}>{caption}</p>
    </div>
  );
}

export function VoiceOff({ onTurnOn, note }: { onTurnOn?: () => void; note: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center" style={{ gap: 8 }}>
      <button type="button" onClick={onTurnOn} disabled={!onTurnOn} className="flex items-center" style={{ gap: 8, color: RED, fontWeight: 600, fontSize: 17 }}>
        <MicGlyph />
        Turn on voice
      </button>
      <p style={{ margin: 0, fontSize: 15, color: SEC, textAlign: "center" }}>{note}</p>
    </div>
  );
}

/* ---------- glyphs ---------- */

export function MicGlyph({ color = RED, size = 22 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill={color} aria-hidden>
      <rect x={10} y={4} width={8} height={14} rx={4} />
      <path d="M7 13a7 7 0 0 0 14 0h-2a5 5 0 0 1-10 0z" />
      <rect x={13} y={20} width={2} height={4} />
    </svg>
  );
}

export function SpeakerGlyph({ off, size = 16, color = RED }: { off?: boolean; size?: number; color?: string }) {
  return (
    <svg width={size} height={size * 0.87} viewBox="0 0 30 26" aria-hidden>
      <path d="M3 9h5l7-6v20l-7-6H3z" fill={off ? PH : color} />
      {off ? (
        <path d="M19 9l7 8M26 9l-7 8" stroke={PH} strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <path d="M19 8a6 6 0 0 1 0 10M22.5 4.5a11 11 0 0 1 0 17" stroke={color} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function QuestionGlyph() {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13z" fill="none" stroke={RED} strokeWidth={1.6} />
      <path d="M6.2 6.3a1.9 1.9 0 0 1 3.7.5c0 1.2-1.7 1.4-1.7 2.6" stroke={RED} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx={8.1} cy={11.6} r={0.9} fill={RED} />
    </svg>
  );
}

const TRANSPORT_PATHS: Record<string, ReactNode> = {
  walk: <><circle cx={15} cy={5} r={3} /><path d="M13 9.5h3.5l2.5 5 3 1.5-1 2-4-2-1-2-1.5 4 3 3v5h-2.5v-4l-3-2.5-2 6.5H8l2.5-9 1.5-4-2.5 1.5V19H7v-6l6-3.5z" /></>,
  bus: <><rect x={5} y={4} width={18} height={17} rx={4} /><rect x={8} y={8} width={12} height={6} rx={1.5} fill={WHITE} /><circle cx={9.5} cy={23} r={2.5} /><circle cx={18.5} cy={23} r={2.5} /></>,
  car: <><path d="M6 12 8.2 6.6A2.5 2.5 0 0 1 10.5 5h7a2.5 2.5 0 0 1 2.3 1.6L22 12h1.5a1.5 1.5 0 0 1 1.5 1.5V19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-1H8v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5.5A1.5 1.5 0 0 1 4.5 12z" /><rect x={9} y={7.5} width={10} height={4} rx={1} fill={WHITE} /></>,
  ride: <><circle cx={8} cy={7} r={3} /><path d="M3 20a5 5 0 0 1 10 0z" /><path d="M14 13l1.6-3.6A2 2 0 0 1 17.4 8h4.2a2 2 0 0 1 1.8 1.4L25 13h.5a1.5 1.5 0 0 1 1.5 1.5V19a1.5 1.5 0 0 1-1.5 1.5H24V19h-7v1.5h-1.5A1.5 1.5 0 0 1 14 19z" /></>,
};
export const TRANSPORT_KEYS = ["walk", "bus", "car", "ride"] as const;

export function TransportIcon({ k }: { k: (typeof TRANSPORT_KEYS)[number] }) {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill={INK} aria-hidden>
      {TRANSPORT_PATHS[k]}
    </svg>
  );
}

const TAB_PATHS: Record<string, ReactNode> = {
  Home: <path d="M12 3.6 3.4 10.7v8.4a1.9 1.9 0 0 0 1.9 1.9h13.4a1.9 1.9 0 0 0 1.9-1.9v-8.4z" />,
  Jobs: <path d="M9 7.5V6.3A2.3 2.3 0 0 1 11.3 4h1.4A2.3 2.3 0 0 1 15 6.3v1.2h3.2A2.8 2.8 0 0 1 21 10.3v7.9a2.8 2.8 0 0 1-2.8 2.8H5.8A2.8 2.8 0 0 1 3 18.2v-7.9a2.8 2.8 0 0 1 2.8-2.8zm1.9 0h2.2V6.3a.4.4 0 0 0-.4-.4h-1.4a.4.4 0 0 0-.4.4z" />,
  Skills: <><path fillRule="evenodd" d="M3.4 9.2a5.6 5.6 0 1 0 11.2 0a5.6 5.6 0 1 0-11.2 0zM7 9.2a2 2 0 1 0 4 0a2 2 0 1 0-4 0z" /><circle cx={16.2} cy={15.6} r={4.7} /><circle cx={16.8} cy={6.4} r={2.6} /></>,
  Profile: <><path d="M3.8 21a8.2 8.2 0 0 1 16.4 0z" /><circle cx={12} cy={8} r={4.2} /></>,
};

export function TabBar({ active = "Home" }: { active?: keyof typeof TAB_PATHS }) {
  return (
    <div aria-hidden className="absolute bottom-0 left-0 flex justify-between" style={{ width: W, height: 83, background: GROUND, borderTop: "0.5px solid rgba(20,20,20,.22)", padding: "8px 10px 0" }}>
      {(Object.keys(TAB_PATHS) as (keyof typeof TAB_PATHS)[]).map((k) => {
        const c = k === active ? RED : PH;
        return (
          <span key={k} className="flex flex-col items-center" style={{ width: 70, height: 39, gap: 3, color: c }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill={c}>{TAB_PATHS[k]}</svg>
            <span style={{ fontSize: 10, lineHeight: "12px" }}>{k}</span>
          </span>
        );
      })}
    </div>
  );
}

export function HomeIndicator() {
  return <span aria-hidden className="absolute" style={{ left: 126.5, top: 839, width: 140, height: 5, borderRadius: 3, background: INK }} />;
}

/** The match lens from the Profile screen. */
export function Lens({ pct }: { pct: string }) {
  return (
    <span aria-label={`${pct} match`} className="relative shrink-0" style={{ width: 64, height: 64 }}>
      <i className="absolute" style={{ left: 5, top: 12, width: 40, height: 40, borderRadius: 20, background: NAVY }} />
      <i className="absolute" style={{ left: 19, top: 12, width: 40, height: 40, borderRadius: 20, background: RED, mixBlendMode: "multiply" }} />
      <span className="absolute left-0 right-0 text-center" style={{ top: 22, color: WHITE, fontWeight: 700, fontSize: 15 }}>{pct}</span>
    </span>
  );
}

export const BUBBLE_COLORS: Record<string, string> = { soft: BLUE, hard: RED, trait: INK };
export { YELLOW };
