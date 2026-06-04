# Phase 2c — Video system + Über mich Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `LazyVideo` component, optimize the 4 brand clips into web assets, then ship the Über-mich 4-beat narrative page and wire the sunset clip into the homepage Merak-close.

**Architecture:** One `"use client"` `LazyVideo` owns all video behavior (lazy autoplay via IntersectionObserver, `prefers-reduced-motion` → poster still). Layout is owned by parents: `StoryBeat` (Über mich, data-driven from `src/lib/ueber-mich.ts`) and `MerakClose` (homepage, cover background). Assets are produced by a reproducible `scripts/optimize-videos.mjs` into `public/video/`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, Vitest + React Testing Library (jsdom), ffmpeg via `ffmpeg-static`/`ffprobe-static`.

**Spec:** [docs/superpowers/specs/2026-06-04-vrelo-phase2c-video-ueber-mich-design.md](../specs/2026-06-04-vrelo-phase2c-video-ueber-mich-design.md)

**Conventions (must follow):**
- Client-facing copy **German**, code/comments **English**.
- German quotes „…" = U+201E … U+201C, never ASCII `"`. The data strings in this plan avoid quoting on purpose; if you add German quotes, verify bytes after writing (the Edit tool can downgrade them).
- Only brand `@theme` tokens (`bg-papier`, `text-tiefes-wasser`, `border-faden`, …). No hand-rolled hex except the existing MerakClose gradient.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Do **not** push to `main` (that auto-deploys); commit only.

---

## File structure

| File | Responsibility |
|---|---|
| `scripts/optimize-videos.mjs` (create) | One-off: read `Videos/*.mp4` → write optimized mp4+webm+poster to `public/video/` |
| `public/video/{quelle,ripples,fluss,merak}.{mp4,webm}` + `-poster.jpg` (create) | Web-optimized derivatives, committed |
| `package.json` (modify) | Add `ffmpeg-static`+`ffprobe-static` devDeps and an `optimize:videos` script |
| `vitest.setup.ts` (modify) | Add jsdom stubs for `matchMedia`, `IntersectionObserver`, media `play/pause` |
| `src/components/LazyVideo.tsx` (create) | The reusable lazy/motion-safe video primitive (`"use client"`) |
| `src/components/LazyVideo.test.tsx` (create) | Unit tests with controllable IO/matchMedia mocks |
| `src/lib/ueber-mich.ts` (create) | Typed `storyBeats` data (4 beats, `[Platzhalter]` bodies) |
| `src/lib/ueber-mich.test.ts` (create) | Sanity tests for the data |
| `src/components/ueber-mich/StoryBeat.tsx` (create) | One beat: alternating video + text + numeral |
| `src/components/ueber-mich/StoryBeat.test.tsx` (create) | Render tests |
| `src/app/ueber-mich/page.tsx` (create) | Page: PageIntro → beats → ClosingCta |
| `src/components/home/MerakClose.tsx` (modify) | Replace gradient placeholder with the sunset `LazyVideo` |

---

## Task 1: Asset pipeline — optimize the 4 clips

**Files:**
- Create: `scripts/optimize-videos.mjs`
- Modify: `package.json`
- Create (generated): `public/video/{quelle,ripples,fluss,merak}.mp4`, `.webm`, `-poster.jpg`

- [ ] **Step 1: Install the static ffmpeg binaries (no admin needed)**

Run:
```bash
npm install -D ffmpeg-static ffprobe-static
```
Expected: both packages added to `devDependencies`.

- [ ] **Step 2: Write the optimize script**

Create `scripts/optimize-videos.mjs`:
```js
// One-off asset prep: turns Videos/*.mp4 into web-optimized derivatives in public/video/.
// Reproducible + idempotent (overwrites). Run with: npm run optimize:videos
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
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

for (const { src, slug } of clips) {
  const input = resolve(root, src);
  const mp4 = resolve(outDir, `${slug}.mp4`);
  const webm = resolve(outDir, `${slug}.webm`);
  const poster = resolve(outDir, `${slug}-poster.jpg`);

  const dims = execFileSync(ffprobeStatic.path, [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height", "-of", "csv=p=0", input,
  ]).toString().trim();
  console.log(`\n=== ${slug} (source ${dims}) ===`);

  // H.264 mp4, no audio, faststart for streaming.
  execFileSync(ffmpegPath, [
    "-y", "-i", input, "-an", "-vf", scale,
    "-c:v", "libx264", "-crf", "28", "-preset", "slow",
    "-movflags", "+faststart", mp4,
  ], { stdio: "inherit" });

  // VP9 webm, no audio.
  execFileSync(ffmpegPath, [
    "-y", "-i", input, "-an", "-vf", scale,
    "-c:v", "libvpx-vp9", "-crf", "34", "-b:v", "0", webm,
  ], { stdio: "inherit" });

  // Poster: a frame ~0.1s in.
  execFileSync(ffmpegPath, [
    "-y", "-ss", "0.1", "-i", input, "-vf", scale,
    "-frames:v", "1", "-q:v", "4", poster,
  ], { stdio: "inherit" });
}

console.log("\nDone. Derivatives written to public/video/");
```

- [ ] **Step 3: Add the npm script**

In `package.json` `scripts`, add:
```json
"optimize:videos": "node scripts/optimize-videos.mjs"
```

- [ ] **Step 4: Run the optimization**

Run:
```bash
npm run optimize:videos
```
Expected: prints the source dimensions per clip and writes 12 files into `public/video/`.

- [ ] **Step 5: Verify output sizes and dimensions**

Run:
```bash
ls -la public/video/
```
Expected: 4 `.mp4`, 4 `.webm`, 4 `-poster.jpg`. **Record the dominant aspect ratio** from Step 4's printed dimensions — later tasks need it (e.g. 16:9 → `aspect-video`, 1:1 → `aspect-square`, 9:16 → `aspect-[9/16]`).

If any mp4/webm exceeds ~2.5 MB, re-run after raising `-crf` to `30`–`32` for that codec.

- [ ] **Step 6: Commit**

```bash
git add scripts/optimize-videos.mjs package.json package-lock.json public/video/
git commit -m "$(cat <<'EOF'
feat: optimize brand clips to web mp4+webm+poster assets

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Test infrastructure — jsdom stubs

jsdom lacks `matchMedia`, `IntersectionObserver`, and media playback, all of which `LazyVideo` uses. Add safe defaults globally so any test rendering a component containing `LazyVideo` won't crash. `LazyVideo`'s own test overrides these per-case.

**Files:**
- Modify: `vitest.setup.ts`

- [ ] **Step 1: Extend the setup file**

Replace the contents of `vitest.setup.ts` with:
```ts
import "@testing-library/jest-dom/vitest";

// --- jsdom polyfills for browser APIs LazyVideo relies on ---

// matchMedia: default to "no reduced-motion preference".
if (typeof window.matchMedia !== "function") {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// IntersectionObserver: inert stub (never fires) — enough for components that
// merely construct one. Tests that need to drive it provide their own mock.
if (!("IntersectionObserver" in globalThis)) {
  class IntersectionObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  }
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
    IntersectionObserverStub;
}

// jsdom does not implement media playback.
Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: () => Promise.resolve(),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: () => {},
});
```

- [ ] **Step 2: Verify the existing suite still passes**

Run:
```bash
npm test
```
Expected: PASS (the 28 existing tests still green; setup changes are additive).

- [ ] **Step 3: Commit**

```bash
git add vitest.setup.ts
git commit -m "$(cat <<'EOF'
test: add jsdom stubs for matchMedia, IntersectionObserver, media playback

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: `LazyVideo` component (TDD)

**Files:**
- Create: `src/components/LazyVideo.tsx`
- Test: `src/components/LazyVideo.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/LazyVideo.test.tsx`:
```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { LazyVideo } from "./LazyVideo";

let ioCallback: IntersectionObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  observe.mockClear();
  disconnect.mockClear();
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = vi
    .fn()
    .mockImplementation((cb: IntersectionObserverCallback) => {
      ioCallback = cb;
      return { observe, disconnect, unobserve: vi.fn(), takeRecords: vi.fn() };
    });
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("LazyVideo", () => {
  it("renders only the poster image under prefers-reduced-motion", () => {
    setReducedMotion(true);
    const { container } = render(
      <LazyVideo mp4="/video/quelle.mp4" poster="/video/quelle-poster.jpg" />
    );
    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/video/quelle-poster.jpg"
    );
  });

  it("renders a decorative video with poster and webm-then-mp4 sources", () => {
    setReducedMotion(false);
    const { container } = render(
      <LazyVideo
        mp4="/video/quelle.mp4"
        webm="/video/quelle.webm"
        poster="/video/quelle-poster.jpg"
      />
    );
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("poster", "/video/quelle-poster.jpg");
    expect(video).toHaveAttribute("aria-hidden", "true");
    const sources = container.querySelectorAll("source");
    expect(sources[0]).toHaveAttribute("type", "video/webm");
    expect(sources[1]).toHaveAttribute("type", "video/mp4");
  });

  it("plays when scrolled into view and pauses when out of view", () => {
    setReducedMotion(false);
    const { container } = render(
      <LazyVideo mp4="/video/quelle.mp4" poster="/video/quelle-poster.jpg" />
    );
    const video = container.querySelector("video") as HTMLVideoElement;
    ioCallback(
      [{ isIntersecting: true, target: video } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(video.play).toHaveBeenCalled();
    ioCallback(
      [{ isIntersecting: false, target: video } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(video.pause).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npx vitest run src/components/LazyVideo.test.tsx
```
Expected: FAIL — `LazyVideo` not found / no such module.

- [ ] **Step 3: Implement the component**

Create `src/components/LazyVideo.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";

type LazyVideoProps = {
  mp4: string;
  webm?: string;
  poster: string;
  className?: string;
  aspect?: string;
};

// Reusable lazy video: motion-safe, poster-fallback, plays only while in view.
// Layout (sizing/object-fit) is owned by the parent via className/aspect.
export function LazyVideo({
  mp4,
  webm,
  poster,
  className = "",
  aspect = "",
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [posterOnly, setPosterOnly] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) {
      setPosterOnly(true);
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const boxClass = [aspect, className].filter(Boolean).join(" ");

  if (posterOnly) {
    // Decorative still; the narrative meaning lives in adjacent text.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt="" aria-hidden="true" className={boxClass} />;
  }

  return (
    <video
      ref={videoRef}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className={boxClass}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
npx vitest run src/components/LazyVideo.test.tsx
```
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/LazyVideo.tsx src/components/LazyVideo.test.tsx
git commit -m "$(cat <<'EOF'
feat: add reusable LazyVideo component (lazy, motion-safe, poster fallback)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Über-mich data

**Files:**
- Create: `src/lib/ueber-mich.ts`
- Test: `src/lib/ueber-mich.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/ueber-mich.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { storyBeats } from "./ueber-mich";

describe("storyBeats", () => {
  it("has the four arc beats in order", () => {
    expect(storyBeats.map((b) => b.slug)).toEqual([
      "quelle",
      "ripples",
      "fluss",
      "merak",
    ]);
  });

  it("each beat has an eyebrow, heading, and a placeholder body for the founder", () => {
    for (const beat of storyBeats) {
      expect(beat.eyebrow.length).toBeGreaterThan(0);
      expect(beat.heading.length).toBeGreaterThan(0);
      expect(beat.body).toContain("[Platzhalter]");
    }
  });

  it("alternates the video side", () => {
    expect(storyBeats.map((b) => b.side)).toEqual([
      "left",
      "right",
      "left",
      "right",
    ]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npx vitest run src/lib/ueber-mich.test.ts
```
Expected: FAIL — cannot find module `./ueber-mich`.

- [ ] **Step 3: Implement the data**

Create `src/lib/ueber-mich.ts`:
```ts
export type StoryBeat = {
  slug: string; // matches the clip slug: quelle | ripples | fluss | merak
  eyebrow: string;
  heading: string;
  body: string; // [Platzhalter] — founder replaces with the real story
  side: "left" | "right";
};

export const storyBeats: StoryBeat[] = [
  {
    slug: "quelle",
    eyebrow: "Quelle",
    heading: "Woher ich komme",
    body: "[Platzhalter] Erzähl hier von deinen Wurzeln und dem Ursprung des Namens — Vrelo Bosne, die Quelle bei Sarajevo. Warum dieser Ursprung dich bis heute prägt.",
    side: "left",
  },
  {
    slug: "ripples",
    eyebrow: "Wellen",
    heading: "Der Moment, der alles ins Rollen brachte",
    body: "[Platzhalter] Beschreibe den Moment, in dem dir klar wurde, wie viel Zeit kleine, wiederkehrende Aufgaben kosten — und dass es auch anders geht.",
    side: "right",
  },
  {
    slug: "fluss",
    eyebrow: "Fluss",
    heading: "Wie ich heute arbeite",
    body: "[Platzhalter] Erkläre, wie du Automatisierungen baust: ruhig, sauber, dokumentiert. Was kleine Betriebe von der Zusammenarbeit mit dir erwarten können.",
    side: "left",
  },
  {
    slug: "merak",
    eyebrow: "Merak",
    heading: "Wonach es sich anfühlt",
    body: "[Platzhalter] Male das Bild vom Ergebnis: ein freier Kopf, zurückgewonnene Zeit, Ruhe im Betrieb. Lade zum unverbindlichen Gespräch ein.",
    side: "right",
  },
];
```

- [ ] **Step 4: Verify umlauts wrote as UTF-8 (no mojibake)**

Run:
```bash
node -e 'const s=require("fs").readFileSync("src/lib/ueber-mich.ts","utf8");console.log("umlauts ok:",/[äöüßÄÖÜ]/.test(s),"no mojibake:",!/Ã|â€/.test(s))'
```
Expected: `umlauts ok: true no mojibake: true`. If mojibake, rewrite the file via the Write tool (not Edit).

- [ ] **Step 5: Run the test to verify it passes**

Run:
```bash
npx vitest run src/lib/ueber-mich.test.ts
```
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/ueber-mich.ts src/lib/ueber-mich.test.ts
git commit -m "$(cat <<'EOF'
feat: add Über-mich story-beat data (placeholder bodies for founder)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: `StoryBeat` component

> **Aspect ratio:** the code below uses `aspect-video` (16:9). If Task 1 Step 5 recorded a different dominant ratio, replace `aspect-video` with the matching utility (`aspect-square`, `aspect-[3/4]`, `aspect-[9/16]`, …) in this file.

**Files:**
- Create: `src/components/ueber-mich/StoryBeat.tsx`
- Test: `src/components/ueber-mich/StoryBeat.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/ueber-mich/StoryBeat.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StoryBeat } from "./StoryBeat";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

const beat: StoryBeatType = {
  slug: "quelle",
  eyebrow: "Quelle",
  heading: "Woher ich komme",
  body: "[Platzhalter] Test-Text.",
  side: "left",
};

describe("StoryBeat", () => {
  it("renders the eyebrow, heading, body, and numeral", () => {
    render(<StoryBeat beat={beat} index={0} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Woher ich komme"
    );
    expect(screen.getByText("[Platzhalter] Test-Text.")).toBeInTheDocument();
    expect(screen.getByText("01")).toBeInTheDocument();
  });

  it("renders a video referencing the beat's clip slug", () => {
    const { container } = render(<StoryBeat beat={beat} index={0} />);
    expect(
      container.querySelector('source[src="/video/quelle.mp4"]')
    ).toBeInTheDocument();
    expect(
      container.querySelector('source[src="/video/quelle.webm"]')
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:
```bash
npx vitest run src/components/ueber-mich/StoryBeat.test.tsx
```
Expected: FAIL — cannot find module `./StoryBeat`.

- [ ] **Step 3: Implement the component**

Create `src/components/ueber-mich/StoryBeat.tsx`:
```tsx
import { LazyVideo } from "@/components/LazyVideo";
import type { StoryBeat as StoryBeatType } from "@/lib/ueber-mich";

export function StoryBeat({
  beat,
  index,
}: {
  beat: StoryBeatType;
  index: number;
}) {
  const number = String(index + 1).padStart(2, "0");
  const headingId = `beat-${beat.slug}`;
  // DOM order is always video-then-text (mobile-consistent); `side` flips
  // the column order on desktop only.
  const videoFirst = beat.side === "left";

  return (
    <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
      <div className={videoFirst ? "md:order-1" : "md:order-2"}>
        <LazyVideo
          mp4={`/video/${beat.slug}.mp4`}
          webm={`/video/${beat.slug}.webm`}
          poster={`/video/${beat.slug}-poster.jpg`}
          aspect="aspect-video"
          className="w-full rounded-2xl object-cover"
        />
      </div>
      <div className={videoFirst ? "md:order-2" : "md:order-1"}>
        <p aria-hidden="true" className="font-serif text-lg italic text-vrelo-petrol">
          {number}
        </p>
        <p className="mt-2 text-sm font-medium uppercase tracking-wider text-stumm">
          {beat.eyebrow}
        </p>
        <h2
          id={headingId}
          className="mt-2 text-2xl font-semibold text-tiefes-wasser md:text-3xl"
        >
          {beat.heading}
        </h2>
        <p className="mt-4 max-w-xl text-tinte">{beat.body}</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run:
```bash
npx vitest run src/components/ueber-mich/StoryBeat.test.tsx
```
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/ueber-mich/StoryBeat.tsx src/components/ueber-mich/StoryBeat.test.tsx
git commit -m "$(cat <<'EOF'
feat: add StoryBeat component for the Über-mich narrative spine

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Über-mich page route

No dedicated route test (matches the Phase 2b convention); verified by build.

**Files:**
- Create: `src/app/ueber-mich/page.tsx`

- [ ] **Step 1: Implement the page**

Create `src/app/ueber-mich/page.tsx`:
```tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { StoryBeat } from "@/components/ueber-mich/StoryBeat";
import { storyBeats } from "@/lib/ueber-mich";

export const metadata: Metadata = {
  title: "Über mich",
  description:
    "Wer hinter Vrelo steckt: meine Geschichte von der Quelle bis zum Merak-Effekt — und warum ich Automatisierungen für kleine Betriebe baue.",
};

export default function UeberMichPage() {
  return (
    <>
      <PageIntro
        eyebrow="Die Person hinter der Arbeit"
        title="Über mich"
        lead="[Platzhalter] Ein, zwei einleitende Sätze: wer du bist und warum es dir bei Vrelo um Ruhe, Zeit und einen freien Kopf geht."
      />
      {storyBeats.map((beat, index) => (
        <Section
          key={beat.slug}
          tone="paper"
          tint={index % 2 === 1}
          className="border-t border-faden"
        >
          <StoryBeat beat={beat} index={index} />
        </Section>
      ))}
      <ClosingCta
        heading="Lern mich unverbindlich kennen."
        lead="Erzähl mir, was dich täglich Zeit kostet — ich zeige dir ehrlich, ob und wie ich helfen kann."
      />
    </>
  );
}
```

- [ ] **Step 2: Verify umlauts wrote as UTF-8**

Run:
```bash
node -e 'const s=require("fs").readFileSync("src/app/ueber-mich/page.tsx","utf8");console.log("umlauts ok:",/[äöüßÄÖÜ]/.test(s),"no mojibake:",!/Ã|â€/.test(s))'
```
Expected: `umlauts ok: true no mojibake: true`.

- [ ] **Step 3: Build to verify the route compiles and prerenders**

Run:
```bash
npm run build
```
Expected: build succeeds; `/ueber-mich` appears in the route list as a static prerender.

- [ ] **Step 4: Commit**

```bash
git add src/app/ueber-mich/page.tsx
git commit -m "$(cat <<'EOF'
feat: add Über-mich page (4-beat narrative spine)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Wire the sunset clip into MerakClose

> **Aspect ratio note:** cover mode uses `h-full w-full object-cover`, so no `aspect` is needed here regardless of the clip's ratio.

**Files:**
- Modify: `src/components/home/MerakClose.tsx`

- [ ] **Step 1: Replace the placeholder gradient with the video + tint overlay**

Replace the entire contents of `src/components/home/MerakClose.tsx` with:
```tsx
import { Section } from "@/components/Section";
import { BrandWord } from "@/components/BrandWord";
import { CTAButton } from "@/components/CTAButton";
import { LazyVideo } from "@/components/LazyVideo";

export function MerakClose() {
  return (
    <Section tone="warm" className="relative overflow-hidden">
      {/* Sunset clip (merak) behind the close. Below the fold → no LCP cost.
          Reduced-motion falls back to the poster still inside LazyVideo. */}
      <LazyVideo
        mp4="/video/merak.mp4"
        webm="/video/merak.webm"
        poster="/video/merak-poster.jpg"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      {/* Warm tint over the footage keeps the amber register + text contrast. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_120%,#f4e4c1,#e8b86b_55%,#f4e4c1_100%)] opacity-80"
      />
      <h2 className="max-w-2xl font-serif text-3xl italic leading-snug text-ember md:text-4xl">
        Stell dir den Montagmorgen vor, an dem schon zwei Stunden Arbeit erledigt sind.
      </h2>
      <p className="mt-6 max-w-xl text-lg text-tinte">
        Das ist der <BrandWord>Merak</BrandWord>-Effekt. Kein Druck — schau dir
        unverbindlich an, was möglich ist.
      </p>
      <div className="mt-8">
        <CTAButton href="/kontakt" />
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Verify umlauts wrote as UTF-8**

Run:
```bash
node -e 'const s=require("fs").readFileSync("src/components/home/MerakClose.tsx","utf8");console.log("umlauts ok:",/[äöüßÄÖÜ]/.test(s),"no mojibake:",!/Ã|â€/.test(s))'
```
Expected: `umlauts ok: true no mojibake: true`.

- [ ] **Step 3: Build to verify the homepage still compiles**

Run:
```bash
npm run build
```
Expected: build succeeds; `/` still a static prerender.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/MerakClose.tsx
git commit -m "$(cat <<'EOF'
feat: wire sunset clip into homepage Merak-close

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Full verification + docs

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Run the full gate**

Run:
```bash
npm test && npm run build && npm run lint && npx tsc --noEmit
```
Expected: all green. (`npm test` should now report the prior 28 + new LazyVideo/data/StoryBeat tests.)

- [ ] **Step 2: Visual check (optional but recommended)**

Run `npm run build` then `npm start`, and open `http://localhost:3000/ueber-mich` and `http://localhost:3000/` — confirm the beats render, videos lazy-play on scroll, and the homepage close shows the sunset behind the text. (Use `npm start`, not `npm run dev` — the production server serves the static pages without per-request compile, which is reliable in this environment.)

- [ ] **Step 3: Update CLAUDE.md**

In `CLAUDE.md`:
- Status: mark Phase 2c done (LazyVideo + Über mich + Merak-close video).
- Known dead links: remove `/ueber-mich` (now live), leaving `/ratgeber` and `/kontakt`.
- Roadmap line 2c: `✅ done`.
- Resume pointer: set the next phase to **Phase 3 — Ratgeber/MDX + SEO**.

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
docs: mark Phase 2c done; point resume at Phase 3

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

## Self-review notes (for the executor)

- **Spec coverage:** §3 LazyVideo → Task 3; §4 assets → Task 1; §5 data/StoryBeat/page → Tasks 4–6; §6 MerakClose → Task 7; §8 testing → Tasks 2–5; §9 DoD → Task 8.
- **Type consistency:** `StoryBeat` type and `storyBeats` (Task 4) are consumed unchanged in Tasks 5–6; `LazyVideo` prop names (`mp4`/`webm`/`poster`/`className`/`aspect`) match across Tasks 3, 5, 7.
- **No real biography is invented** — every story body is a `[Platzhalter]` prompt; the founder fills them.
