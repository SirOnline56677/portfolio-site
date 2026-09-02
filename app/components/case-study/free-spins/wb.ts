// WynnBET account-area brand constants, lifted from the "Bonus Spins" Figma
// file. Fixed brand surfaces — identical in both themes, per the
// CompareCards rule; only DevicePair's well chrome uses theme tokens.
export const NAVY = "#091633"; // screen ink + header bars
export const GOLD = "#c38e2c"; // section headings / active markers
export const PLUM = "#400d4f"; // FREE SPINS tag background
export const PLAY_BLUE = "#009eff";
export const COMPLETED_BLUE = "#005a9c";
export const EXPIRED_GRAY = "#c4c4c4";
export const TILE_PURPLE = "#3e083e"; // Free Spins stat-tile border
export const WINS_BG = "#f2f2f2";
export const FOOT_BG = "#e4e6ec";
export const MUTED = "#666666";
export const CARD_SHADOW = "0 2px 4px 2px rgba(0,0,0,0.15)";
export const HEADER_SHADOW = "0 4px 4px 0 rgba(0,0,0,0.55)";

// Refrigerator Deluxe Heavy → Koulen (the site's condensed caps display);
// Montserrat → the system sans. No new webfonts, per the CompareCards tradeoff.
export const display = "var(--font-display)";
export const sans = "var(--font-project)";

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
export const easeInOut = (p: number) =>
  p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Progress of a timeline segment [t0, t0+len] at time t, clamped. */
export const seg = (t: number, t0: number, len: number) =>
  clamp01((t - t0) / len);
