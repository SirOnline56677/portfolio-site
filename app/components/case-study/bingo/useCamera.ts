"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// The optional hello on 4c. Live preview from getUserMedia, up to MAX_MS of
// MediaRecorder, played back from a blob URL that lives only in this tab.
// Nothing is uploaded; leaving the screen or refreshing throws it away.

export const MAX_MS = 40_000;
const MIMES = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];

export type CamStatus = "idle" | "preview" | "recording" | "done" | "denied" | "unavailable";

export function useCamera() {
  const streamRef = useRef<MediaStream | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);
  const [status, setStatus] = useState<CamStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // The screen hands us its <video> element; no ref objects cross the API.
  const attach = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
    if (el && streamRef.current) { el.srcObject = streamRef.current; el.play().catch(() => {}); }
  }, []);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };
  const clearTimers = () => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current);
    if (tickRef.current != null) window.clearInterval(tickRef.current);
    timerRef.current = tickRef.current = null;
  };

  const reset = useCallback(() => {
    clearTimers();
    const r = recRef.current;
    if (r && r.state !== "inactive") { r.ondataavailable = null; r.onstop = null; try { r.stop(); } catch { /* noop */ } }
    recRef.current = null;
    chunksRef.current = [];
    stopTracks();
    setUrl((u) => { if (u) URL.revokeObjectURL(u); return null; });
    setSeconds(0);
    setStatus("idle");
  }, []);

  const open = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setStatus("unavailable");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 } }, audio: true });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); }
      setStatus("preview");
    } catch (e) {
      const name = (e as { name?: string })?.name;
      setStatus(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
    }
  }, []);

  const finish = useCallback(() => {
    const r = recRef.current;
    if (!r || r.state === "inactive") return;
    r.stop();
  }, []);

  const record = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const mime = MIMES.find((m) => MediaRecorder.isTypeSupported(m));
    if (!mime) { setStatus("unavailable"); return; }
    chunksRef.current = [];
    const r = new MediaRecorder(stream, { mimeType: mime });
    r.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
    r.onstop = () => {
      clearTimers();
      const blob = new Blob(chunksRef.current, { type: mime });
      chunksRef.current = [];
      stopTracks();
      setUrl((u) => { if (u) URL.revokeObjectURL(u); return URL.createObjectURL(blob); });
      setStatus("done");
    };
    recRef.current = r;
    r.start(250);
    setSeconds(0);
    setStatus("recording");
    const t0 = Date.now();
    tickRef.current = window.setInterval(() => setSeconds(Math.min(40, Math.round((Date.now() - t0) / 1000))), 250);
    timerRef.current = window.setTimeout(finish, MAX_MS);
  }, [finish]);

  useEffect(() => () => reset(), [reset]);

  return { status, seconds, url, attach, open, record, finish, reset };
}
