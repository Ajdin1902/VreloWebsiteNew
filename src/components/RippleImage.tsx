"use client";

import { useEffect, useRef } from "react";

const REDUCED = "(prefers-reduced-motion: reduce)";
const MAXR = 24;

type Props = {
  src: string;
  alt: string;
  className?: string;
  seedXFraction?: number; // where the drop sits, 0..1 across the panel
  seedIntervalMs?: number;
};

// Static <img> is the LCP element; a WebGL canvas mounts over it after idle and
// ripples the image under the pointer. Falls back to the still image under
// prefers-reduced-motion or when WebGL is unavailable — never throws.
export function RippleImage({
  src,
  alt,
  className = "",
  seedXFraction = 0.7,
  seedIntervalMs = 5000,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia(REDUCED).matches) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        (canvas.getContext("webgl") as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }
    if (!gl) return; // no WebGL → keep the static image only

    const glc = gl;
    let raf = 0;
    let disposed = false;

    // Best-effort context teardown so a failed init or unmount doesn't strand
    // GPU resources (helps fast remounts / src changes on long-lived pages).
    const loseContext = () => glc.getExtension("WEBGL_lose_context")?.loseContext();

    const vsrc =
      "attribute vec2 p; varying vec2 vUv; void main(){ vUv=p*0.5+0.5; gl_Position=vec4(p,0.0,1.0); }";
    const fsrc = `
      precision highp float;
      varying vec2 vUv;
      uniform sampler2D uTex;
      uniform float uTime, uCanvasAspect, uImgAspect, uStrength, uFreq, uDecay, uSpeed;
      uniform vec3 uR[${MAXR}];
      void main(){
        vec2 disp = vec2(0.0);
        for(int i=0;i<${MAXR};i++){
          vec3 r = uR[i];
          if(r.z < -0.5) continue;
          float t = uTime - r.z;
          if(t < 0.0 || t > 3.0) continue;
          vec2 d = (vUv - r.xy) * vec2(uCanvasAspect, 1.0);
          float dist = length(d);
          float band = exp(-pow(dist - t*uSpeed, 2.0) * 90.0);
          float amp = exp(-t*uDecay) * band;
          float ring = sin(dist*uFreq - t*uFreq*uSpeed) * amp;
          disp += normalize(d + 1e-5) * ring * uStrength;
        }
        vec2 ca = uCanvasAspect > uImgAspect
          ? vec2(1.0, uImgAspect/uCanvasAspect)
          : vec2(uCanvasAspect/uImgAspect, 1.0);
        vec2 uv = (vUv - 0.5) * ca + 0.5;
        vec3 col = texture2D(uTex, uv + disp).rgb;
        col += clamp(length(disp)*22.0, 0.0, 0.6) * vec3(0.83,0.78,0.65);
        gl_FragColor = vec4(col, 1.0);
      }`;

    const sh = (type: number, source: string) => {
      const s = glc.createShader(type)!;
      glc.shaderSource(s, source);
      glc.compileShader(s);
      return s;
    };
    const prog = glc.createProgram()!;
    glc.attachShader(prog, sh(glc.VERTEX_SHADER, vsrc));
    glc.attachShader(prog, sh(glc.FRAGMENT_SHADER, fsrc));
    glc.linkProgram(prog);
    // If the driver couldn't compile/link (flaky/limited GPU), don't run a broken
    // draw loop forever — degrade to the static image, same as the no-WebGL path.
    if (!glc.getProgramParameter(prog, glc.LINK_STATUS)) {
      loseContext();
      return;
    }
    glc.useProgram(prog);

    const buf = glc.createBuffer();
    glc.bindBuffer(glc.ARRAY_BUFFER, buf);
    glc.bufferData(glc.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), glc.STATIC_DRAW);
    const ploc = glc.getAttribLocation(prog, "p");
    glc.enableVertexAttribArray(ploc);
    glc.vertexAttribPointer(ploc, 2, glc.FLOAT, false, 0, 0);

    const u = (n: string) => glc.getUniformLocation(prog, n);
    const U = {
      time: u("uTime"), ca: u("uCanvasAspect"), ia: u("uImgAspect"),
      strength: u("uStrength"), freq: u("uFreq"), decay: u("uDecay"), speed: u("uSpeed"),
      tex: u("uTex"),
    };
    const Ur: (WebGLUniformLocation | null)[] = [];
    for (let i = 0; i < MAXR; i++) Ur.push(u(`uR[${i}]`));

    const tex = glc.createTexture();
    let imgAspect = 0.8;
    const tImg = new Image();
    tImg.crossOrigin = "anonymous";
    tImg.onload = () => {
      if (disposed) return; // unmounted before the texture finished loading
      imgAspect = tImg.width / tImg.height;
      glc.bindTexture(glc.TEXTURE_2D, tex);
      glc.pixelStorei(glc.UNPACK_FLIP_Y_WEBGL, true);
      glc.texImage2D(glc.TEXTURE_2D, 0, glc.RGB, glc.RGB, glc.UNSIGNED_BYTE, tImg);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_S, glc.CLAMP_TO_EDGE);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_WRAP_T, glc.CLAMP_TO_EDGE);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MIN_FILTER, glc.LINEAR);
      glc.texParameteri(glc.TEXTURE_2D, glc.TEXTURE_MAG_FILTER, glc.LINEAR);
    };
    tImg.src = src;

    const ripples = new Float32Array(MAXR * 3);
    for (let i = 0; i < MAXR; i++) ripples[i * 3 + 2] = -1;
    let head = 0;
    const last = { x: 0, y: 0, t: 0, has: false };
    const add = (x: number, y: number, now: number) => {
      ripples[head * 3] = x; ripples[head * 3 + 1] = y; ripples[head * 3 + 2] = now;
      head = (head + 1) % MAXR;
    };

    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = 1 - (e.clientY - rect.top) / rect.height;
      const now = performance.now() / 1000;
      if (!last.has) { last.x = cx; last.y = cy; last.t = now; last.has = true; add(cx, cy, now); return; }
      const dd = Math.hypot(cx - last.x, cy - last.y);
      if (dd > 0.035 || now - last.t > 0.05) { add(cx, cy, now); last.x = cx; last.y = cy; last.t = now; }
    };
    canvas.addEventListener("pointermove", onPointer);
    canvas.addEventListener("pointerdown", onPointer);

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      glc.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // The amber drop seeds a ripple at its x-position on a slow interval.
    const seedTimer = window.setInterval(() => {
      add(seedXFraction, 0.96, performance.now() / 1000);
    }, seedIntervalMs);

    const frame = () => {
      if (disposed) return;
      const now = performance.now() / 1000;
      glc.useProgram(prog);
      glc.uniform1f(U.time, now);
      glc.uniform1f(U.ca, canvas.width / canvas.height);
      glc.uniform1f(U.ia, imgAspect);
      glc.uniform1f(U.strength, 0.01);
      glc.uniform1f(U.freq, 22);
      glc.uniform1f(U.decay, 2.0);
      glc.uniform1f(U.speed, 0.55);
      glc.uniform1i(U.tex, 0);
      glc.activeTexture(glc.TEXTURE0);
      glc.bindTexture(glc.TEXTURE_2D, tex);
      for (let i = 0; i < MAXR; i++) glc.uniform3f(Ur[i], ripples[i * 3], ripples[i * 3 + 1], ripples[i * 3 + 2]);
      glc.drawArrays(glc.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (seedTimer) clearInterval(seedTimer);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onPointer);
      loseContext();
    };
  }, [src, seedXFraction, seedIntervalMs]);

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="ripple-img"
        src={src}
        alt={alt}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
