import Image from "next/image";
import { GOLD, NAVY } from "./wb";

// Static study graphics for the Free Spins case study. Like the other
// case-study components: structure and text sit on the page ground and use
// theme tokens (they invert); WynnBET navy/gold stay fixed brand accents.

const G = "/work/wb-free-spins/games";
const divAt = (pct: number) => `color-mix(in srgb, var(--color-divider) ${pct}%, transparent)`;

function SpinPip({ n }: { n: string }) {
  return (
    <span
      className="flex h-[20px] w-[20px] flex-none items-center justify-center rounded-full text-[11px] font-bold"
      style={{ background: GOLD, color: NAVY }}
    >
      {n}
    </span>
  );
}

function SurfaceChip({ name, sub }: { name: string; sub: string }) {
  return (
    <span
      className="inline-flex items-center gap-3 rounded-[10px] border px-4 py-[10px]"
      style={{ borderColor: divAt(45) }}
    >
      <SpinPip n="3" />
      <span>
        <span className="block font-[family-name:var(--font-body)] text-[13.5px] font-medium leading-[1.2] text-ink">
          {name}
        </span>
        <span className="block font-[family-name:var(--font-body)] text-[11.5px] font-light text-muted">
          {sub}
        </span>
      </span>
    </span>
  );
}

/** Solutions: before, a spin lived inside its game; after, three surfaces. */
export function SpinSurfaces() {
  return (
    <div className="my-12 flex max-w-[660px] flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-[52px] font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.16em] text-muted">
          Before
        </span>
        <span
          className="inline-flex items-center gap-3 rounded-[10px] border border-dashed px-4 py-[10px]"
          style={{ borderColor: divAt(50) }}
        >
          <svg width={14} height={17} viewBox="0 0 14 17" aria-hidden>
            <rect x={1} y={7} width={12} height={9} rx={1.8} fill="none" stroke="var(--color-muted)" strokeWidth={1.6} />
            <path d="M3.5 7V4.8a3.5 3.5 0 0 1 7 0V7" fill="none" stroke="var(--color-muted)" strokeWidth={1.6} />
          </svg>
          <span>
            <span className="block font-[family-name:var(--font-body)] text-[13.5px] font-medium leading-[1.2] text-muted">
              The awarding game
            </span>
            <span className="block font-[family-name:var(--font-body)] text-[11.5px] font-light text-muted">
              spins visible only in-game, then gone
            </span>
          </span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="w-[52px] font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.16em] text-muted">
          After
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <SurfaceChip name="Casino home" sub="the FREE(SPINS) banner" />
          <SurfaceChip name="Account profile" sub="the Free Spins counter" />
          <SurfaceChip name="Dedicated page" sub="every spin, every game" />
        </div>
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className="relative inline-block h-[12px] w-[22px] rounded-full"
      style={{ background: on ? GOLD : divAt(45) }}
      aria-label={on ? "offering free spins" : "off"}
    >
      <span
        className="absolute top-[2px] h-[8px] w-[8px] rounded-full bg-well"
        style={{ left: on ? 12 : 2 }}
      />
    </span>
  );
}

function FlowArrow() {
  return (
    <svg width={34} height={10} viewBox="0 0 34 10" className="flex-none" aria-hidden>
      <line x1={0} y1={5} x2={26} y2={5} stroke="var(--color-muted)" strokeWidth={1.3} strokeDasharray="4 4" />
      <path d="m26 1 6 4-6 4" fill="none" stroke="var(--color-muted)" strokeWidth={1.3} />
    </svg>
  );
}

/** Technical Challenge: the CMS decides which games offer spins, live. */
export function CmsFlow() {
  return (
    <div className="my-12 flex max-w-[720px] flex-wrap items-center gap-4">
      <span
        className="inline-flex flex-col rounded-[10px] px-4 py-[12px]"
        style={{ background: NAVY }}
      >
        <span className="font-[family-name:var(--font-body)] text-[13.5px] font-medium text-white">
          Casino CMS
        </span>
        <span className="font-[family-name:var(--font-body)] text-[11.5px] font-light" style={{ color: "rgba(255,255,255,0.65)" }}>
          ops flag games in &amp; out
        </span>
      </span>
      <FlowArrow />
      <span className="inline-flex items-center gap-4 rounded-[10px] border px-4 py-[10px]" style={{ borderColor: divAt(45) }}>
        {[
          ["starburst.png", true],
          ["netent.png", true],
          ["7up.png", false],
        ].map(([img, on]) => (
          <span key={img as string} className="flex flex-col items-center gap-[6px]">
            <Image
              src={`${G}/${img}`}
              width={34}
              height={34}
              alt=""
              className="rounded-[8px]"
              style={{ width: 34, height: 34, opacity: on ? 1 : 0.35 }}
            />
            <Toggle on={on as boolean} />
          </span>
        ))}
      </span>
      <FlowArrow />
      <span className="flex flex-col gap-2">
        {["Website", "App"].map((s) => (
          <span
            key={s}
            className="inline-flex items-center gap-2 rounded-[10px] border px-4 py-[6px]"
            style={{ borderColor: divAt(45) }}
          >
            <span className="h-[7px] w-[7px] rounded-full" style={{ background: GOLD }} />
            <span className="font-[family-name:var(--font-body)] text-[13px] font-medium text-ink">{s}</span>
          </span>
        ))}
        <span className="font-[family-name:var(--font-body)] text-[11.5px] font-light text-muted">
          updates live, no release
        </span>
      </span>
    </div>
  );
}

const PURPLE_GRAD = "linear-gradient(90deg, #43104f 0%, #8e24aa 100%)";
const LOCKUP = "/work/wb-free-spins/free-spins-icon.png";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-[family-name:var(--font-label)] text-[11px] uppercase tracking-[0.14em] text-muted">
      {children}
    </p>
  );
}

/** Design Solution: the Free Spins identity as a working system. */
export function BrandBoard() {
  return (
    <div className="my-12 flex max-w-[720px] flex-col gap-8">
      <div>
        <GroupLabel>The mark, on every ground</GroupLabel>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <span className="flex h-[92px] items-center justify-center rounded-[12px]" style={{ background: NAVY }}>
            <Image src={LOCKUP} width={626} height={144} alt="Free Spins mark on navy" style={{ width: "auto", height: 34 }} />
          </span>
          <span className="flex h-[92px] items-center justify-center rounded-[12px]" style={{ background: PURPLE_GRAD }}>
            <Image src={LOCKUP} width={626} height={144} alt="Free Spins mark on promo purple" style={{ width: "auto", height: 34 }} />
          </span>
          <span className="flex h-[92px] items-center justify-center rounded-[12px] border bg-white" style={{ borderColor: divAt(35) }}>
            <Image src={LOCKUP} width={626} height={144} alt="Free Spins mark on white" style={{ width: "auto", height: 34 }} />
          </span>
        </div>
      </div>
      <div>
        <GroupLabel>In product</GroupLabel>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="flex h-[46px] items-center gap-[10px] rounded-full px-[14px]" style={{ background: PURPLE_GRAD }}>
            <Image src={LOCKUP} width={626} height={144} alt="" style={{ width: "auto", height: 22 }} />
            <span className="text-[12px] font-semibold text-white" style={{ fontFamily: "var(--font-project)" }}>
              Spin For Free and Win Big!
            </span>
            <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-white text-[11px] font-bold" style={{ color: NAVY }}>
              3
            </span>
          </span>
          <span
            className="rounded-br-[4px] rounded-tl-[8px] px-[10px] py-[5px] text-[9px] font-extrabold text-white"
            style={{ background: "#400D4F", fontFamily: "var(--font-project)" }}
          >
            25 FREE SPINS
          </span>
          <span
            className="flex h-[36px] items-center rounded-[4px] px-[20px] text-[11px] font-bold text-white"
            style={{ background: "#b3924c", fontFamily: "var(--font-project)" }}
          >
            OPT IN
          </span>
        </div>
      </div>
    </div>
  );
}

const ISSUE_ICONS: Record<string, React.ReactNode> = {
  eye: (
    <svg width={17} height={17} viewBox="0 0 18 18" aria-hidden>
      <path d="M1.5 9s2.7-5 7.5-5 7.5 5 7.5 5-2.7 5-7.5 5-7.5-5-7.5-5Z" fill="none" stroke={GOLD} strokeWidth={1.6} />
      <circle cx={9} cy={9} r={2.2} fill="none" stroke={GOLD} strokeWidth={1.6} />
      <line x1={3} y1={15.5} x2={15} y2={2.5} stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  ),
  clock: (
    <svg width={17} height={17} viewBox="0 0 18 18" aria-hidden>
      <circle cx={9} cy={9} r={7} fill="none" stroke={GOLD} strokeWidth={1.6} />
      <path d="M9 5v4.2l3 1.8" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  ),
  ticket: (
    <svg width={17} height={17} viewBox="0 0 18 18" aria-hidden>
      <path
        d="M2 6.5V4.8C2 4 2.6 3.4 3.4 3.4h11.2c.8 0 1.4.6 1.4 1.4v1.7a2.2 2.2 0 0 0 0 5v1.7c0 .8-.6 1.4-1.4 1.4H3.4c-.8 0-1.4-.6-1.4-1.4v-1.7a2.2 2.2 0 0 0 0-5Z"
        fill="none"
        stroke={GOLD}
        strokeWidth={1.5}
      />
      <line x1={11} y1={4} x2={11} y2={14} stroke={GOLD} strokeWidth={1.4} strokeDasharray="2 2.4" />
    </svg>
  ),
  chart: (
    <svg width={17} height={17} viewBox="0 0 18 18" aria-hidden>
      <path d="M2 4l4.5 5 3.5-3 5.5 6.5" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 8.5v4h-4" fill="none" stroke={GOLD} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/** Icon-chip pill rows: a list of claims that reads at a glance. Rows use
 * theme tokens (they invert); the navy chip and gold glyphs stay fixed. */
function IssueList({ items }: { items: [keyof typeof ISSUE_ICONS, string][] }) {
  return (
    <div className="my-12 flex max-w-[560px] flex-col gap-3">
      {items.map(([icon, text]) => (
        <div
          key={text}
          className="flex items-center gap-4 rounded-[12px] border px-[18px] py-4"
          style={{
            background: "color-mix(in srgb, var(--color-divider) 10%, transparent)",
            borderColor: divAt(22),
          }}
        >
          <span
            className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[9px]"
            style={{ background: NAVY }}
          >
            {ISSUE_ICONS[icon]}
          </span>
          <p className="font-[family-name:var(--font-body)] text-[15px] font-light leading-[1.4] text-ink">
            {text}
          </p>
        </div>
      ))}
    </div>
  );
}

/** Problem section: the pinpointed issues behind the redesign. */
export function ProblemIssues() {
  return (
    <IssueList
      items={[
        ["eye", "No way to track spins outside the awarding game"],
        ["clock", "Spins expired without warning"],
        ["ticket", "Support compensated missed spins with bonuses"],
        ["chart", "Engagement and trust dropped"],
      ]}
    />
  );
}
