"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import ScaledScreen from "../free-spins/ScaledScreen";
import { H, W } from "./tokens";
import { initialState, promptFor, reducer, type ScreenId } from "./state";
import { useCamera } from "./useCamera";
import { requestMic, speechSupport, useRecognition, useTts } from "./useSpeech";
import { fetchSkills } from "./skills";
import { HelpSheet, MissedSheet, PermissionAlert } from "./overlays";
import {
  reviewLines, ScreenName, Screen00, Screen01, Screen1a, Screen1b, Screen2a, Screen2b, Screen2c, Screen3a, Screen3b, Screen3c, Screen3d, Screen4a, Screen4b, Screen4c, type Ctx,
} from "./screens";

// The Bingo AI voice onboarding, playable. The 19 Figma frames (section
// "Onboarding Voice Flow v2") minus the two that need memory: nothing here is
// stored, so there is no offline queue and no "pick up where you left off" —
// a refresh is a new person at screen 00.
//
// Voice is real but optional: speechSynthesis reads each prompt (the words
// turn red as they're spoken), the Web Speech API listens when the mic is
// tapped, and 4c previews the camera. Every step also works by tapping and
// typing, which is the first-class path in Firefox and anywhere voice is off.
//
// Built at the frames' own 393x852 and scaled by ScaledScreen, the same
// shell as LeaderboardPrototype.

const HINTS: Record<ScreenId, string> = {
  name: "Type your first name, or tap the mic and say it",
  "00": "Try it: tap Read aloud, then Let's go",
  "01": "Yes asks your browser for the microphone. Just text skips it",
  "1a": "Tap the mic and say a name, or tap Change to type",
  "1b": "Say why you're here, or tap the ones that fit",
  "2a": "Tap the mic and say an address. It fills in as you talk",
  "2b": "Say yes, or tap a line to redo it",
  "2c": "Say how you get around and how far, or tap",
  "3a": "Tap the mic and talk about work you've done",
  "3b": "Tap a bubble to remove it. Say \"add cashier\" to add one",
  "3c": "Say your days and mornings or afternoons, or tap",
  "3d": "Optional. Say skip, or tap Skip this",
  "4a": "Bingo reads it back. Tap a line to change it",
  "4c": "Optional. Turn on the camera to record a hello. Nothing is uploaded",
  "4b": "That's the flow. Play again starts over from the top",
};

export default function OnboardingPrototype() {
  const [s, d] = useReducer(reducer, "", initialState);
  const tts = useTts();
  const rec = useRecognition();
  const cam = useCamera();
  const sRef = useRef(s);
  useEffect(() => { sRef.current = s; });
  const retriedRef = useRef(false);
  const [pendingSkills, setPendingSkills] = useState(false);

  const voiceOn = s.voiceMode === "on";

  // Feature detection is a client fact; the server renders "unset".
  useEffect(() => {
    if (!speechSupport().sr) d({ type: "SET_VOICE_MODE", mode: "unsupported" });
  }, []);

  /* ---------- reading aloud ---------- */
  const readPrompt = useCallback(() => {
    const cur = sRef.current;
    if (cur.muted || !tts.supported) return;
    rec.abort();
    d({ type: "VOICE", state: "reading" });
    if (cur.screen === "4a") {
      // Read the answers line by line; the line being read turns red.
      const lines = reviewLines(cur.answers);
      const say = (i: number) => {
        if (sRef.current.screen !== "4a" || sRef.current.runId !== cur.runId) return;
        if (i >= lines.length) { d({ type: "REVIEW_LINE", index: -1 }); d({ type: "VOICE", state: "idle" }); return; }
        d({ type: "REVIEW_LINE", index: i });
        tts.speak(`${lines[i].sub}: ${lines[i].v}.`, { onEnd: () => say(i + 1) });
      };
      tts.speak(promptFor(cur), { onWord: (i) => d({ type: "READ_WORD", index: i }), onEnd: () => { d({ type: "READ_WORD", index: -1 }); say(0); } });
      return;
    }
    tts.speak(promptFor(cur), {
      onWord: (i) => d({ type: "READ_WORD", index: i }),
      onEnd: () => {
        if (sRef.current.voiceState === "reading") d({ type: "VOICE", state: "idle" });
        d({ type: "READ_WORD", index: -1 });
      },
    });
  }, [tts, rec]);

  // Each screen introduces itself, except the first two (browsers refuse to
  // speak before a tap) and 01, and not for someone who chose "Just text"
  // (Play back still reads on demand).
  useEffect(() => {
    if (s.screen === "name" || s.screen === "00" || s.screen === "01" || s.voiceMode === "off") return;
    const t = window.setTimeout(readPrompt, 350);
    return () => { window.clearTimeout(t); tts.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.screen, s.runId]);

  useEffect(() => {
    if (s.muted) tts.cancel();
  }, [s.muted, tts]);

  /* ---------- listening ---------- */
  const listen = useCallback(() => {
    const cur = sRef.current;
    tts.cancel();
    d({ type: "READ_WORD", index: -1 });
    d({ type: "VOICE", state: "listening" });
    const runId = cur.runId, screen = cur.screen;
    const still = () => sRef.current.runId === runId && sRef.current.screen === screen;
    rec.start({
      continuous: screen === "3a",
      onInterim: (t) => { if (still()) d({ type: "INTERIM", text: t }); },
      onFinal: (t) => { if (still()) d({ type: "HEARD", text: t }); },
      onDenied: () => { d({ type: "SET_VOICE_MODE", mode: "off" }); },
      onMissed: () => {
        if (!still()) return;
        if (screen === "3a") { d({ type: "VOICE", state: "idle" }); return; }
        d({ type: "OVERLAY", overlay: "missed" });
        d({ type: "VOICE", state: "idle" });
      },
      onEnd: () => { if (still() && sRef.current.voiceState === "listening") d({ type: "VOICE", state: "idle" }); },
    });
  }, [rec, tts]);

  const onMic = useCallback(() => {
    if (rec.listening) { rec.stop(); d({ type: "VOICE", state: sRef.current.screen === "3a" ? "idle" : "heard" }); return; }
    listen();
  }, [rec, listen]);

  // S1 re-listens once on its own; a second miss waits for a tap.
  useEffect(() => {
    if (s.overlay !== "missed") { retriedRef.current = false; return; }
    if (retriedRef.current) return;
    retriedRef.current = true;
    const t = window.setTimeout(listen, 400);
    return () => window.clearTimeout(t);
  }, [s.overlay, listen]);

  useEffect(() => {
    if (s.listenNonce > 0) listen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.listenNonce]);

  /* ---------- permission ---------- */
  const askMic = useCallback(async (advance: boolean) => {
    d({ type: "OVERLAY", overlay: "permission" });
    const result = await requestMic();
    d({ type: "OVERLAY", overlay: null });
    d({ type: "SET_VOICE_MODE", mode: result === "granted" ? "on" : "off" });
    if (result === "granted") d({ type: "VOICE", state: "idle" });
    if (advance) d({ type: "NEXT" });
  }, []);

  // The name screen's mic: permission and the first listen in one tap.
  const askMicThenListen = useCallback(async () => {
    tts.unlock();
    if (sRef.current.voiceMode !== "on") {
      const result = await requestMic();
      d({ type: "SET_VOICE_MODE", mode: result === "granted" ? "on" : "off" });
      if (result !== "granted") return;
    }
    listen();
  }, [tts, listen]);

  const onChoose = useCallback((talk: boolean) => {
    tts.unlock();
    if (!talk) { d({ type: "SET_VOICE_MODE", mode: sRef.current.voiceMode === "unsupported" ? "unsupported" : "off" }); d({ type: "NEXT" }); return; }
    void askMic(true);
  }, [askMic, tts]);

  /* ---------- skills upgrade (optional API) ---------- */
  const skillsCtrl = useRef<AbortController | null>(null);
  const upgradeSkills = useCallback((text: string, runId: number) => {
    skillsCtrl.current?.abort();
    const ctrl = new AbortController();
    skillsCtrl.current = ctrl;
    setPendingSkills(true);
    fetchSkills(text, ctrl.signal).then((list) => {
      if (ctrl.signal.aborted) return;
      setPendingSkills(false);
      if (list && sRef.current.screen === "3b" && sRef.current.runId === runId) d({ type: "SET_ANSWER", patch: { skills: list } });
    });
  }, []);
  useEffect(() => () => skillsCtrl.current?.abort(), []);

  /* ---------- navigation ---------- */
  const restart = useCallback(() => {
    tts.cancel();
    rec.abort();
    cam.reset();
    d({ type: "RESTART" });
  }, [tts, rec, cam]);

  useEffect(() => {
    // Keep keyboard users oriented; preventScroll so the article stays put.
    document.getElementById("bg-title")?.focus({ preventScroll: true });
  }, [s.screen, s.runId]);

  useEffect(() => {
    if (s.screen !== "4c") cam.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.screen]);

  const readMatches = useCallback(() => {
    tts.unlock();
    d({ type: "VOICE", state: "reading" });
    tts.speak("Host at Corner Diner, Astoria, twelve minutes by bus, Tuesday and Thursday mornings, eighteen dollars an hour. Greeter at Home Depot, Long Island City, twenty five minutes by bus, Tuesday mornings, seventeen dollars an hour.", {
      onEnd: () => d({ type: "VOICE", state: "idle" }),
    });
  }, [tts]);

  const ctx: Ctx = {
    s, d, voiceOn, onMic,
    onTurnOnVoice: () => void askMic(false),
    askMicThenListen: () => void askMicThenListen(),
    read: () => { tts.unlock(); readPrompt(); },
    next: () => {
      const cur = sRef.current;
      d({ type: "NEXT" });
      if (cur.screen === "3a" && cur.answers.workTalk.trim()) upgradeSkills(cur.answers.workTalk, cur.runId);
      else if (cur.screen !== "3a") { skillsCtrl.current?.abort(); setPendingSkills(false); }
    },
    back: () => d({ type: "BACK" }),
    restart,
    cam,
    unlock: tts.unlock,
  };

  const screen = (() => {
    switch (s.screen) {
      case "name": return <ScreenName ctx={ctx} />;
      case "00": return <Screen00 ctx={ctx} />;
      case "01": return <Screen01 ctx={ctx} onChoose={onChoose} />;
      case "1a": return <Screen1a ctx={ctx} />;
      case "1b": return <Screen1b ctx={ctx} />;
      case "2a": return <Screen2a ctx={ctx} />;
      case "2b": return <Screen2b ctx={ctx} />;
      case "2c": return <Screen2c ctx={ctx} />;
      case "3a": return <Screen3a ctx={ctx} />;
      case "3b": return <Screen3b ctx={ctx} pending={pendingSkills} />;
      case "3c": return <Screen3c ctx={ctx} />;
      case "3d": return <Screen3d ctx={ctx} />;
      case "4a": return <Screen4a ctx={ctx} />;
      case "4c": return <Screen4c ctx={ctx} />;
      case "4b": return <Screen4b ctx={ctx} onReadMatches={readMatches} />;
    }
  })();

  const unsupported = s.voiceMode === "unsupported";

  return (
    <div>
      <style>{`
        @keyframes bg-pulse { 0% { opacity: .9; transform: scale(.98); } 70% { opacity: 0; transform: scale(1.12); } 100% { opacity: 0; transform: scale(1.12); } }
        @keyframes bg-wave { from { transform: scaleY(.45); } to { transform: scaleY(1); } }
        @keyframes bg-float { from { transform: translateY(0); } to { transform: translateY(-4px); } }
        @media (prefers-reduced-motion: reduce) { .bg-proto * { animation: none !important; } }
      `}</style>
      <section aria-label="Bingo onboarding prototype" className="bg-proto my-12 rounded-[24px] p-5 sm:p-8" style={{ background: "#ffffff" }}>
        <div className="mx-auto w-2/3 max-w-[300px]">
          <div
            className="overflow-clip rounded-[44px] border-[10px]"
            style={{
              borderColor: "#17191f",
              background: "#17191f",
              boxShadow: "0 12px 32px rgba(0,0,0,0.28), 0 0 0 1.5px rgba(255,255,255,0.16), inset 0 0 0 2px #34373f",
            }}
          >
            <div className="relative overflow-clip rounded-[34px]" style={{ background: "#F4F1EA" }}>
              <ScaledScreen designW={W} shownH={H}>
                <div key={s.runId} className="relative overflow-clip" style={{ width: W, height: H }}>
                  {screen}
                  {s.overlay === "permission" ? <PermissionAlert /> : null}
                  {s.overlay === "help" ? <HelpSheet onClose={() => d({ type: "OVERLAY", overlay: null })} /> : null}
                  {s.overlay === "missed" ? (
                    <MissedSheet
                      voiceState={s.voiceState}
                      onMic={onMic}
                      onType={() => { rec.abort(); d({ type: "OVERLAY", overlay: null }); }}
                      onClose={() => { rec.abort(); d({ type: "OVERLAY", overlay: null }); }}
                    />
                  ) : null}
                </div>
              </ScaledScreen>
            </div>
          </div>
        </div>
        <p className="mt-6 text-center font-[family-name:var(--font-label)] text-label uppercase tracking-[0.05em]" style={{ color: "#666" }}>
          {tts.stuck
            ? "Read aloud isn't responding in this browser. Try Safari, or restart Chrome"
            : unsupported && s.screen === "01" ? "Voice isn't available in this browser. Tap and type instead" : HINTS[s.screen]}
        </p>
      </section>
      <p className="-mt-8 mb-12 font-[family-name:var(--font-label)] text-label uppercase tracking-[0.03em] text-muted">
        Interactive prototype: voice onboarding. Mic and camera are optional, nothing is saved. Voice uses your browser&apos;s speech service
      </p>
    </div>
  );
}
