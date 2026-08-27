import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate, Easing} from 'remotion';

export const IMAGES = ['1.png','2.png','3.png','4.png','5.png','6.png'];
const ease = Easing.bezier(0.7, 0, 0.3, 1);
const back = Easing.bezier(0.34, 1.56, 0.64, 1);
const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// Approved timing (seconds): action 0–4.0, hold 4.0–10.0
export const Slideshow: React.FC<{framesPerImage?: number}> = ({framesPerImage = 8}) => {
  const frame = useCurrentFrame();
  const {width, fps} = useVideoConfig();
  const s = frame / fps;
  const idx = Math.floor(frame / framesPerImage) % IMAGES.length;
  const t = (frame % framesPerImage) / framesPerImage;
  const scale = 1.04 + t * 0.02;

  const d1 = s < 2.72
    ? interpolate(s, [0.6, 1.74], [-650, -24], {...clamp, easing: ease})
    : interpolate(s, [2.72, 3.32], [-24, 0], {...clamp, easing: ease});
  const d2 = -d1;
  const core = s < 2.72
    ? interpolate(s, [1.58, 1.96], [0, 1], clamp)
    : interpolate(s, [2.72, 3.32], [1, 0], clamp);
  const finOp = interpolate(s, [3.27, 3.38], [0, 1], clamp);
  // spring: 1 → 1.32 → .94 → 1.06 → 1 between 3.38 and 4.0
  const finScale = interpolate(s, [3.38, 3.54, 3.70, 3.81, 4.0], [1, 1.32, 0.94, 1.06, 1], {...clamp, easing: back});
  const logoIn = interpolate(s, [0, 0.6], [0, 1], {...clamp, easing: Easing.bezier(0.2, 0.8, 0.2, 1)});
  const logoW = width * 0.62;

  const dotBox: React.CSSProperties = {position: 'absolute', left: `${(373.69 - 21.8) / 419.5 * 100}%`, top: `${(85.63 - 21.8) / 173 * 100}%`, width: `${43.6 / 419.5 * 100}%`, aspectRatio: '1'};
  const disc = (bg: string, ty: number): React.CSSProperties => ({position: 'absolute', inset: 0, borderRadius: '50%', background: bg, transform: `translateY(${ty}%)`});

  return (
    <AbsoluteFill style={{backgroundColor: '#141414'}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile('img/' + IMAGES[idx])} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(20,20,20,.55) 0%, rgba(20,20,20,.25) 60%, rgba(20,20,20,.55) 100%)'}} />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
        <div style={{position: 'relative', width: logoW, opacity: logoIn, transform: `scale(${0.92 + 0.08 * logoIn})`}}>
          <Img src={staticFile('wordmark-nodot.svg')} style={{width: '100%', display: 'block'}} />
          <div style={dotBox}>
            <div style={disc('#2B2A6A', d1)} />
            <div style={disc('#E8472A', d2)} />
            <div style={{position: 'absolute', left: '37%', top: '37%', width: '26%', height: '26%', borderRadius: '50%', background: '#EFEAE0', opacity: core}} />
            <div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: '#E8472A', opacity: finOp, transform: `scale(${finScale})`}} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
