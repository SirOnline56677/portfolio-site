"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Segment } from "./state";

// Browser speech, both directions, with nothing stored.
//
// Reading aloud runs a chain per segment: a pre-rendered clip for the fixed
// prompts (public/…/prototype/tts), the /api/bingo-tts route for the lines
// that carry the visitor's own words, and only then the browser's
// speechSynthesis — which is where Chrome sometimes wedges for a whole
// session (speaking=true, onstart never fires), so it is the last resort.
// Word timings from the clips drive the red highlight exactly; the browser
// voice falls back to boundary events, then a clock.
//
// Listening is the Web Speech API (Chrome, Edge, Safari; not Firefox). In
// Chrome the audio goes to Google's recogniser — the caption says so.

/* ---------- minimal type shim: the DOM lib has no SpeechRecognition ---------- */
type SRResultList = { length: number; [i: number]: { isFinal: boolean; 0: { transcript: string } } };
type SREvent = { resultIndex: number; results: SRResultList };
type SRErrorEvent = { error: string };
export type SRInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: SRErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};
type SRCtor = new () => SRInstance;
declare global {
  interface Window {
    SpeechRecognition?: SRCtor;
    webkitSpeechRecognition?: SRCtor;
  }
}

export function speechSupport() {
  if (typeof window === "undefined") return { tts: false, sr: false };
  return {
    tts: "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined",
    sr: !!(window.SpeechRecognition ?? window.webkitSpeechRecognition),
  };
}

/* ---------- clips ---------- */

type Word = { w: string; s: number; e: number };
type Clip = { src: string; words: Word[] };

const TTS_BASE = "/work/bingo-ai-job-matching-platform-for-seniors/prototype/tts";
const clipCache = new Map<string, Promise<Clip | null>>();

function staticClip(id: string): Promise<Clip | null> {
  let p = clipCache.get(id);
  if (!p) {
    p = (async () => {
      try {
        const [mp3, json] = await Promise.all([fetch(`${TTS_BASE}/${id}.mp3`), fetch(`${TTS_BASE}/${id}.json`)]);
        if (!mp3.ok || !json.ok) return null;
        const blob = await mp3.blob();
        const { words } = (await json.json()) as { words: Word[] };
        return { src: URL.createObjectURL(blob), words };
      } catch {
        return null;
      }
    })();
    clipCache.set(id, p);
  }
  return p;
}

async function liveClip(text: string, signal: AbortSignal): Promise<Clip | null> {
  try {
    const res = await fetch("/api/bingo-tts", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
      signal: AbortSignal.any([signal, AbortSignal.timeout(3500)]),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { audio?: string; words?: Word[] };
    if (!data.audio || !Array.isArray(data.words)) return null;
    return { src: `data:audio/mpeg;base64,${data.audio}`, words: data.words };
  } catch {
    return null;
  }
}

/** A few milliseconds of silence, built on the fly: playing it in a tap is what lets iOS play later clips on its own. */
function silentWav(): string {
  const rate = 8000, samples = 80;
  const buf = new ArrayBuffer(44 + samples * 2);
  const v = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, "RIFF"); v.setUint32(4, 36 + samples * 2, true); str(8, "WAVE"); str(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, samples * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
}

/* ---------- browser voice (last resort) ---------- */

const VOICE_PREF = /Samantha|Google US English|Natural|Aria|Jenny|Allison|Ava/i;
const WORD_MS = 250;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en-us"));
  return en.find((v) => VOICE_PREF.test(v.name)) ?? en[0] ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

export type SpeakOpts = { onWord?: (i: number) => void; onEnd?: () => void };

/** Read segments aloud in order; `onWord(i)` walks the joined-prompt word index, `onEnd` fires once. */
export function useTts() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tokenRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const unlockedRef = useRef(false);
  // Chrome's synthesis can wedge for the whole session; when the last
  // resort fails too, the UI stops pretending to read.
  const [stuck, setStuck] = useState(false);

  const clearTimers = () => {
    if (timerRef.current != null) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (rafRef.current != null) { window.cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  };

  const cancel = useCallback(() => {
    tokenRef.current += 1;
    clearTimers();
    abortRef.current?.abort();
    abortRef.current = null;
    const a = audioRef.current;
    if (a) { a.onended = null; a.onerror = null; a.pause(); a.removeAttribute("src"); a.load(); }
    if (utterRef.current) { utterRef.current.onend = null; utterRef.current.onboundary = null; utterRef.current = null; }
    if (speechSupport().tts) window.speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (speechSupport().tts) {
      const load = () => { voiceRef.current = pickVoice(); };
      load();
      window.speechSynthesis.addEventListener("voiceschanged", load);
      const hide = () => { if (document.hidden) cancel(); };
      document.addEventListener("visibilitychange", hide);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", load);
        document.removeEventListener("visibilitychange", hide);
        cancel();
      };
    }
    return cancel;
  }, [cancel]);

  const audio = () => {
    if (!audioRef.current && typeof Audio !== "undefined") { audioRef.current = new Audio(); audioRef.current.preload = "auto"; }
    return audioRef.current;
  };

  /** Call from the first tap: iOS only plays audio the page started inside a gesture. */
  const unlock = useCallback(() => {
    if (unlockedRef.current) return;
    unlockedRef.current = true;
    const a = audio();
    if (a) { a.src = silentWav(); a.play().catch(() => {}); }
    if (speechSupport().tts) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; window.speechSynthesis.speak(u); }
  }, []);

  /** Play one clip, mapping its word timings onto the joined-prompt index. Resolves true when it played through. */
  const playClip = useCallback((clip: Clip, offset: number, token: number, onWord?: (i: number) => void) =>
    new Promise<boolean>((resolve) => {
      const a = audio();
      if (!a) return resolve(false);
      let last = -1;
      const tick = () => {
        if (tokenRef.current !== token) return;
        const t = a.currentTime;
        let i = -1;
        for (let k = 0; k < clip.words.length; k++) if (clip.words[k].s <= t + 0.05) i = k;
        if (i !== last && i >= 0) { last = i; onWord?.(offset + i); }
        rafRef.current = window.requestAnimationFrame(tick);
      };
      a.onended = () => { clearTimers(); resolve(true); };
      a.onerror = () => { clearTimers(); resolve(false); };
      a.src = clip.src;
      a.play().then(() => { rafRef.current = window.requestAnimationFrame(tick); }).catch(() => resolve(false));
    }), []);

  /** The browser's own voice for one segment. Resolves true only if it actually started. */
  const speakSynth = useCallback((text: string, offset: number, token: number, onWord?: (i: number) => void) =>
    new Promise<boolean>((resolve) => {
      if (!speechSupport().tts) return resolve(false);
      const synth = window.speechSynthesis;
      const busy = synth.speaking || synth.pending;
      synth.cancel();
      const words = text.split(" ");
      const starts: number[] = [];
      let pos = 0;
      for (const w of words) { starts.push(pos); pos += w.length + 1; }
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = "en-US";
      u.rate = 0.95;
      let sawBoundary = false, started = false;
      let fallbackArmed: number | null = null, watchdog: number | null = null;
      const done = (ok: boolean) => {
        if (utterRef.current !== u) return;
        clearTimers();
        if (fallbackArmed != null) window.clearTimeout(fallbackArmed);
        if (watchdog != null) window.clearTimeout(watchdog);
        utterRef.current = null;
        resolve(ok);
      };
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        sawBoundary = true;
        clearTimers();
        let lo = 0, hi = starts.length - 1, idx = 0;
        while (lo <= hi) { const mid = (lo + hi) >> 1; if (starts[mid] <= e.charIndex) { idx = mid; lo = mid + 1; } else hi = mid - 1; }
        onWord?.(offset + idx);
      };
      u.onstart = () => {
        started = true;
        setStuck(false);
        // Some voices never fire boundary events: walk the words on a clock instead.
        fallbackArmed = window.setTimeout(() => {
          if (sawBoundary || utterRef.current !== u) return;
          let i = 0;
          onWord?.(offset);
          timerRef.current = window.setInterval(() => {
            i += 1;
            if (i >= words.length) { clearTimers(); return; }
            onWord?.(offset + i);
          }, WORD_MS);
        }, 600);
      };
      u.onend = () => done(true);
      u.onerror = () => done(started);
      utterRef.current = u;
      const go = () => {
        if (tokenRef.current !== token || utterRef.current !== u) return;
        synth.speak(u);
        watchdog = window.setTimeout(() => {
          if (started || utterRef.current !== u) return;
          synth.cancel();
          setStuck(true);
          done(false);
        }, 1500);
      };
      // Chrome drops an utterance queued in the same tick as cancel().
      if (busy) window.setTimeout(go, 80); else go();
    }), []);

  const speak = useCallback(
    async (segments: Segment[], opts: SpeakOpts = {}) => {
      cancel();
      const token = tokenRef.current;
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      unlockedRef.current = true;
      let offset = 0;
      for (const seg of segments) {
        if (tokenRef.current !== token) return;
        const clip = seg.id ? await staticClip(seg.id) : await liveClip(seg.text, ctrl.signal);
        if (tokenRef.current !== token) return;
        let ok = clip ? await playClip(clip, offset, token, opts.onWord) : false;
        if (!ok && tokenRef.current === token) ok = await speakSynth(seg.text, offset, token, opts.onWord);
        if (tokenRef.current !== token) return;
        if (!ok) break;
        offset += seg.text.split(" ").length;
      }
      if (tokenRef.current === token) opts.onEnd?.();
    },
    [cancel, playClip, speakSynth],
  );

  return { speak, cancel, unlock, stuck, supported: true };
}

export type ListenOpts = {
  continuous?: boolean;
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  /** Ended with nothing heard, or a recoverable error. */
  onMissed?: () => void;
  /** Permission denied. */
  onDenied?: () => void;
  onEnd?: () => void;
};

/** One recognition session at a time; `listening` mirrors the engine. */
export function useRecognition() {
  const recRef = useRef<SRInstance | null>(null);
  const [listening, setListening] = useState(false);
  const supported = speechSupport().sr;

  const stop = useCallback(() => {
    const r = recRef.current;
    if (!r) return;
    r.onresult = null; r.onerror = null; r.onend = null;
    try { r.stop(); } catch { /* already stopped */ }
    recRef.current = null;
    setListening(false);
  }, []);

  const abort = useCallback(() => {
    const r = recRef.current;
    if (!r) return;
    r.onresult = null; r.onerror = null; r.onend = null;
    try { r.abort(); } catch { /* noop */ }
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(
    (opts: ListenOpts) => {
      const Ctor = typeof window !== "undefined" ? window.SpeechRecognition ?? window.webkitSpeechRecognition : undefined;
      if (!Ctor) { opts.onDenied?.(); return; }
      abort();
      const r = new Ctor();
      r.lang = "en-US";
      r.continuous = !!opts.continuous;
      r.interimResults = true;
      r.maxAlternatives = 1;
      let gotFinal = false;
      let errored: string | null = null;
      r.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          const t = res[0].transcript;
          if (res.isFinal) { gotFinal = true; opts.onFinal?.(t.trim()); }
          else interim += t;
        }
        if (interim) opts.onInterim?.(interim.trim());
      };
      r.onerror = (e) => { errored = e.error; };
      r.onend = () => {
        recRef.current = null;
        setListening(false);
        if (errored === "not-allowed" || errored === "service-not-allowed") opts.onDenied?.();
        else if (!gotFinal && errored !== "aborted") opts.onMissed?.();
        opts.onEnd?.();
      };
      recRef.current = r;
      try {
        r.start();
        setListening(true);
      } catch {
        recRef.current = null;
        opts.onMissed?.();
      }
    },
    [abort],
  );

  useEffect(() => () => abort(), [abort]);

  return { start, stop, abort, listening, supported };
}

/** Ask for the microphone the way iOS asks: from a tap, then let go of the track. */
export async function requestMic(): Promise<"granted" | "denied" | "unavailable"> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return "unavailable";
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return "granted";
  } catch (e) {
    const name = (e as { name?: string })?.name;
    return name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable";
  }
}
