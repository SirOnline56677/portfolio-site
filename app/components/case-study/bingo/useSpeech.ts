"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Browser speech, both directions, with nothing stored. Text-to-speech comes
// from speechSynthesis; listening from the Web Speech API (Chrome, Edge,
// Safari; not Firefox). Recognition in Chrome is done by Google's service —
// the prototype's caption says so.

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

const VOICE_PREF = /Samantha|Google US English|Natural|Aria|Jenny|Allison|Ava/i;

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en-us"));
  return en.find((v) => VOICE_PREF.test(v.name)) ?? en[0] ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
}

const WORD_MS = 250;

/** Read a prompt aloud; `onWord(i)` walks the karaoke highlight, `onEnd` fires once. */
export function useTts() {
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef<SpeechSynthesisUtterance | null>(null);
  const unlockedRef = useRef(false);

  const clearTimer = () => { if (timerRef.current != null) { window.clearInterval(timerRef.current); timerRef.current = null; } };

  const cancel = useCallback(() => {
    clearTimer();
    if (activeRef.current) { activeRef.current.onend = null; activeRef.current.onboundary = null; activeRef.current = null; }
    if (speechSupport().tts) window.speechSynthesis.cancel();
  }, []);


  useEffect(() => {
    if (!speechSupport().tts) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** iOS Safari only speaks after a user gesture; call this from the first tap. */
  const unlock = useCallback(() => {
    if (unlockedRef.current || !speechSupport().tts) return;
    unlockedRef.current = true;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }, []);

  const speak = useCallback(
    (text: string, opts: { onWord?: (i: number) => void; onEnd?: () => void } = {}) => {
      if (!speechSupport().tts) { opts.onEnd?.(); return; }
      cancel();
      const words = text.split(" ");
      const starts: number[] = [];
      let pos = 0;
      for (const w of words) { starts.push(pos); pos += w.length + 1; }
      const u = new SpeechSynthesisUtterance(text);
      if (voiceRef.current) u.voice = voiceRef.current;
      u.lang = "en-US";
      u.rate = 0.95;
      let sawBoundary = false;
      let fallbackArmed: number | null = null;
      const finish = () => {
        if (activeRef.current !== u) return;
        clearTimer();
        if (fallbackArmed != null) window.clearTimeout(fallbackArmed);
        activeRef.current = null;
        opts.onEnd?.();
      };
      u.onboundary = (e) => {
        if (e.name && e.name !== "word") return;
        sawBoundary = true;
        clearTimer();
        // last word whose start <= charIndex
        let lo = 0, hi = starts.length - 1, idx = 0;
        while (lo <= hi) { const mid = (lo + hi) >> 1; if (starts[mid] <= e.charIndex) { idx = mid; lo = mid + 1; } else hi = mid - 1; }
        opts.onWord?.(idx);
      };
      u.onstart = () => {
        // Some voices never fire boundary events: walk the words on a clock instead.
        fallbackArmed = window.setTimeout(() => {
          if (sawBoundary || activeRef.current !== u) return;
          let i = 0;
          opts.onWord?.(0);
          timerRef.current = window.setInterval(() => {
            i += 1;
            if (i >= words.length) { clearTimer(); return; }
            opts.onWord?.(i);
          }, WORD_MS);
        }, 600);
      };
      u.onend = finish;
      u.onerror = finish;
      activeRef.current = u;
      unlockedRef.current = true;
      window.speechSynthesis.speak(u);
    },
    [cancel],
  );

  return { speak, cancel, unlock, supported: speechSupport().tts };
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
