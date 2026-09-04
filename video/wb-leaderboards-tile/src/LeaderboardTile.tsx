import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadPlexMono} from '@remotion/google-fonts/IBMPlexMono';

const {fontFamily: montserrat} = loadMontserrat('normal', {weights: ['500', '600', '700', '800']});
const {fontFamily: plexMono} = loadPlexMono('normal', {weights: ['500']});

// The Leaderboard Details standings, live under the page's real head (cropped
// from the Paper export), shuffling as scores accumulate: six scripted surges,
// then everyone glides back to the opening state so the loop cuts clean.
// Ground: navy base with a gold ember and teal wash drifting on sine paths
// that complete whole cycles over the loop.

const FPS = 30;
export const DURATION = 480; // 16s

const SCREEN = {left: 160, top: 171, w: 820, h: 969};
const HEAD_H = Math.round((490 / 1720) * SCREEN.w); // 234
const PAD = {top: 28, x: 45, bottom: 41};

const BASE: Record<string, number> = {
  'JOHN A.': 26253,
  'AMY S.': 23098,
  'DAVID G.': 21865,
  'HENRY H.': 19028,
  'SARAH F.': 18765,
  'SAM B.': 17421,
};
const NAMES = Object.keys(BASE);
const PRIZES = ['$2,500', '$2,500', '$2,500', '$500', '$400', '$300'];

const EVENTS = [
  {f: 42, name: 'HENRY H.', gain: 4300},
  {f: 105, name: 'DAVID G.', gain: 1600},
  {f: 168, name: 'HENRY H.', gain: 3100},
  {f: 231, name: 'SARAH F.', gain: 1200},
  {f: 294, name: 'HENRY H.', gain: 1400},
  {f: 357, name: 'AMY S.', gain: 2400},
];
const RESET_F = 420; // scores ease home, then rows glide back
const COUNT_LEN = 20;
const GLIDE_DELAY = 21;
const GLIDE_LEN = 19;
const GLOW_LEN = 45;

const rank = (s: Record<string, number>) => [...NAMES].sort((a, b) => s[b] - s[a]);

type Checkpoint = {f: number; scores: Record<string, number>; order: string[]; mover?: string};
const CHECKPOINTS: Checkpoint[] = (() => {
  const scores = {...BASE};
  const cps: Checkpoint[] = [{f: -1, scores: {...scores}, order: rank(scores)}];
  for (const ev of EVENTS) {
    scores[ev.name] += ev.gain;
    cps.push({f: ev.f, scores: {...scores}, order: rank(scores), mover: ev.name});
  }
  cps.push({f: RESET_F, scores: {...BASE}, order: rank(BASE)});
  return cps;
})();

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

function playerAt(frame: number, name: string) {
  let cur = 0;
  for (let i = 1; i < CHECKPOINTS.length; i++) if (CHECKPOINTS[i].f <= frame) cur = i;
  const cp = CHECKPOINTS[cur];
  const prev = CHECKPOINTS[Math.max(0, cur - 1)];

  // displayed score: count toward the current checkpoint if this player moved
  let score = cp.scores[name];
  const isReset = cur === CHECKPOINTS.length - 1;
  if (cur > 0 && (cp.mover === name || (isReset && prev.scores[name] !== cp.scores[name]))) {
    const k = interpolate(frame, [cp.f, cp.f + COUNT_LEN], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.out(Easing.cubic),
    });
    score = prev.scores[name] + (cp.scores[name] - prev.scores[name]) * k;
  }

  // slot: glide from the previous order to the current one shortly after the surge
  const from = prev.order.indexOf(name);
  const to = cp.order.indexOf(name);
  const slot =
    cur === 0
      ? to
      : interpolate(frame, [cp.f + GLIDE_DELAY, cp.f + GLIDE_DELAY + GLIDE_LEN], [from, to], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: easeOut,
        });

  // rank badge / medal styling snaps to the new order as the glide starts
  const styledSlot = cur > 0 && frame < cp.f + GLIDE_DELAY ? from : to;
  const glow = cur > 0 && cp.mover === name && frame >= cp.f && frame < cp.f + GLOW_LEN;
  return {score, slot, styledSlot, glow};
}

const ROW_STYLES: Record<number, {background: string; borderColor: string}> = {
  0: {background: 'linear-gradient(90deg, #E8C520 0%, #9C7E12 45%, #23283A 100%)', borderColor: '#EEB111'},
  1: {background: 'linear-gradient(90deg, #C9CDD4 0%, #7C838E 45%, #23283A 100%)', borderColor: '#C9CDD4'},
  2: {background: 'linear-gradient(90deg, #C08A1D 0%, #7A5A14 45%, #23283A 100%)', borderColor: '#C08A1D'},
};
const ROW_DEFAULT = {background: 'linear-gradient(90deg, #10233C 0%, #0C1B30 100%)', borderColor: 'rgba(255,255,255,0.07)'};

function Glow({t, gold}: {t: number; gold: boolean}) {
  const w = gold ? (2 * Math.PI) / 16 : (2 * Math.PI) / 8; // whole cycles per 16s loop
  const tx = (gold ? 150 : -130) * Math.sin(w * t + (gold ? 0 : 1.3));
  const ty = (gold ? -80 : 110) * Math.sin(w * t + (gold ? 0.9 : 0.4));
  const s = 1 + (gold ? 0.12 : 0.14) * Math.sin(w * t + (gold ? 2.0 : 2.6));
  const c = gold ? '238,177,17' : '64,150,180';
  const a = gold ? 0.55 : 0.5;
  return (
    <div
      style={{
        position: 'absolute',
        ...(gold
          ? {left: -319, bottom: -342, width: 1083, height: 855}
          : {right: -171, top: -213, width: 855, height: 684}),
        borderRadius: '50%',
        filter: 'blur(98px)',
        background: `radial-gradient(closest-side, rgba(${c},${a}) 0%, rgba(${c},${a * 0.3}) 55%, transparent 78%)`,
        transform: `translate(${tx}px, ${ty}px) scale(${s})`,
      }}
    />
  );
}

export const LeaderboardTile: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const rowArea = {h: 445, pitch: 75.8, rowH: 66};
  const label = {fontSize: 10.5, letterSpacing: '0.12em', fontWeight: 600, color: 'rgba(255,255,255,0.6)'};

  return (
    <AbsoluteFill
      style={{
        fontFamily: montserrat,
        background:
          'radial-gradient(60% 50% at 55% 55%, rgba(6,52,92,0.9) 0%, transparent 75%), linear-gradient(158deg, #0A2A45 0%, #052036 44%, #02101E 100%)',
      }}
    >
      <Glow t={t} gold />
      <Glow t={t} gold={false} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(120% 120% at 50% 45%, transparent 55%, rgba(0,6,14,0.45) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: SCREEN.left,
          top: SCREEN.top,
          width: SCREEN.w,
          height: SCREEN.h,
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',
          background: 'linear-gradient(175deg, #0B2242 0%, #0A1B33 40%, #081527 100%)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.45), 0 4px 18px rgba(0,0,0,0.3)',
          color: '#fff',
        }}
      >
        <Img src={staticFile('head.jpg')} style={{width: SCREEN.w, height: HEAD_H, display: 'block'}} />
        <div style={{padding: `${PAD.top}px ${PAD.x}px ${PAD.bottom}px`}}>
          <div style={{textAlign: 'center', fontWeight: 700, fontSize: 27, letterSpacing: '0.06em', marginBottom: 20}}>
            STANDINGS
          </div>
          <div style={{...label, fontSize: 12, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.65)', marginBottom: 8}}>
            MY RANK
          </div>
          <div
            style={{
              background: 'linear-gradient(100deg, #2D9CDB 0%, #1D5FA8 55%, #12365F 100%)',
              borderRadius: 8,
              padding: '16px 22px',
              marginBottom: 24,
            }}
          >
            <div style={{fontWeight: 800, fontSize: 26, marginBottom: 8}}>John D.</div>
            <div style={{display: 'flex'}}>
              {[
                ['RANK', '9'],
                ['SCORE', '11,099'],
                ['PRIZE', '$50'],
              ].map(([k, v]) => (
                <div key={k} style={{width: '33%'}}>
                  <div style={{...label, fontSize: 10, color: 'rgba(255,255,255,0.7)'}}>{k}</div>
                  <div style={{fontSize: 16, fontWeight: 700}}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display: 'flex', padding: '0 24px', marginBottom: 10}}>
            <span style={{...label, width: 74}}>RANK</span>
            <span style={{...label}}>NAME</span>
            <span style={{...label, marginLeft: 'auto'}}>SCORE</span>
            <span style={{...label, width: 132, textAlign: 'right'}}>PRIZE</span>
          </div>
          <div style={{position: 'relative', height: rowArea.h}}>
            {NAMES.map((name) => {
              const p = playerAt(frame, name);
              const medal = ROW_STYLES[p.styledSlot] ?? ROW_DEFAULT;
              return (
                <div
                  key={name}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: p.slot * rowArea.pitch,
                    height: rowArea.rowH,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 6,
                    padding: '0 24px',
                    border: `1.5px solid ${medal.borderColor}`,
                    background: medal.background,
                    boxShadow: p.glow ? '0 0 0 2px #EEB111, 0 0 26px rgba(238,177,17,0.55)' : 'none',
                    fontWeight: 600,
                    zIndex: p.glow ? 2 : 1,
                  }}
                >
                  <span style={{width: 74, fontWeight: 800, fontSize: 19}}>{p.styledSlot + 1}</span>
                  <span style={{fontSize: 17, letterSpacing: '0.02em'}}>{name}</span>
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: plexMono,
                      fontSize: 15,
                      fontVariantNumeric: 'tabular-nums',
                      color: p.glow ? '#F5D34F' : '#fff',
                    }}
                  >
                    {fmt(p.score)}
                  </span>
                  <span style={{width: 132, textAlign: 'right', fontWeight: 700, fontSize: 15}}>
                    {PRIZES[p.styledSlot]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
