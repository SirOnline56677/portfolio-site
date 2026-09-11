// Live voice for the Bingo onboarding prototype's dynamic lines (the
// visitor's name, their address, the read-back). The fixed prompts are
// pre-rendered files (scripts/bingo-tts.mjs); this only speaks what those
// can't. Two providers, both on their free tiers, each behind a monthly
// character cap so nothing here can bill: ElevenLabs first, Google Cloud
// Text-to-Speech as the backup. Repeated lines (the same name twice) come
// from an in-memory cache. Nothing is logged or stored beyond that cache.

export const runtime = "nodejs";

const MAX_CHARS = 300;
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 30;
const CACHE_MAX = 500;
const EL_CAP = Number(process.env.BINGO_TTS_MONTHLY_CHARS ?? 9000);
const G_CAP = Number(process.env.BINGO_GTTS_MONTHLY_CHARS ?? 900000);
// Google's speakingRate is 0.25–4.0; ElevenLabs' speed is 0.7–1.2. One env var drives both.
const SPEED = Number(process.env.ELEVENLABS_SPEED ?? 1);

type Word = { w: string; s: number; e: number };
type Clip = { audio: string; words: Word[]; provider: "elevenlabs" | "google" };

const hits = new Map<string, { count: number; reset: number }>();
const cache = new Map<string, Clip>();
const spent = { month: "", elevenlabs: 0, google: 0 };

function limited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 1000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  const h = hits.get(ip);
  if (!h || h.reset < now) { hits.set(ip, { count: 1, reset: now + WINDOW_MS }); return false; }
  h.count += 1;
  return h.count > PER_WINDOW;
}

function budget(provider: "elevenlabs" | "google", chars: number, cap: number): boolean {
  const month = new Date().toISOString().slice(0, 7);
  if (spent.month !== month) { spent.month = month; spent.elevenlabs = 0; spent.google = 0; }
  if (spent[provider] + chars > cap) return false;
  spent[provider] += chars;
  return true;
}

/** ElevenLabs alignment is per character; fold it into words. */
function wordsFromAlignment(a: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] }): Word[] {
  const out: Word[] = [];
  let cur: Word | null = null;
  for (let i = 0; i < a.characters.length; i++) {
    const c = a.characters[i];
    if (c === " " || c === "\n") { if (cur) { out.push(cur); cur = null; } continue; }
    if (!cur) cur = { w: c, s: a.character_start_times_seconds[i], e: a.character_end_times_seconds[i] };
    else { cur.w += c; cur.e = a.character_end_times_seconds[i]; }
  }
  if (cur) out.push(cur);
  return out;
}

async function elevenlabs(text: string): Promise<Clip | null> {
  const key = process.env.ELEVENLABS_API_KEY, voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice || !budget("elevenlabs", text.length, EL_CAP)) return null;
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: "eleven_flash_v2_5", voice_settings: { speed: SPEED } }),
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { audio_base64?: string; alignment?: Parameters<typeof wordsFromAlignment>[0] };
  if (!data.audio_base64 || !data.alignment) return null;
  return { audio: data.audio_base64, words: wordsFromAlignment(data.alignment), provider: "elevenlabs" };
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function google(text: string): Promise<Clip | null> {
  const key = process.env.GOOGLE_TTS_API_KEY;
  if (!key || !budget("google", text.length, G_CAP)) return null;
  const words = text.split(" ");
  const ssml = "<speak>" + words.map((w, i) => `<mark name="w${i}"/>${esc(w)}`).join(" ") + "</speak>";
  const res = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { ssml },
      voice: { languageCode: "en-US", name: process.env.GOOGLE_TTS_VOICE || "en-US-Neural2-F" },
      audioConfig: { audioEncoding: "MP3", speakingRate: SPEED },
      enableTimePointing: ["SSML_MARK"],
    }),
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { audioContent?: string; timepoints?: { markName: string; timeSeconds: number }[] };
  if (!data.audioContent) return null;
  const starts = words.map((_, i) => data.timepoints?.find((t) => t.markName === `w${i}`)?.timeSeconds ?? null);
  const out: Word[] = words.map((w, i) => {
    const s = starts[i] ?? (i ? (starts[i - 1] ?? 0) : 0);
    const next = starts.slice(i + 1).find((v) => v != null);
    return { w, s, e: next ?? s + 0.4 };
  });
  return { audio: data.audioContent, words: out, provider: "google" };
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (limited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  let text: unknown;
  try {
    ({ text } = (await request.json()) as { text?: unknown });
  } catch {
    return Response.json({ error: "bad_json" }, { status: 400 });
  }
  if (typeof text !== "string" || !text.trim() || text.length > MAX_CHARS) {
    return Response.json({ error: "bad_input" }, { status: 400 });
  }
  const key = text.trim();
  const hit = cache.get(key);
  if (hit) return Response.json(hit);

  let clip: Clip | null = null;
  try { clip = await elevenlabs(key); } catch { clip = null; }
  if (!clip) { try { clip = await google(key); } catch { clip = null; } }
  if (!clip) return Response.json({ error: "unavailable" }, { status: 503 });

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, clip);
  return Response.json(clip);
}
