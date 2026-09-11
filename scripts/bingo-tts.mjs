#!/usr/bin/env node
// Renders the Bingo onboarding prototype's fixed prompts to audio, once, so
// they play from the repo with no runtime cost and no key. Run by hand:
//
//   ELEVENLABS_API_KEY=… node scripts/bingo-tts.mjs            # ElevenLabs (default)
//   GOOGLE_TTS_API_KEY=… node scripts/bingo-tts.mjs --provider google
//   node scripts/bingo-tts.mjs --force                          # re-render existing ids
//   node scripts/bingo-tts.mjs --voices                         # list ElevenLabs voices
//
// Output: public/work/bingo-ai-job-matching-platform-for-seniors/prototype/tts/<id>.mp3
// and <id>.json ({ words: [{ w, s, e }] }). Keys are read from the env (or
// .env.local) and never printed. ~2,000 characters in total.

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(new URL("..", import.meta.url).pathname);
const OUT = resolve(ROOT, "public/work/bingo-ai-job-matching-platform-for-seniors/prototype/tts");
const args = new Set(process.argv.slice(2));
const provider = args.has("--provider") ? process.argv[process.argv.indexOf("--provider") + 1] : "elevenlabs";

// .env.local (gitignored) is the usual place for the keys in dev.
try {
  for (const line of readFileSync(resolve(ROOT, ".env.local"), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"#]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
} catch { /* no .env.local */ }

// The same table as STATIC_SEGMENTS in app/components/case-study/bingo/state.ts.
// Kept as plain data here so the script needs no TypeScript toolchain.
const SEGMENTS = {
  name: "I'm Bingo. What's your name?",
  "00-tail": "Four quick things and you're set, about three minutes. You can talk or type at every step.",
  "01": "I can read things out loud and listen when you answer. You can always type instead.",
  "1a-tail": "Want something shorter?",
  "1b-tail": "Pick any that fit, or just say it.",
  "2a": "Is this still the best number? Then tell me where you live, so we find work nearby.",
  "2c": "How do you usually get around, and how far is too far?",
  "3a": "What kind of work have you done? Just talk, I'll take notes. A minute is plenty.",
  "3b": "Sounds like these. Tap one to remove it, or say another.",
  "3c": "Which days, and mornings or afternoons? Say it, or tap.",
  "3d": "This one's optional. Anything you'd rather avoid? Say it, tap it, or skip.",
  "4a": "I'll read it back. Tap any line to fix it.",
  "4c": "Optional, but worth it: people who record a quick hello hear back from more employers.",
  "4b-tail": "Two near you for Tuesday morning. Want me to read them?",
  matches: "Host at Corner Diner, Astoria, twelve minutes by bus, Tuesday and Thursday mornings, eighteen dollars an hour. Greeter at Home Depot, Long Island City, twenty five minutes by bus, Tuesday mornings, seventeen dollars an hour.",
};

/* ---------- ElevenLabs ---------- */
const EL = "https://api.elevenlabs.io";
const elHeaders = () => ({ "xi-api-key": need("ELEVENLABS_API_KEY"), "content-type": "application/json" });

async function elVoices() {
  const res = await fetch(`${EL}/v2/voices?category=premade&page_size=100`, { headers: elHeaders() });
  if (!res.ok) throw new Error(`voices: HTTP ${res.status}`);
  return (await res.json()).voices ?? [];
}

async function elVoiceId() {
  if (process.env.ELEVENLABS_VOICE_ID) return process.env.ELEVENLABS_VOICE_ID;
  const voices = await elVoices();
  const pick = voices.find((v) => v.name.startsWith("Sarah")) ?? voices.find((v) => v.labels?.gender === "female" && /american|english/i.test(v.labels?.accent ?? "")) ?? voices[0];
  if (!pick) throw new Error("no premade voices returned; set ELEVENLABS_VOICE_ID");
  console.log(`voice: ${pick.name} (${pick.voice_id})`);
  return pick.voice_id;
}

/** ElevenLabs alignment is per character; fold it into words. */
export function wordsFromAlignment(text, alignment) {
  const chars = alignment.characters, st = alignment.character_start_times_seconds, en = alignment.character_end_times_seconds;
  const words = [];
  let cur = null;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === " " || chars[i] === "\n") { if (cur) { words.push(cur); cur = null; } continue; }
    if (!cur) cur = { w: chars[i], s: st[i], e: en[i] };
    else { cur.w += chars[i]; cur.e = en[i]; }
  }
  if (cur) words.push(cur);
  return words;
}

async function elRender(voiceId, text) {
  const res = await fetch(`${EL}/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_64`, {
    method: "POST",
    headers: elHeaders(),
    body: JSON.stringify({ text, model_id: "eleven_flash_v2_5" }),
  });
  if (!res.ok) throw new Error(`tts: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return { audio: Buffer.from(data.audio_base64, "base64"), words: wordsFromAlignment(text, data.alignment) };
}

/* ---------- Google Cloud TTS (backup) ---------- */
export function ssmlWithMarks(text) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return "<speak>" + text.split(" ").map((w, i) => `<mark name="w${i}"/>${esc(w)}`).join(" ") + "</speak>";
}

export function wordsFromTimepoints(text, timepoints, totalSeconds) {
  const words = text.split(" ");
  const starts = words.map((_, i) => timepoints.find((t) => t.markName === `w${i}`)?.timeSeconds ?? null);
  return words.map((w, i) => {
    const s = starts[i] ?? (i ? starts[i - 1] ?? 0 : 0);
    const next = starts.slice(i + 1).find((v) => v != null);
    return { w, s, e: next ?? totalSeconds ?? s + 0.4 };
  });
}

async function gRender(text) {
  const key = need("GOOGLE_TTS_API_KEY");
  const res = await fetch(`https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { ssml: ssmlWithMarks(text) },
      voice: { languageCode: "en-US", name: process.env.GOOGLE_TTS_VOICE || "en-US-Neural2-F" },
      audioConfig: { audioEncoding: "MP3" },
      enableTimePointing: ["SSML_MARK"],
    }),
  });
  if (!res.ok) throw new Error(`google tts: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return { audio: Buffer.from(data.audioContent, "base64"), words: wordsFromTimepoints(text, data.timepoints ?? []) };
}

/* ---------- main ---------- */
function need(name) {
  const v = process.env[name];
  if (!v) { console.error(`${name} is not set (env or .env.local)`); process.exit(1); }
  return v;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (args.has("--voices")) {
    for (const v of await elVoices()) console.log(`${v.voice_id}  ${v.name}  ${v.labels?.gender ?? ""} ${v.labels?.accent ?? ""}`);
    process.exit(0);
  }
  mkdirSync(OUT, { recursive: true });
  const voiceId = provider === "elevenlabs" ? await elVoiceId() : null;
  let chars = 0, made = 0;
  for (const [id, text] of Object.entries(SEGMENTS)) {
    const mp3 = resolve(OUT, `${id}.mp3`);
    if (existsSync(mp3) && !args.has("--force")) { console.log(`skip ${id} (exists)`); continue; }
    const { audio, words } = provider === "google" ? await gRender(text) : await elRender(voiceId, text);
    writeFileSync(mp3, audio);
    writeFileSync(resolve(OUT, `${id}.json`), JSON.stringify({ words }));
    chars += text.length; made += 1;
    console.log(`ok   ${id}  ${text.length} chars  ${words.length} words  ${(audio.length / 1024).toFixed(0)} KB`);
  }
  console.log(`rendered ${made} clips, ${chars} characters via ${provider}`);
}
