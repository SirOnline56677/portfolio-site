import Image from "next/image";
import {
  NAVY,
  GOLD,
  PLUM,
  PLAY_BLUE,
  COMPLETED_BLUE,
  EXPIRED_GRAY,
  TILE_PURPLE,
  WINS_BG,
  MUTED,
  CARD_SHADOW,
  HEADER_SHADOW,
  display,
  sans,
} from "./wb";

// Shared pieces of the WynnBET account area, rebuilt at the Figma frames'
// native pixel values. Everything here renders the FINAL animation state —
// server HTML and reduced-motion readers see the finished story; the
// FreeSpinsMoment orchestrator rewinds via [data-fs] hooks and plays.

export function Chevron({
  size = 12,
  color = NAVY,
  dir = "down",
  dataFs,
}: {
  size?: number;
  color?: string;
  dir?: "down" | "up" | "left";
  dataFs?: string;
}) {
  const rot = dir === "up" ? 180 : dir === "left" ? 90 : 0;
  return (
    <svg
      width={size}
      height={size * 0.62}
      viewBox="0 0 12 7.5"
      style={{ transform: `rotate(${rot}deg)` }}
      data-fs={dataFs}
      aria-hidden
    >
      <path
        d="M1.4 1.2 6 5.8 10.6 1.2"
        fill="none"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Pin() {
  return (
    <svg width={10} height={13} viewBox="0 0 10 13" aria-hidden>
      <path
        d="M5 0a5 5 0 0 0-5 5c0 3.5 5 8 5 8s5-4.5 5-8a5 5 0 0 0-5-5Zm0 6.8A1.8 1.8 0 1 1 5 3.2a1.8 1.8 0 0 1 0 3.6Z"
        fill={GOLD}
      />
    </svg>
  );
}

function Lock() {
  return (
    <svg width={11} height={14} viewBox="0 0 11 14" aria-hidden>
      <rect x={0.5} y={5.5} width={10} height={8} rx={1.5} fill={NAVY} />
      <path
        d="M2.5 5.5V4a3 3 0 0 1 6 0v1.5"
        fill="none"
        stroke={NAVY}
        strokeWidth={1.6}
      />
    </svg>
  );
}

export function StatusPill({
  kind,
  dataFs,
}: {
  kind: "completed" | "expired";
  dataFs?: string;
}) {
  return (
    <span
      data-fs={dataFs}
      className="inline-flex h-[16px] items-center rounded-[4px] px-[10px] text-[8px] font-extrabold text-white"
      style={{
        background: kind === "completed" ? COMPLETED_BLUE : EXPIRED_GRAY,
        fontFamily: sans,
        letterSpacing: "0.02em",
      }}
    >
      {kind === "completed" ? "COMPLETED" : "EXPIRED"}
    </span>
  );
}

export function GamePic({
  src,
  alt,
  size = 68,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  return (
    <Image
      src={src}
      width={size}
      height={size}
      alt={alt}
      className="rounded-[14px]"
      style={{ width: size, height: size }}
    />
  );
}

/** Game art inside the circular spin-progress ring (Figma: 118px, 5px gold
 * round-cap stroke). The arc renders the design's static fill; the Moment's
 * loop redraws it from empty to full per the mocked Figma timeline. */
export function RingPic({
  src,
  alt,
  fill,
  draw,
}: {
  src: string;
  alt: string;
  /** Static design fill fraction, 0–1 — what server/reduced-motion shows. */
  fill: number;
  /** Ring-draw window [start, end] of the 2s loop, e.g. "0,0.65". */
  draw?: string;
}) {
  const R = 56.5;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative mx-auto h-[118px] w-[118px]">
      <svg width={118} height={118} viewBox="0 0 118 118" className="absolute inset-0" aria-hidden>
        <circle cx={59} cy={59} r={R} fill="none" stroke="#e7e9ef" strokeWidth={5} />
        <circle
          cx={59}
          cy={59}
          r={R}
          fill="none"
          stroke={GOLD}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - fill)}
          transform="rotate(-90 59 59)"
          data-fs={draw ? "ring" : undefined}
          data-c={draw ? C : undefined}
          data-w={draw}
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <GamePic src={src} alt={alt} />
      </div>
    </div>
  );
}

export type SpinCardData = {
  game: string;
  src: string;
  tag: string;
  /** Static design fill of the progress ring. */
  fill: number;
  count: string;
  /** The label after one more spin plays (crossfaded in by the loop). */
  countNext: string;
  expires: string;
  wins: string;
  /** Ring-draw window of the 2s loop, "start,end". */
  draw: string;
  /** Label-swap window of the 2s loop, "start,end". */
  swap: string;
};

export function SpinCard({ data }: { data: SpinCardData }) {
  const d = data;
  return (
    <div
      className="relative flex w-full flex-col rounded-[6px] bg-white"
      style={{ boxShadow: CARD_SHADOW, fontFamily: sans }}
    >
      <span
        className="flex h-[17px] items-center self-start rounded-br-[4px] rounded-tl-[6px] px-[11px] text-[9px] font-extrabold text-white"
        style={{ background: PLUM }}
      >
        {d.tag}
      </span>
      <div className="mt-[14px]">
        <RingPic src={d.src} alt={d.game} fill={d.fill} draw={d.draw} />
      </div>
      {/* the count and its +1 future crossfade in place as the ring lands */}
      <div className="relative mt-[12px] h-[18px] text-[12px] font-semibold" style={{ color: NAVY }}>
        <p data-fs="count-a" data-w={d.swap} className="absolute inset-0 text-center">
          {d.count}
        </p>
        <p data-fs="count-b" data-w={d.swap} className="absolute inset-0 text-center" style={{ opacity: 0 }}>
          {d.countNext}
        </p>
      </div>
      <p
        className="mt-[2px] text-center text-[20px] leading-[22px] tracking-[0.4px]"
        style={{ fontFamily: display, color: NAVY }}
      >
        {d.game}
      </p>
      <p className="text-center text-[12px] font-medium leading-[24px]" style={{ color: NAVY }}>
        {d.expires}
      </p>
      <p className="mb-[14px] mt-[8px] text-center text-[12px] font-bold" style={{ color: PLAY_BLUE }}>
        PLAY
      </p>
      <div
        className="mt-auto flex h-[46px] items-center justify-between px-[24px]"
        style={{ background: WINS_BG }}
      >
        <span className="flex items-center gap-[8px] text-[14px] font-semibold" style={{ color: NAVY }}>
          <Lock /> Spin Wins:
        </span>
        <span className="text-[14px] font-semibold tabular-nums" style={{ color: NAVY }}>
          {d.wins}
        </span>
      </div>
    </div>
  );
}

export function PastRow({
  game,
  src,
  kind,
  pillFs,
}: {
  game: string;
  src: string;
  kind: "completed" | "expired";
  pillFs?: string;
}) {
  return (
    <div
      className="flex h-[102px] w-full items-center gap-[16px] rounded-[6px] bg-white px-[20px]"
      style={{ boxShadow: CARD_SHADOW, fontFamily: sans }}
    >
      <GamePic src={src} alt={game} />
      <div className="flex flex-col gap-[6px]">
        <span>
          <StatusPill kind={kind} dataFs={pillFs} />
        </span>
        <span
          className="text-[20px] leading-[22px] tracking-[0.4px]"
          style={{ fontFamily: display, color: NAVY }}
        >
          {game}
        </span>
      </div>
      <span className="ml-auto flex gap-[4px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[6px] w-[6px] rounded-full" style={{ background: NAVY }} />
        ))}
      </span>
    </div>
  );
}

/** iPhone status bar: time, dynamic island, signal/wifi/battery.
 * `compact` sizes it for the 375-wide prototype frames. */
export function StatusBar({ compact }: { compact?: boolean }) {
  const c = compact;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0" style={{ height: c ? 40 : 48 }} aria-hidden>
      <span
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ background: "#000", top: c ? 8 : 10, height: c ? 29 : 34, width: c ? 106 : 122 }}
      />
      <span
        className="absolute font-semibold text-white"
        style={{ fontFamily: sans, letterSpacing: "0.02em", left: c ? 26 : 32, top: c ? 13 : 16, fontSize: c ? 14 : 16 }}
      >
        9:41
      </span>
      <span className="absolute flex items-center gap-[7px]" style={{ right: c ? 20 : 26, top: c ? 15 : 19 }}>
        <svg width={18} height={12} viewBox="0 0 18 12" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={i * 4.6} y={9 - (3 + i * 2)} width={3.2} height={3 + i * 2} rx={1} fill="#fff" />
          ))}
        </svg>
        <svg width={17} height={12} viewBox="0 0 17 12" aria-hidden>
          <path
            d="M8.5 11 2.2 4.7a9 9 0 0 1 12.6 0Z"
            fill="none"
          />
          <path d="M1.2 3.9a10.3 10.3 0 0 1 14.6 0L14.2 5.5a8 8 0 0 0-11.4 0Z" fill="#fff" />
          <path d="M3.9 6.6a6.5 6.5 0 0 1 9.2 0l-1.7 1.7a4.1 4.1 0 0 0-5.8 0Z" fill="#fff" />
          <circle cx={8.5} cy={10} r={1.7} fill="#fff" />
        </svg>
        <svg width={25} height={12} viewBox="0 0 25 12" aria-hidden>
          <rect x={0.5} y={0.5} width={21} height={11} rx={3.5} fill="none" stroke="#fff" strokeOpacity={0.5} />
          <rect x={2} y={2} width={15} height={8} rx={2} fill="#fff" />
          <path d="M23 4v4a2.2 2.2 0 0 0 0-4Z" fill="#fff" fillOpacity={0.5} />
        </svg>
      </span>
    </div>
  );
}

/** Mobile screen header bar (ACCOUNT / BONUS SPINS) with iPhone status bar. */
export function MobileHeader({ title }: { title: string }) {
  return (
    <div
      className="relative flex h-[112px] items-center justify-center"
      style={{ background: NAVY, boxShadow: HEADER_SHADOW, paddingTop: 44 }}
    >
      <StatusBar />
      <span className="absolute left-[20px] top-[72px]">
        <Chevron size={16} color={GOLD} dir="left" />
      </span>
      <span
        className="text-[20px] tracking-[0.4px] text-white"
        style={{ fontFamily: display }}
      >
        {title}
      </span>
    </div>
  );
}

/** Profile card: balances + the Bet Credits / Free Spins stat tiles. */
export function ProfileCard() {
  return (
    <div
      className="rounded-[6px] bg-white p-[18px]"
      style={{ boxShadow: CARD_SHADOW, fontFamily: sans, color: NAVY }}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[24px] tracking-[0.48px]" style={{ fontFamily: display }}>
          John Doe
        </span>
        <span className="flex items-center gap-[5px] text-[20px] tracking-[0.4px]" style={{ fontFamily: display }}>
          MA <Pin />
        </span>
      </div>
      <div className="flex justify-between text-[11px] font-medium">
        <span>johndoe1-2949</span>
        <span>Location</span>
      </div>
      <div className="mt-[16px] flex">
        <div className="flex-1">
          <span className="flex items-center gap-[6px] text-[12px] font-bold tracking-[0.24px]">
            Balance <Chevron size={9} />
          </span>
          <span className="text-[20px] tracking-[0.4px]" style={{ fontFamily: display }}>
            $100.00
          </span>
        </div>
        <div className="w-px self-stretch" style={{ background: "#d9dce3" }} />
        <div className="flex-1 pl-[20px]">
          <span className="flex items-center gap-[6px] text-[12px] font-bold tracking-[0.24px]">
            Bonus <Chevron size={9} />
          </span>
          <span className="text-[20px] tracking-[0.4px]" style={{ fontFamily: display }}>
            $40.00
          </span>
        </div>
      </div>
      <div className="mt-[14px] flex gap-[14px]">
        {/* gradient-border stat tiles, per the design's video reference */}
        {[
          ["Bet Credits", "1", `linear-gradient(90deg, ${NAVY}, #009af5)`],
          ["Free Spins", "28", `linear-gradient(90deg, ${TILE_PURPLE}, #a4459f)`],
        ].map(([label, value, grad]) => (
          <div key={label} className="h-[80px] flex-1 rounded-[8px] p-[4px]" style={{ background: grad }}>
            <div className="h-full w-full rounded-[5px] bg-white px-[12px] pt-[8px]">
              <div className="text-[12px] font-bold tracking-[0.24px]">{label}</div>
              <div
                data-fs={label === "Free Spins" ? "fs-count" : undefined}
                className="text-[20px] tracking-[0.4px] tabular-nums"
                style={{ fontFamily: display }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mobile and desktop carry slightly different bonus lists in the design —
// desktop drops Bet Insurance and words the descriptions differently.
const BONUS_ROWS_MOBILE: [string, string][] = [
  ["Bet Credits", "Your credits to apply to a sports bet."],
  ["Odds Boosts", "Your boosts to increase your potential payout."],
  ["Bet Insurance", "Set your session time limit"],
  ["Sports Bonuses", "Your sports bonuses"],
  ["Casino Bonuses", "Your casino bonuses"],
  ["Bonus Spins", "Available bonus spins on specific games"],
];
const BONUS_ROWS_DESKTOP: [string, string][] = [
  ["Bet Credits", "Credits to apply to your bets"],
  ["Odds Boosts", "Increase your payouts with boosts"],
  ["Sports Bonuses", "Bonus cash to bet on sports"],
  ["Casino Bonuses", "Bonus cash to wager on casino games"],
  ["Bonus Spins", "Available bonus spins on specific games"],
];

function MenuHeading({ label, open }: { label: string; open?: boolean }) {
  return (
    <div className="flex items-center justify-between pt-[26px]">
      <span className="text-[24px]" style={{ fontFamily: display, color: open ? GOLD : NAVY }}>
        {label}
      </span>
      <Chevron dir={open ? "up" : "down"} />
    </div>
  );
}

/** Account menu card, My Bonuses open with Bonus Spins marked — static,
 * matching the motion reference (only the spin rings animate). */
export function MenuCard({ marker }: { marker: "row" | "edge" }) {
  const rows = marker === "edge" ? BONUS_ROWS_DESKTOP : BONUS_ROWS_MOBILE;
  return (
    <div
      className="relative rounded-[6px] bg-white px-[20px] pb-[30px] pt-[6px]"
      style={{ boxShadow: CARD_SHADOW, fontFamily: sans, color: NAVY }}
    >
      <MenuHeading label="Wallet" />
      <MenuHeading label="My Bonuses" open />
      <div className="pt-[14px]">
        {rows.map(([title, desc]) => {
          const isBonus = title === "Bonus Spins";
          return (
            <div key={title} className="relative mb-[20px] rounded-[4px] pl-[16px]">
              {isBonus ? (
                <span
                  className={
                    marker === "row"
                      ? "absolute left-0 top-[2px] h-[32px] w-[4px] rounded-full"
                      : "absolute left-[-20px] top-[-6px] h-[46px] w-[8px]"
                  }
                  style={{ background: GOLD }}
                />
              ) : null}
              <div className="text-[14px] font-semibold">{title}</div>
              <div className="text-[11px] font-medium" style={{ color: MUTED }}>
                {desc}
              </div>
            </div>
          );
        })}
      </div>
      <MenuHeading label="Responsible Gaming" />
      <MenuHeading label="Account Settings" />
      <MenuHeading label="Support" />
      <div className="pt-[34px] text-[14px] font-bold">LOG OUT</div>
    </div>
  );
}
