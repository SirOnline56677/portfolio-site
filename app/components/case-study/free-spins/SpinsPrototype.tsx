"use client";

import Image from "next/image";
import { useState } from "react";
import ScaledScreen from "./ScaledScreen";
import { GOLD, NAVY, PLAY_BLUE, PLUM, CARD_SHADOW, display, sans } from "./wb";
import { StatusBar } from "./ui";

// Interactive Free Spins flow, ported from the Figma prototype page
// ("Lobby Banner" flow, frames 2852:3103 → 3462 → 3623) with its wiring:
// the FREE(SPINS) lobby banner navigates to the Free Spins list, the NetEnt
// row pushes into its Spin Group, back chevrons pop, the Casino tab goes
// home. Screens push left/right at 300ms like the Figma transitions;
// reduced motion swaps instantly (motion-reduce).
const G = "/work/wb-free-spins/games";
const PURPLE_GRAD = "linear-gradient(90deg, #43104f 0%, #8e24aa 100%)";

function BalancePill() {
  return (
    <span
      className="ml-auto flex h-[30px] items-center gap-[6px] rounded-[6px] border px-[8px]"
      style={{ background: "#0d2140", borderColor: "#2b3a5e" }}
    >
      <span
        className="flex h-[14px] w-[14px] items-center justify-center rounded-full text-[10px] font-bold text-white"
        style={{ background: "#2fa153", lineHeight: 1 }}
      >
        +
      </span>
      <span className="text-[11px] font-bold text-white tabular-nums">$1,987.24</span>
    </span>
  );
}

function BackChevron({ onTap, pulse }: { onTap: () => void; pulse?: boolean }) {
  return (
    <button
      onClick={onTap}
      aria-label="Back"
      className="relative flex h-[34px] w-[34px] cursor-pointer items-center justify-center"
    >
      {pulse ? <PulseRing /> : null}
      <svg width={11} height={18} viewBox="0 0 11 18" aria-hidden>
        <path d="M9.5 1.5 2 9l7.5 7.5" fill="none" stroke={GOLD} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Soft attention ring on the screen's primary tap target. */
function PulseRing() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-[6px] rounded-full motion-reduce:hidden"
      style={{ boxShadow: `0 0 0 3px ${GOLD}`, animation: "fs-pulse 2s ease-out infinite" }}
    />
  );
}

function GameTile({
  src,
  size,
  badge,
  badgeColor,
  star,
}: {
  src: string;
  size: number;
  badge?: string;
  badgeColor?: string;
  star?: "gold" | "gray";
}) {
  return (
    <div className="relative overflow-clip rounded-[8px]" style={{ width: size, height: size }}>
      <Image src={src} width={size} height={size} alt="" style={{ width: size, height: size, objectFit: "cover" }} />
      {badge ? (
        <span
          className="absolute left-[6px] top-[6px] rounded-[3px] px-[6px] py-[2px] text-[8px] font-extrabold text-white"
          style={{ background: badgeColor }}
        >
          {badge}
        </span>
      ) : null}
      {star ? (
        <svg className="absolute right-[6px] top-[6px]" width={14} height={14} viewBox="0 0 14 14" aria-hidden>
          <path
            d="M7 .8 8.9 4.8l4.3.6-3.1 3 .7 4.3L7 10.6l-3.8 2 .7-4.2-3.1-3 4.3-.6Z"
            fill={star === "gold" ? "#f5c518" : "#c9ccd4"}
          />
        </svg>
      ) : null}
      <span
        className="absolute bottom-[6px] left-[6px] flex h-[13px] w-[13px] items-center justify-center rounded-full border text-[8px] font-semibold text-white"
        style={{ borderColor: "rgba(255,255,255,0.85)" }}
      >
        i
      </span>
    </div>
  );
}

function NavIcon({ src, label, active }: { src: string; label: string; active?: boolean }) {
  return (
    <span className="flex flex-1 flex-col items-center justify-center gap-[4px]" style={{ opacity: active ? 1 : 0.72 }}>
      <Image src={src} width={20} height={18} alt="" style={{ width: 20, height: 18, objectFit: "contain" }} />
      <span className="text-[8px] font-semibold tracking-[0.06em] text-white">{label}</span>
    </span>
  );
}

function BottomNav({ onCasino }: { onCasino: () => void }) {
  return (
    <div className="relative mt-auto flex h-[66px] items-center pb-[6px]" style={{ background: NAVY, fontFamily: sans }}>
      <span aria-hidden className="absolute bottom-[5px] left-1/2 h-[4px] w-[118px] -translate-x-1/2 rounded-full" style={{ background: "rgba(255,255,255,0.85)" }} />
      <button onClick={onCasino} aria-label="Casino tab" className="flex flex-1 cursor-pointer">
        <NavIcon src={`${G}/ic-casino.svg`} label="CASINO" active />
      </button>
      <span className="flex flex-1 flex-col items-center gap-[4px]" style={{ opacity: 0.72 }}>
        <svg width={18} height={18} viewBox="0 0 18 18" aria-hidden>
          <rect x={1.5} y={6} width={15} height={4} rx={1} fill="none" stroke="#fff" strokeWidth={1.5} />
          <rect x={3} y={10} width={12} height={6.5} rx={1} fill="none" stroke="#fff" strokeWidth={1.5} />
          <path d="M9 6v10.5M9 6C7 6 4.8 5.2 4.8 3.5 4.8 2.2 5.8 1.5 7 1.5c1.6 0 2 2.3 2 4.5Zm0 0c2 0 4.2-.8 4.2-2.5C13.2 2.2 12.2 1.5 11 1.5 9.4 1.5 9 3.8 9 6Z" fill="none" stroke="#fff" strokeWidth={1.5} />
        </svg>
        <span className="text-[8px] font-semibold tracking-[0.06em] text-white">PROMOS</span>
      </span>
      <span className="flex flex-1 flex-col items-center gap-[4px]" style={{ opacity: 0.72 }}>
        <span className="text-[17px] font-bold leading-[18px] text-white">$</span>
        <span className="text-[8px] font-semibold tracking-[0.06em] text-white">DEPOSIT</span>
      </span>
      <span className="flex flex-1 flex-col items-center gap-[4px]" style={{ opacity: 0.72 }}>
        <span className="text-[14px] font-bold leading-[18px] tracking-[0.15em] text-white">•••</span>
        <span className="text-[8px] font-semibold tracking-[0.06em] text-white">MORE</span>
      </span>
    </div>
  );
}

/** Single-color icon rendered via CSS mask so the white SVGs turn navy. */
function InkIcon({ src, size = 22 }: { src: string; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block"
      style={{
        width: size,
        height: size,
        background: NAVY,
        maskImage: `url(${G}/${src})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url(${G}/${src})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

function SectionHead({ title, seeAll }: { title: string; seeAll: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[15px] font-bold" style={{ color: NAVY }}>
        {title}
      </span>
      <span className="flex items-center gap-[4px] text-[11px] font-semibold" style={{ color: PLAY_BLUE }}>
        See All | {seeAll}
        <svg width={5} height={9} viewBox="0 0 5 9" aria-hidden>
          <path d="m1 1 3 3.5L1 8" fill="none" stroke={PLAY_BLUE} strokeWidth={1.4} strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

export function LobbyScreen({
  onBanner,
  active,
  showBanner = true,
}: {
  onBanner: () => void;
  active: boolean;
  showBanner?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-white" style={{ fontFamily: sans }}>
      <div className="relative flex h-[100px] flex-none items-end px-[16px] pb-[14px]" style={{ background: NAVY }}>
        <StatusBar compact />
        <Image src={`${G}/wynnbet-logo.svg`} width={96} height={18} alt="WynnBET" style={{ width: 96, height: 18 }} />
        <span className="mx-[10px] h-[22px] w-px" style={{ background: "rgba(255,255,255,0.3)" }} />
        <Image src={`${G}/rg-badge.png`} width={22} height={22} alt="" style={{ width: 22, height: 22 }} />
        <BalancePill />
        <svg className="ml-[10px]" width={17} height={19} viewBox="0 0 16 18" aria-hidden>
          <circle cx={8} cy={5} r={4} fill="none" stroke="#fff" strokeWidth={1.7} />
          <path d="M1.5 17c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" fill="none" stroke="#fff" strokeWidth={1.7} />
        </svg>
      </div>

      <div className="mx-[14px] mt-[14px] overflow-clip rounded-[8px]" style={{ boxShadow: CARD_SHADOW }}>
        <Image src={`${G}/hero-promo.jpg`} width={694} height={393} alt="Bet $100 & get $50 free bet promo" style={{ width: "100%", height: "auto" }} />
        <div className="flex h-[38px]">
          <span className="flex flex-1 items-center justify-center bg-white text-[11px] font-bold" style={{ color: NAVY }}>
            LEARN MORE
          </span>
          <span className="flex flex-1 items-center justify-center text-[11px] font-bold text-white" style={{ background: "#b3924c" }}>
            OPT IN
          </span>
        </div>
      </div>
      <div className="mt-[8px] flex items-center justify-center gap-[5px]">
        <span className="h-[3px] w-[22px] rounded-full" style={{ background: GOLD }} />
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-[3px] w-[14px] rounded-full" style={{ background: "#d4d7dd" }} />
        ))}
      </div>

      <div className="mt-[12px] flex justify-between px-[24px]">
        {[
          ["ic-search.svg", "SEARCH"],
          ["ic-slots.svg", "SLOTS"],
          ["ic-table.svg", "TABLE"],
        ].map(([icon, label]) => (
          <span key={label} className="flex w-[48px] flex-col items-center gap-[4px]">
            <InkIcon src={icon} />
            <span className="text-[8px] font-bold tracking-[0.04em]" style={{ color: NAVY }}>
              {label}
            </span>
          </span>
        ))}
        <span className="flex w-[48px] flex-col items-center gap-[4px]">
          <span
            className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: PLAY_BLUE }}
          >
            3
          </span>
          <span className="text-[8px] font-bold tracking-[0.04em]" style={{ color: NAVY }}>
            LIVE
          </span>
        </span>
        <span className="flex w-[48px] flex-col items-center gap-[4px]">
          <InkIcon src="ic-studio.svg" />
          <span className="text-[8px] font-bold tracking-[0.04em]" style={{ color: NAVY }}>
            STUDIO
          </span>
        </span>
      </div>

      {showBanner ? (
      <button
        onClick={onBanner}
        className="relative mx-[14px] mt-[16px] flex h-[52px] flex-none cursor-pointer items-center gap-[10px] rounded-full px-[8px] pr-[14px]"
        style={{ background: PURPLE_GRAD }}
        aria-label="Open Free Spins"
      >
        {active ? <PulseRing /> : null}
        <Image
          src="/work/wb-free-spins/free-spins-icon.png"
          width={626}
          height={144}
          alt="Free Spins"
          style={{ width: "auto", height: 24 }}
        />
        <span className="text-[13px] font-semibold text-white">Spin For Free and Win Big!</span>
        <span
          className="ml-auto flex h-[22px] w-[22px] flex-none items-center justify-center rounded-full bg-white text-[12px] font-bold"
          style={{ color: NAVY }}
        >
          3
        </span>
      </button>
      ) : null}

      <div className="mx-[14px] mt-[16px]">
        <SectionHead title="Recently Played" seeAll="12" />
        <div className="mt-[10px] flex gap-[10px] overflow-clip">
          <GameTile src={`${G}/7up.png`} size={109} badge="HOT" badgeColor="#ff6a00" />
          <GameTile src={`${G}/starburst.png`} size={109} badge="POPULAR" badgeColor={PLAY_BLUE} />
          <GameTile src={`${G}/mystic-chief.png`} size={109} />
        </div>
      </div>

      <div className="mx-[14px] mt-[14px] min-h-0 flex-1 overflow-clip">
        <SectionHead title="Top 10 Games" seeAll="10" />
        <div className="mt-[10px] flex gap-[10px]">
          <GameTile src={`${G}/tiny-gods.png`} size={168} />
          <GameTile src={`${G}/mystic-chief.png`} size={168} />
        </div>
      </div>

      <BottomNav onCasino={() => {}} />
    </div>
  );
}

function SpinRow({
  tag,
  img,
  name,
  expires,
  star,
  right,
  onTap,
  pulse,
}: {
  tag: string;
  img?: string;
  name: string;
  expires: string;
  star?: "gold" | "gray";
  right: "play" | "chevron";
  onTap?: () => void;
  pulse?: boolean;
}) {
  const Tag = onTap ? "button" : "div";
  return (
    <Tag
      onClick={onTap}
      className={`relative mt-[14px] block w-full rounded-[8px] bg-white text-left ${onTap ? "cursor-pointer" : ""}`}
      style={{ boxShadow: CARD_SHADOW }}
    >
      {pulse ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-[3px] rounded-[10px] motion-reduce:hidden"
          style={{ boxShadow: `0 0 0 3px ${GOLD}`, animation: "fs-pulse 2s ease-out infinite" }}
        />
      ) : null}
      <span
        className="absolute left-0 top-0 rounded-br-[4px] rounded-tl-[8px] px-[8px] py-[3px] text-[8px] font-extrabold text-white"
        style={{ background: PLUM }}
      >
        {tag}
      </span>
      {star ? (
        <svg className="absolute right-[10px] top-[8px]" width={16} height={16} viewBox="0 0 14 14" aria-hidden>
          <path
            d="M7 .8 8.9 4.8l4.3.6-3.1 3 .7 4.3L7 10.6l-3.8 2 .7-4.2-3.1-3 4.3-.6Z"
            fill={star === "gold" ? "#f5c518" : "none"}
            stroke={star === "gold" ? "none" : "#c9ccd4"}
            strokeWidth={1.2}
          />
        </svg>
      ) : null}
      <span className="flex items-center gap-[12px] px-[14px] pb-[14px] pt-[24px]">
        {img ? (
          <Image src={img} width={54} height={54} alt="" className="rounded-[8px]" style={{ width: 54, height: 54 }} />
        ) : null}
        <span>
          <span className="block text-[16px] leading-[19px] tracking-[0.3px]" style={{ fontFamily: display, color: NAVY }}>
            {name}
          </span>
          <span className="block text-[11px] font-medium" style={{ color: NAVY, fontFamily: sans }}>
            {expires}
          </span>
        </span>
        {right === "play" ? (
          <span className="ml-auto text-[12px] font-bold" style={{ color: PLAY_BLUE, fontFamily: sans }}>
            PLAY
          </span>
        ) : (
          <svg className="ml-auto" width={8} height={14} viewBox="0 0 8 14" aria-hidden>
            <path d="m1 1 6 6-6 6" fill="none" stroke="#9aa0ab" strokeWidth={1.8} strokeLinecap="round" />
          </svg>
        )}
      </span>
    </Tag>
  );
}

function JackpotScreen({
  onBack,
  onNetent,
  onCasino,
  active,
}: {
  onBack: () => void;
  onNetent: () => void;
  onCasino: () => void;
  active: boolean;
}) {
  return (
    <div className="flex h-full flex-col" style={{ background: "#f2f3f6", fontFamily: sans }}>
      <div className="relative flex h-[96px] flex-none items-end px-[10px] pb-[10px]" style={{ background: NAVY }}>
        <StatusBar compact />
        <BackChevron onTap={onBack} />
        <span className="ml-[6px] text-[18px] tracking-[0.4px] text-white" style={{ fontFamily: display }}>
          FREE SPINS
        </span>
        <BalancePill />
      </div>
      <div className="flex h-[60px] flex-none items-center px-[16px]" style={{ background: PURPLE_GRAD }}>
        <Image
          src="/work/wb-free-spins/free-spins-icon.png"
          width={626}
          height={144}
          alt="Free Spins"
          style={{ width: "auto", height: 28 }}
        />
        <span className="ml-auto mr-[10px] text-right text-[8px] font-bold leading-[11px] tracking-[0.08em] text-white">
          TOTAL
          <br />
          FREE SPINS
        </span>
        <span className="flex h-[24px] w-[24px] items-center justify-center rounded-full bg-white text-[13px] font-bold" style={{ color: NAVY }}>
          3
        </span>
      </div>

      <div className="mx-[14px]">
        <SpinRow tag="2 FREE SPINS" img={`${G}/starburst.png`} name="Starburst" expires="Expires: 05/23/23" star="gold" right="play" />
        <SpinRow tag="1 FREE SPIN" img={`${G}/allstar-scratch.png`} name="AllStar Scratch Card" expires="Expires: 08/09/23" star="gray" right="play" />
        <SpinRow
          tag="25 FREE SPINS"
          name="NETENT FREE SPINS"
          expires="Expires: 08/22/23"
          right="chevron"
          onTap={onNetent}
          pulse={active}
        />
      </div>

      <BottomNav onCasino={onCasino} />
    </div>
  );
}

const GRID: [string, string?, string?][] = [
  ["7up.png"], ["starburst.png", "POPULAR", PLAY_BLUE], ["mystic-chief.png"],
  ["tiny-gods.png"], ["allstar-scratch.png"], ["7up.png", "HOT", "#ff6a00"],
  ["7up.png"], ["starburst.png"], ["mystic-chief.png"],
  ["tiny-gods.png", "NEW", "#2e9e4f"], ["allstar-scratch.png"], ["7up.png"],
  ["7up.png"], ["starburst.png"], ["mystic-chief.png"],
  ["tiny-gods.png"], ["allstar-scratch.png"], ["7up.png"],
];

function SpinGroupScreen({
  onBack,
  onCasino,
  active,
}: {
  onBack: () => void;
  onCasino: () => void;
  active: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-white" style={{ fontFamily: sans }}>
      <div className="relative flex h-[96px] flex-none items-end px-[10px] pb-[10px]" style={{ background: NAVY }}>
        <StatusBar compact />
        <BackChevron onTap={onBack} pulse={active} />
        <span className="ml-[6px] text-[17px] tracking-[0.4px] text-white" style={{ fontFamily: display }}>
          NETENT FREE SPINS
        </span>
        <BalancePill />
      </div>
      <div className="mx-[10px] mt-[10px] grid min-h-0 flex-1 grid-cols-3 content-start gap-[6px] overflow-clip">
        {GRID.map(([img, badge, color], i) => (
          <GameTile key={i} src={`${G}/${img}`} size={113} badge={badge} badgeColor={color} />
        ))}
      </div>
      <BottomNav onCasino={onCasino} />
    </div>
  );
}

const HINTS = [
  "Try it: tap the FREE (SPINS) banner",
  "Tap NETENT FREE SPINS to see its games",
  "Tap the back chevron to step back out",
];

export default function SpinsPrototype() {
  const [active, setActive] = useState(0);
  const back = () => setActive((a) => Math.max(0, a - 1));
  const home = () => setActive(0);

  return (
    <div>
      <style>{`@keyframes fs-pulse { 0% { opacity: 0.9; transform: scale(0.98); } 70% { opacity: 0; transform: scale(1.06); } 100% { opacity: 0; transform: scale(1.06); } }`}</style>
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
              <ScaledScreen designW={375} shownH={812}>
                <div className="relative h-[812px] w-[375px] overflow-clip">
                  {[
                    <LobbyScreen key="lobby" onBanner={() => setActive(1)} active={active === 0} />,
                    <JackpotScreen key="jackpot" onBack={back} onNetent={() => setActive(2)} onCasino={home} active={active === 1} />,
                    <SpinGroupScreen key="group" onBack={back} onCasino={home} active={active === 2} />,
                  ].map((screen, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 transition-transform duration-300 ease-out motion-reduce:transition-none"
                      style={{ transform: `translateX(${(i - active) * 100}%)` }}
                      aria-hidden={i !== active}
                    >
                      {screen}
                    </div>
                  ))}
                </div>
              </ScaledScreen>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center font-[family-name:var(--font-label)] text-label uppercase tracking-[0.05em]" style={{ color: "#666" }}>
          {HINTS[active]}
        </p>
      </div>
      <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
        Interactive prototype: the lobby banner flow, wired as designed in Figma
      </p>
    </div>
  );
}
