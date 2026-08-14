"use client";

import { useEffect, useRef } from "react";
import yusukeFrames from "../../public/assets/fight/yusuke-frames.json";

const IDLE_FRAME_MS = 320;
const CHARGE_FRAME_MS = 140;
const CHARGE_BASELINE_OFFSET = 13;
const ACTION_CHARACTER_SCALE = 48 / 52;
const RECOIL_FRAME_MS = 120;
const BLAST_MS = 450;
const RECOVERY_FRAME_MS = 140;
const REDUCED_STATE_MS = 180;
const FIGHTER_X_RATIO = 0.91;

type AnimationState = "idle" | "charging" | "firing" | "recovery";
type FrameGroup = keyof typeof yusukeFrames.groups;

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

function drawFrame(
  context: CanvasRenderingContext2D,
  atlas: HTMLImageElement,
  frame: number,
  centerX: number,
  baselineY: number,
  scale: number,
  faceLeft: boolean,
) {
  const { width: cellWidth, height: cellHeight, columns } = yusukeFrames.cell;
  const sourceX = (frame % columns) * cellWidth;
  const sourceY = Math.floor(frame / columns) * cellHeight;
  const width = cellWidth * scale;
  const height = cellHeight * scale;

  context.save();
  context.translate(centerX, 0);
  context.scale(faceLeft ? -1 : 1, 1);
  context.drawImage(
    atlas,
    sourceX,
    sourceY,
    cellWidth,
    cellHeight,
    -width / 2,
    baselineY - height,
    width,
    height,
  );
  context.restore();
}

function groupFrame(group: FrameGroup, index: number) {
  const frames = yusukeFrames.groups[group];
  return frames[Math.min(index, frames.length - 1)];
}

export default function ExplorationFight() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let reducedTimer = 0;
    let resizeObserver: ResizeObserver | undefined;
    let cancelled = false;
    let cleanupRun: (() => void) | undefined;
    let starting = false;
    let revision = 0;

    const stageIsVisible = () => canvas.getBoundingClientRect().width > 0;

    const stop = () => {
      revision += 1;
      starting = false;
      window.clearTimeout(reducedTimer);
      cleanupRun?.();
      cleanupRun = undefined;
      stage.dataset.active = "false";
    };

    const start = async () => {
      stop();
      if (!stageIsVisible()) return;
      starting = true;
      const currentRevision = revision;
      const context = canvas.getContext("2d");
      if (!context) return;

      const atlas = await loadImage("/assets/fight/yusuke-atlas.png");
      if (cancelled || currentRevision !== revision || !stageIsVisible()) return;
      starting = false;

      let width = 0;
      let height = 0;
      let pointerX = window.innerWidth;
      let state: AnimationState = "idle";
      let stateStartedAt = performance.now();
      let idleStartedAt = stateStartedAt;
      let lockedFaceLeft = false;
      let activePointerId: number | null = null;

      const resize = () => {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        context.imageSmoothingEnabled = false;
      };

      const transition = (next: AnimationState, now: number) => {
        state = next;
        stage.dataset.state = next;
        stateStartedAt = now;
        stage.dataset.active = next === "idle" ? "false" : "true";
        if (next === "idle") idleStartedAt = now;
      };

      const render = (now: number) => {
        context.clearRect(0, 0, width, height);
        const fighterX = width * FIGHTER_X_RATIO;
        const baseline = height - 1;
        const scale = Math.min(1.18, Math.max(1, width / 575));
        const actionScale = scale * ACTION_CHARACTER_SCALE;
        const fighterClientX = canvas.getBoundingClientRect().left + fighterX;
        const idleFaceLeft = pointerX < fighterClientX;

        if (reducedMotion.matches) {
          if (state === "idle") {
            drawFrame(context, atlas, groupFrame("idle", 0), fighterX, baseline, scale, idleFaceLeft);
          } else if (state === "charging") {
            drawFrame(
              context,
              atlas,
              groupFrame("charge", 9),
              fighterX,
              baseline + CHARGE_BASELINE_OFFSET * actionScale,
              actionScale,
              lockedFaceLeft,
            );
          } else if (state === "firing") {
            const direction = lockedFaceLeft ? -1 : 1;
            drawFrame(
              context,
              atlas,
              groupFrame("recovery", 0),
              fighterX,
              baseline,
              actionScale,
              lockedFaceLeft,
            );
            drawFrame(
              context,
              atlas,
              groupFrame("fire", 2),
              fighterX + direction * 52 * scale,
              baseline,
              scale,
              lockedFaceLeft,
            );
          } else {
            drawFrame(
              context,
              atlas,
              groupFrame("recovery", 3),
              fighterX,
              baseline,
              actionScale,
              lockedFaceLeft,
            );
          }
          return;
        }

        if (state === "idle") {
          const index = Math.floor((now - idleStartedAt) / IDLE_FRAME_MS) % 4;
          drawFrame(context, atlas, groupFrame("idle", index), fighterX, baseline, scale, idleFaceLeft);
        } else if (state === "charging") {
          const index = Math.min(9, Math.floor((now - stateStartedAt) / CHARGE_FRAME_MS));
          drawFrame(
            context,
            atlas,
            groupFrame("charge", index),
            fighterX,
            baseline + CHARGE_BASELINE_OFFSET * actionScale,
            actionScale,
            lockedFaceLeft,
          );
        } else if (state === "firing") {
          const elapsed = now - stateStartedAt;
          const recoilDuration = RECOIL_FRAME_MS * 2;
          if (elapsed < recoilDuration) {
            const index = Math.floor(elapsed / RECOIL_FRAME_MS);
            drawFrame(
              context,
              atlas,
              groupFrame("fire", index),
              fighterX,
              baseline,
              actionScale,
              lockedFaceLeft,
            );
          } else {
            transition("recovery", now);
            drawFrame(
              context,
              atlas,
              groupFrame("recovery", 0),
              fighterX,
              baseline,
              actionScale,
              lockedFaceLeft,
            );
            const direction = lockedFaceLeft ? -1 : 1;
            drawFrame(
              context,
              atlas,
              groupFrame("fire", 2),
              fighterX + direction * 48 * scale,
              baseline,
              scale,
              lockedFaceLeft,
            );
          }
        } else {
          const recoveryElapsed = now - stateStartedAt;
          const index = Math.floor(recoveryElapsed / RECOVERY_FRAME_MS);
          if (index >= 4) {
            transition("idle", now);
            drawFrame(context, atlas, groupFrame("idle", 0), fighterX, baseline, scale, idleFaceLeft);
          } else {
            drawFrame(
              context,
              atlas,
              groupFrame("recovery", index),
              fighterX,
              baseline,
              actionScale,
              lockedFaceLeft,
            );
            if (recoveryElapsed < BLAST_MS) {
              const progress = Math.min(1, recoveryElapsed / BLAST_MS);
              const direction = lockedFaceLeft ? -1 : 1;
              const startX = fighterX + direction * 48 * scale;
              const endX = direction < 0 ? -80 * scale : width + 80 * scale;
              const projectileX = startX + (endX - startX) * progress;
              const blastFrame = 2 + (Math.floor(recoveryElapsed / 90) % 2);
              drawFrame(
                context,
                atlas,
                groupFrame("fire", blastFrame),
                projectileX,
                baseline,
                scale,
                lockedFaceLeft,
              );
            }
          }
        }

        animationFrame = requestAnimationFrame(render);
      };

      const releasePointerCapture = () => {
        if (activePointerId !== null && stage.hasPointerCapture(activePointerId)) {
          stage.releasePointerCapture(activePointerId);
        }
        activePointerId = null;
      };

      const cancelInteraction = () => {
        if (state === "idle") return;
        window.clearTimeout(reducedTimer);
        releasePointerCapture();
        transition("idle", performance.now());
        if (reducedMotion.matches) render(performance.now());
      };

      const handlePointerMove = (event: PointerEvent) => {
        pointerX = event.clientX;
        const stageRect = stage.getBoundingClientRect();
        stage.style.setProperty("--fight-reveal-x", `${event.clientX - stageRect.left}px`);
        stage.style.setProperty("--fight-reveal-y", `${event.clientY - stageRect.top}px`);
        if (state === "idle" && reducedMotion.matches) render(performance.now());
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary || state !== "idle") return;
        pointerX = event.clientX;
        const fighterClientX = canvas.getBoundingClientRect().left + width * FIGHTER_X_RATIO;
        lockedFaceLeft = pointerX < fighterClientX;
        activePointerId = event.pointerId;
        stage.setPointerCapture(event.pointerId);
        transition("charging", performance.now());
        if (reducedMotion.matches) render(performance.now());
      };

      const beginFiring = () => {
        if (state !== "charging") return;
        releasePointerCapture();
        transition("firing", performance.now());

        if (reducedMotion.matches) {
          render(performance.now());
          reducedTimer = window.setTimeout(() => {
            transition("recovery", performance.now());
            render(performance.now());
            reducedTimer = window.setTimeout(() => {
              transition("idle", performance.now());
              render(performance.now());
            }, REDUCED_STATE_MS);
          }, REDUCED_STATE_MS);
        }
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (event.pointerId !== activePointerId) return;
        beginFiring();
      };

      const handleMouseUp = (event: MouseEvent) => {
        if (event.button !== 0) return;
        beginFiring();
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("blur", cancelInteraction);
      stage.addEventListener("pointerdown", handlePointerDown);
      stage.addEventListener("pointercancel", cancelInteraction);
      animationFrame = requestAnimationFrame(render);

      cleanupRun = () => {
        window.clearTimeout(reducedTimer);
        cancelAnimationFrame(animationFrame);
        resizeObserver?.disconnect();
        releasePointerCapture();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("mouseup", handleMouseUp);
        window.removeEventListener("blur", cancelInteraction);
        stage.removeEventListener("pointerdown", handlePointerDown);
        stage.removeEventListener("pointercancel", cancelInteraction);
      };
    };

    const restart = () => {
      if (stageIsVisible()) void start();
      else stop();
    };
    const visibilityObserver = new ResizeObserver(() => {
      if (stageIsVisible()) {
        if (!cleanupRun && !starting) void start();
      } else {
        stop();
      }
    });
    visibilityObserver.observe(canvas);
    reducedMotion.addEventListener("change", restart);
    if (stageIsVisible()) void start();

    return () => {
      cancelled = true;
      stop();
      visibilityObserver.disconnect();
      reducedMotion.removeEventListener("change", restart);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      data-active="false"
      data-state="idle"
      className="exploration-fight-stage relative hidden h-[84px] select-none lg:block"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="exploration-fight pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="rule-solid pointer-events-none absolute inset-x-0 bottom-0" />
    </div>
  );
}
