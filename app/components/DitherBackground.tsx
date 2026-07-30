"use client";

import { useEffect, useRef } from "react";

// Animated random-dot dither background — reproduces the Paper `ShaderDithering`
// layer (Type: Random, Shape: Dots, pink #FFD8D8 @ 35%, animated).
// Raw WebGL, no three.js.

// --- tunables (mapped from the Paper parameters) ---
const FOREGROUND: [number, number, number] = [1.0, 0.847, 0.847]; // #FFD8D8
const ALPHA = 0.35; // Foreground 35%
const CELL_PX = 5; // dot cell size (Scale / Dither size)
const DOT_RADIUS = 0.34; // dot radius as fraction of the cell
const DENSITY = 0.55; // share of cells lit at any moment
const SPEED = 2.0; // re-randomization steps / second (Speed 200%)

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uDpr;
uniform vec3 uColor;
uniform float uAlpha, uCell, uDot, uDensity, uSpeed;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  float cell = uCell * uDpr;
  vec2 cid = floor(gl_FragCoord.xy / cell);
  vec2 local = fract(gl_FragCoord.xy / cell) - 0.5;

  // Random value per cell, stepping over time with smooth interpolation.
  float t = uTime * uSpeed;
  float s0 = floor(t);
  float a = hash(cid + s0 * 1.7);
  float b = hash(cid + (s0 + 1.0) * 1.7);
  float r = mix(a, b, smoothstep(0.0, 1.0, fract(t)));

  float on = step(r, uDensity);
  float d = length(local);
  float dot = 1.0 - smoothstep(uDot - 0.12, uDot + 0.12, d);

  gl_FragColor = vec4(uColor, uAlpha * on * dot);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("dither shader:", gl.getShaderInfoLog(sh));
  }
  return sh;
}

export default function DitherBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
    });
    if (!gl) return; // no WebGL → render nothing

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    // Full-screen triangle
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("uRes"), uTime = u("uTime"), uDpr = u("uDpr");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.uniform3fv(u("uColor"), FOREGROUND);
    gl.uniform1f(u("uAlpha"), ALPHA);
    gl.uniform1f(u("uCell"), CELL_PX);
    gl.uniform1f(u("uDot"), DOT_RADIUS);
    gl.uniform1f(u("uDensity"), DENSITY);
    gl.uniform1f(u("uSpeed"), SPEED);
    gl.uniform1f(uDpr, dpr);

    const resize = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();

    const draw = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw(start);

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!reduce && !document.hidden) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
