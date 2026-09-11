"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HAIR, INK, RED, SEC, WHITE } from "./tokens";
import { Btn, Buttons, VoiceBlock } from "./ui";
import type { VoiceState } from "./state";

// Sheets sit over the step they interrupt so nobody loses their place. Each
// is a dialog: focus moves in, Escape closes, the screen behind is inert.

function Dim({ onClick }: { onClick?: () => void }) {
  return <div aria-hidden onClick={onClick} className="absolute inset-0" style={{ background: "rgba(20,20,20,.45)" }} />;
}

export function Sheet({ title, lead, children, onClose, labelId }: { title: string; lead: string; children: ReactNode; onClose: () => void; labelId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    el?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    el?.addEventListener("keydown", key);
    return () => el?.removeEventListener("keydown", key);
  }, [onClose]);
  return (
    <>
      <Dim onClick={onClose} />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        className="absolute bottom-0 left-0 right-0 flex flex-col outline-none"
        style={{ background: WHITE, borderRadius: "24px 24px 54px 54px", padding: "12px 16px 44px", gap: 14 }}
      >
        <span aria-hidden style={{ width: 36, height: 5, borderRadius: 3, background: HAIR, margin: "0 auto 4px" }} />
        <h4 id={labelId} style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: INK }}>{title}</h4>
        <p style={{ margin: 0, fontSize: 17, lineHeight: "24px", color: SEC }}>{lead}</p>
        {children}
      </div>
    </>
  );
}

/** S1 — the engine ended with nothing usable. Already listening again. */
export function MissedSheet({ voiceState, onMic, onType, onClose }: { voiceState: VoiceState; onMic: () => void; onType: () => void; onClose: () => void }) {
  return (
    <Sheet title="Sorry, I missed that." lead="Say it once more, a little slower, or type instead." onClose={onClose} labelId="bg-missed-title">
      <div style={{ margin: "6px 0" }}>
        <VoiceBlock state={voiceState === "listening" ? "listening" : "idle"} caption={voiceState === "listening" ? "Listening…" : "Tap and talk"} onTap={onMic} />
      </div>
      <Buttons col>
        <Btn kind="ghost" onClick={onType}>Type it instead</Btn>
      </Buttons>
    </Sheet>
  );
}

/** S5 — a person, not a bot. The call and text buttons are inert in the prototype. */
export function HelpSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Need a hand?" lead="A real person picks up, 9 to 5 Eastern." onClose={onClose} labelId="bg-help-title">
      <Buttons col>
        <Btn kind="pri" onClick={onClose}>Call (800) 555-0199</Btn>
        <Btn kind="tint" onClick={onClose}>Text us</Btn>
        <Btn kind="ghost" onClick={onClose}>Close</Btn>
      </Buttons>
    </Sheet>
  );
}

/** The iOS microphone prompt, drawn in-frame for the beat before the real one appears. */
export function PermissionAlert() {
  return (
    <>
      <Dim />
      <div role="status" className="absolute overflow-hidden text-center" style={{ left: 61, top: 440, width: 270, background: "rgba(250,250,250,.96)", borderRadius: 14, fontFamily: "-apple-system, system-ui, sans-serif" }}>
        <h5 style={{ margin: 0, padding: "18px 16px 4px", fontSize: 17, fontWeight: 600, lineHeight: "22px", color: INK }}>“Bingo” Would Like to Access the Microphone</h5>
        <p style={{ margin: 0, padding: "0 16px 16px", fontSize: 13, lineHeight: "16px", color: "#3c3c43" }}>So Bingo can hear your answers when you tap the microphone.</p>
        <div className="flex" style={{ borderTop: "0.5px solid rgba(60,60,67,.36)" }}>
          <span className="flex-1" style={{ padding: 11, fontSize: 17, color: "#007AFF" }}>Don&apos;t Allow</span>
          <span className="flex-1" style={{ padding: 11, fontSize: 17, color: "#007AFF", fontWeight: 600, borderLeft: "0.5px solid rgba(60,60,67,.36)" }}>OK</span>
        </div>
      </div>
      <span className="sr-only" style={{ color: RED }}>Your browser is asking for microphone permission.</span>
    </>
  );
}
