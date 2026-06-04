// One-off asset prep: turns Videos/*.mp4 into web-optimized derivatives in public/video/.
// Reproducible + idempotent (overwrites). Run with: npm run optimize:videos
//
// Source clips are 1920x1080 (16:9), 24fps, ~8-10s. Outputs are capped at 1280px
// wide, stripped of audio, and tuned for small size with fast-but-good presets.
import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/video");
mkdirSync(outDir, { recursive: true });

const clips = [
  { src: "Videos/Beginning.mp4", slug: "quelle" },
  { src: "Videos/Second_Part.mp4", slug: "ripples" },
  { src: "Videos/Thrid_Part.mp4", slug: "fluss" },
  { src: "Videos/End.mp4", slug: "merak" },
];

// Cap width at 1280, keep aspect, ensure even height for codecs.
const scale = "scale='min(1280,iw)':-2";
const mb = (p) => (statSync(p).size / 1_048_576).toFixed(2);

for (const { src, slug } of clips) {
  const input = resolve(root, src);
  const mp4 = resolve(outDir, `${slug}.mp4`);
  const webm = resolve(outDir, `${slug}.webm`);
  const poster = resolve(outDir, `${slug}-poster.jpg`);

  const dur = parseFloat(
    execFileSync(ffprobeStatic.path, [
      "-v", "error", "-select_streams", "v:0",
      "-show_entries", "stream=duration", "-of", "csv=p=0", input,
    ]).toString().trim()
  );
  const posterAt = Number.isFinite(dur) ? (dur * 0.35).toFixed(2) : "1.0";
  console.log(`\n=== ${slug} (${dur || "?"}s, poster @ ${posterAt}s) ===`);

  // H.264 mp4, no audio, faststart for streaming.
  execFileSync(ffmpegPath, [
    "-y", "-i", input, "-an", "-vf", scale,
    "-c:v", "libx264", "-crf", "28", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4,
  ], { stdio: "inherit" });

  // VP9 webm, no audio. row-mt + cpu-used keep encode time sane.
  execFileSync(ffmpegPath, [
    "-y", "-i", input, "-an", "-vf", scale,
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0",
    "-deadline", "good", "-cpu-used", "3", "-row-mt", "1", webm,
  ], { stdio: "inherit" });

  // Poster: a representative frame ~35% in.
  execFileSync(ffmpegPath, [
    "-y", "-ss", posterAt, "-i", input, "-vf", scale,
    "-frames:v", "1", "-q:v", "4", poster,
  ], { stdio: "inherit" });

  console.log(`-> ${slug}.mp4 ${mb(mp4)} MB | ${slug}.webm ${mb(webm)} MB | poster ${mb(poster)} MB`);
}

console.log("\nDone. Derivatives written to public/video/");
