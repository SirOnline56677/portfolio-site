import Image from "next/image";
import {
  NAVY,
  GOLD,
  FOOT_BG,
  MUTED,
  display,
  sans,
} from "./wb";
import {
  MenuCard,
  MobileHeader,
  PastRow,
  ProfileCard,
  SpinCard,
  type SpinCardData,
} from "./ui";

const G = "/work/wb-free-spins/games";

// Ring-draw and label-swap windows follow the motion mock in the Figma file
// (node 3652-1666): one 2s loop, rings drawing in staggered, each count
// ticking +1 as its ring lands.
const CARDS: SpinCardData[] = [
  {
    game: "STARBURST",
    src: `${G}/starburst.png`,
    tag: "2 FREE SPINS",
    fill: 0.5,
    count: "1 of 2 Spins",
    countNext: "2 of 2 Spins",
    expires: "Expires: 5 hours",
    wins: "$0.80",
    draw: "0,0.65",
    swap: "0.65,0.75",
  },
  {
    game: "ALLSTAR SCRATCH CARD",
    src: `${G}/allstar-scratch.png`,
    tag: "2 FREE SPINS",
    fill: 0,
    count: "0 of 2 Spins",
    countNext: "1 of 2 Spins",
    expires: "Expires: 05/23/23",
    wins: "$0.00",
    draw: "0.1,0.75",
    swap: "0.75,0.85",
  },
  {
    game: "NETENT FREE SPINS",
    src: `${G}/netent.png`,
    tag: "25 FREE SPINS",
    fill: 0.08,
    count: "2 of 25 Spins",
    countNext: "3 of 25 Spins",
    expires: "Expires: 05/29/23",
    wins: "$2.00",
    draw: "0.2,0.85",
    swap: "0.85,0.95",
  },
];

function GoldHeading({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-[20px] tracking-[0.4px]" style={{ fontFamily: display, color: GOLD }}>
        {children}
      </span>
      {right}
    </div>
  );
}

/** Title + available cards + past spins + disclaimer, in either arrangement. */
function SpinsContent({ layout }: { layout: "stack" | "row" }) {
  return (
    <div style={{ fontFamily: sans }}>
      <p className="text-[16px] font-bold leading-[22px]" style={{ color: "#080c19" }}>
        Bonus Spins
      </p>
      <p className="mt-[10px] text-[14px] font-medium tracking-[0.28px]" style={{ color: "#080c19" }}>
        Your available spins, all in one place. Play them before they expire.
      </p>
      <div className="mt-[28px]">
        <GoldHeading>AVAILABLE SPINS</GoldHeading>
      </div>
      <div className={layout === "row" ? "mt-[14px] flex gap-[15px]" : "mt-[14px] flex flex-col gap-[36px]"}>
        {CARDS.map((c) => (
          <div key={c.game} className={layout === "row" ? "min-w-0 flex-1" : undefined}>
            <SpinCard data={c} />
          </div>
        ))}
      </div>
      <div className="mt-[32px]">
        <GoldHeading
          right={
            <span className="text-[11px] font-medium" style={{ color: MUTED }}>
              Last 30 days
            </span>
          }
        >
          PAST SPINS
        </GoldHeading>
      </div>
      <div className="mt-[16px]">
        <PastRow game="7UP!" src={`${G}/7up.png`} kind="expired" />
        <div className="mt-[20px]">
          <PastRow game="MYSTIC CHIEF" src={`${G}/mystic-chief.png`} kind="completed" />
        </div>
      </div>
      <div
        className={`mt-[36px] px-[28px] py-[20px] ${layout === "stack" ? "-mx-[32px]" : "rounded-[4px]"}`}
        style={{ background: FOOT_BG }}
      >
        <p className="text-[14px] font-medium tracking-[0.28px]" style={{ color: MUTED }}>
          Spin wins are unlocked and converted to cash once all spins are completed prior to the
          expiration date. All winning will be forfeited if the spins expire.
        </p>
      </div>
    </div>
  );
}

/** Mobile Account screen (Figma 2729-1644). */
export function AccountMobile() {
  return (
    <div className="w-[428px] bg-white pb-[40px]">
      <MobileHeader title="ACCOUNT" />
      <div className="px-[25px]">
        <div className="mt-[19px]">
          <ProfileCard />
        </div>
        <div className="mt-[20px]">
          <MenuCard marker="row" />
        </div>
      </div>
    </div>
  );
}

/** Mobile Bonus Spins screen (Figma 2852-2920). */
export function SpinsMobile() {
  return (
    <div className="w-[428px] bg-white pb-[10px]">
      <MobileHeader title="BONUS SPINS" />
      <div className="px-[32px] pt-[40px]">
        <SpinsContent layout="stack" />
      </div>
    </div>
  );
}

function NavLink({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[16px] font-bold text-white" style={{ fontFamily: sans }}>
      {children}
    </span>
  );
}

/** Desktop account area (Figma 2785-2073): navbar + sidebar + content. */
export function DesktopScreen() {
  return (
    <div className="w-[1512px] bg-white pb-[46px]" style={{ fontFamily: sans }}>
      <div className="flex h-[80px] items-center pl-[77px] pr-[77px]" style={{ background: NAVY }}>
        <Image
          src={`${G}/wynnbet-logo.svg`}
          width={157}
          height={27}
          alt="WynnBET"
          style={{ width: 157, height: 27 }}
        />
        <span className="ml-[31px]">
          <NavLink>Casino</NavLink>
        </span>
        <span className="ml-[56px]">
          <NavLink>Promotions</NavLink>
        </span>
        <div className="ml-auto flex h-[39px] w-[303px] items-center gap-[8px] rounded-[2px] bg-white px-[10px]">
          <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden>
            <circle cx={7} cy={7} r={5} fill="none" stroke={MUTED} strokeWidth={1.8} />
            <line x1={11} y1={11} x2={15} y2={15} stroke={MUTED} strokeWidth={1.8} strokeLinecap="round" />
          </svg>
          <span className="text-[12px] font-medium" style={{ color: MUTED }}>
            Search All Games
          </span>
        </div>
        <div
          className="ml-[39px] flex h-[39px] w-[91px] items-center gap-[7px] rounded-[8px] border px-[8px]"
          style={{ background: "#0d2140", borderColor: "#2b3a5e" }}
        >
          <span
            className="flex h-[16px] w-[16px] items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ background: "#2fa153", lineHeight: 1 }}
          >
            +
          </span>
          <span className="text-[10px] font-bold text-white tabular-nums">$1,987.24</span>
        </div>
        <div
          className="ml-[5px] flex h-[39px] w-[39px] items-center justify-center rounded-[8px]"
          style={{ background: GOLD }}
        >
          <svg width={16} height={18} viewBox="0 0 16 18" aria-hidden>
            <circle cx={8} cy={5} r={4} fill="none" stroke="#fff" strokeWidth={1.8} />
            <path d="M1.5 17c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" fill="none" stroke="#fff" strokeWidth={1.8} />
          </svg>
        </div>
        <span
          className="ml-[22px] flex h-[24px] w-[24px] items-center justify-center rounded-full text-[8px] font-extrabold text-white"
          style={{ background: "#2e8f3c" }}
        >
          RG
        </span>
      </div>
      <div
        className="flex h-[50px] items-center justify-center border-b"
        style={{ borderColor: "#e5e7eb" }}
      >
        <span className="text-[16px] tracking-[0.5px]" style={{ fontFamily: display, color: GOLD }}>
          MY ACCOUNT
        </span>
      </div>
      <div className="flex gap-[32px] px-[77px] pt-[27px]">
        <div className="w-[363px] flex-none">
          <ProfileCard />
          <div className="mt-[20px]">
            <MenuCard marker="edge" />
          </div>
        </div>
        <div className="min-w-0 flex-1 pt-[11px]">
          <SpinsContent layout="row" />
        </div>
      </div>
    </div>
  );
}
