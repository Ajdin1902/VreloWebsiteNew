# Digitale Visitenkarte (`/karte`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a hidden digital business card at `vrelo-ki.de/karte` with a one-tap "save contact" (vCard), plus a separate QR-only page and a standalone QR image file that both point at the card.

**Architecture:** Three hidden routes in the existing Next.js 16 Website repo — `/karte` (branded card page), `/karte/qr` (QR-only page), `/karte/kontakt.vcf` (route handler returning a vCard). Contact data lives in one module (`src/lib/karte.ts`). Photo + QR assets are generated once by a committed script and shipped as static files (no runtime QR/image libraries). All three routes are noindex, absent from sitemap and nav — identical to how `/demo` and `/makler` are hidden.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Vitest + Testing Library, Tailwind v4 theme tokens, `sharp` (already in node_modules) + `qrcode` (added as devDependency) for one-off asset generation.

---

## File Structure

- Create `src/lib/karte.ts` — contact constants (`KARTE`) + `buildVcard()`. Single source of truth.
- Create `src/lib/karte.test.ts` — unit tests for `buildVcard()`.
- Create `scripts/build-karte-assets.mjs` — one-off generator (portrait webp, vCard photo base64 module, QR svg + png).
- Create (generated) `src/lib/karte-photo.ts` — `KARTE_PHOTO_BASE64` string. Written by the script; committed.
- Create (generated) `public/images/karte-portrait.webp`, `public/karte-qr.svg`, `public/karte-qr.png`. Committed.
- Create `src/app/karte/page.tsx` + `src/app/karte/page.test.tsx` — the card page.
- Create `src/app/karte/qr/page.tsx` + `src/app/karte/qr/page.test.tsx` — the QR-only page.
- Create `src/app/karte/kontakt.vcf/route.ts` + `src/app/karte/kontakt.vcf/route.test.ts` — the vCard endpoint.
- Modify `src/app/sitemap.test.ts` — assert `/karte` and `/karte/qr` are excluded.

Reusable existing pieces: `BrandWord` (`src/components/BrandWord.tsx`) for the *Vrelo* wordmark; Tailwind tokens `bg-papier`, `text-tinte`, `text-vrelo-petrol`, `bg-vrelo-petrol`, `border-faden`, `card-depth`, `font-serif` (Fraunces).

---

## Task 1: Contact data module + vCard builder

**Files:**
- Create: `src/lib/karte.ts`
- Test: `src/lib/karte.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/karte.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { KARTE, buildVcard } from "./karte";

describe("buildVcard", () => {
  it("produces a vCard with the contact fields", () => {
    const v = buildVcard();
    expect(v).toContain("BEGIN:VCARD");
    expect(v).toContain("VERSION:3.0");
    expect(v).toContain("FN:Ajdin Dzafic");
    expect(v).toContain("N:Dzafic;Ajdin;;;");
    expect(v).toContain("ORG:Vrelo");
    expect(v).toContain("TITLE:Automatisierung für Betriebe");
    expect(v).toContain(`EMAIL;TYPE=INTERNET:${KARTE.email}`);
    expect(v).toContain(`TEL;TYPE=CELL:${KARTE.phone}`);
    expect(v).toContain("URL:https://vrelo-ki.de");
    expect(v.trimEnd().endsWith("END:VCARD")).toBe(true);
  });

  it("omits PHOTO with no arg and includes it when given", () => {
    expect(buildVcard()).not.toContain("PHOTO");
    expect(buildVcard("ZmFrZQ==")).toContain("PHOTO;ENCODING=b;TYPE=JPEG:ZmFrZQ==");
  });

  it("uses CRLF line endings (vCard spec)", () => {
    expect(buildVcard()).toContain("\r\n");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/karte.test.ts`
Expected: FAIL — cannot resolve `./karte`.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/karte.ts`:

```ts
// Single source of truth for the digital business card (/karte).
// Change a detail here → the page, QR target, and vCard all follow.
export const KARTE = {
  fullName: "Ajdin Dzafic",
  firstName: "Ajdin",
  lastName: "Dzafic",
  org: "Vrelo",
  descriptor: "Automatisierung für Betriebe",
  email: "ajdin@vrelo-ki.de",
  phone: "+49 176 4380 6085",
  website: "https://vrelo-ki.de",
  vcfPath: "/karte/kontakt.vcf",
} as const;

// vCard 3.0. Photo (small base64 JPEG) is optional so the builder stays
// testable without the generated asset; the route handler passes the real one.
export function buildVcard(photoBase64?: string): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${KARTE.lastName};${KARTE.firstName};;;`,
    `FN:${KARTE.fullName}`,
    `ORG:${KARTE.org}`,
    `TITLE:${KARTE.descriptor}`,
    `EMAIL;TYPE=INTERNET:${KARTE.email}`,
    `TEL;TYPE=CELL:${KARTE.phone}`,
    `URL:${KARTE.website}`,
  ];
  if (photoBase64) {
    lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`);
  }
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/karte.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/karte.ts src/lib/karte.test.ts
git commit -m "feat(karte): contact data module + vCard builder

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Asset generation script (portrait, vCard photo, QR)

Not TDD — a one-off generator whose committed *outputs* are what matter. Verify by file existence and by eyeballing the QR resolves.

**Files:**
- Create: `scripts/build-karte-assets.mjs`
- Modify: `package.json` (add `qrcode` devDependency + `karte:assets` script)
- Generates (commit these): `src/lib/karte-photo.ts`, `public/images/karte-portrait.webp`, `public/karte-qr.svg`, `public/karte-qr.png`

- [ ] **Step 1: Add the `qrcode` devDependency**

Run: `npm install --save-dev qrcode`
Expected: `qrcode` appears under `devDependencies` in `package.json`. (`sharp` is already resolvable via Next — no install needed.)

- [ ] **Step 2: Add the npm script**

In `package.json` `"scripts"`, add after `"optimize:videos"`:

```json
    "karte:assets": "node scripts/build-karte-assets.mjs",
```

- [ ] **Step 3: Write the generation script**

Create `scripts/build-karte-assets.mjs`:

```js
// One-off asset prep for the digital business card (/karte).
// Reproducible + idempotent (overwrites). Run: npm run karte:assets
//   - public/images/karte-portrait.webp  : display portrait (square, ~640px)
//   - src/lib/karte-photo.ts             : base64 JPEG embedded in the vCard
//   - public/karte-qr.svg                : QR for the /karte/qr page
//   - public/karte-qr.png                : standalone QR (save to phone / print)
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import QRCode from "qrcode";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "C:/Users/ajdin/OneDrive/AJ19/Arbeit/Dokumente/Personal/Dzafic_Ajdin.jpg";
const CARD_URL = "https://vrelo-ki.de/karte";
// Brand: petrol on papier. High enough contrast to scan; on-brand.
const QR_COLOR = { dark: "#1b5063", light: "#f4efe6" };

const pub = resolve(root, "public");
const imgDir = resolve(pub, "images");
const libDir = resolve(root, "src/lib");
mkdirSync(imgDir, { recursive: true });

// 1. Display portrait — square webp, attention-cropped so the face survives.
await sharp(SRC)
  .resize(640, 640, { fit: "cover", position: sharp.strategy.attention })
  .webp({ quality: 82 })
  .toFile(resolve(imgDir, "karte-portrait.webp"));

// 2. vCard photo — small square JPEG, base64 into a committed module.
const jpeg = await sharp(SRC)
  .resize(300, 300, { fit: "cover", position: sharp.strategy.attention })
  .jpeg({ quality: 78 })
  .toBuffer();
writeFileSync(
  resolve(libDir, "karte-photo.ts"),
  `// GENERATED by scripts/build-karte-assets.mjs — do not edit by hand.\n` +
    `export const KARTE_PHOTO_BASE64 = "${jpeg.toString("base64")}";\n`,
);

// 3. QR — SVG (page) + high-res PNG (standalone).
const svg = await QRCode.toString(CARD_URL, {
  type: "svg", margin: 2, errorCorrectionLevel: "M", color: QR_COLOR,
});
writeFileSync(resolve(pub, "karte-qr.svg"), svg);
await QRCode.toFile(resolve(pub, "karte-qr.png"), CARD_URL, {
  margin: 2, width: 1024, errorCorrectionLevel: "M", color: QR_COLOR,
});

console.log("karte assets built.");
```

- [ ] **Step 4: Run the generator**

Run: `npm run karte:assets`
Expected: prints `karte assets built.` and creates the four output files. Verify:

Run: `ls -la public/images/karte-portrait.webp public/karte-qr.svg public/karte-qr.png src/lib/karte-photo.ts`
Expected: all four exist and are non-empty.

- [ ] **Step 5: Sanity-check the QR resolves**

Open `public/karte-qr.png` and scan it with a phone camera. Expected: it offers to open `https://vrelo-ki.de/karte`. (The page 404s until deployed — that's fine; only the decoded URL matters here.)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/build-karte-assets.mjs src/lib/karte-photo.ts public/images/karte-portrait.webp public/karte-qr.svg public/karte-qr.png
git commit -m "feat(karte): asset generator + generated portrait/QR/vCard-photo

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: vCard route handler `/karte/kontakt.vcf`

**Files:**
- Create: `src/app/karte/kontakt.vcf/route.ts`
- Test: `src/app/karte/kontakt.vcf/route.test.ts`

Note: the folder name literally includes the dot (`kontakt.vcf`) so the route serves at `/karte/kontakt.vcf`.

- [ ] **Step 1: Write the failing test**

Create `src/app/karte/kontakt.vcf/route.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";

// Decouple from the generated photo bytes.
vi.mock("@/lib/karte-photo", () => ({ KARTE_PHOTO_BASE64: "ZmFrZQ==" }));

import { GET } from "./route";

describe("GET /karte/kontakt.vcf", () => {
  it("returns a vCard with the right headers and body", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toBe("text/vcard; charset=utf-8");
    expect(res.headers.get("content-disposition")).toContain("ajdin-dzafic.vcf");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCARD");
    expect(body).toContain("FN:Ajdin Dzafic");
    expect(body).toContain("PHOTO;ENCODING=b;TYPE=JPEG:ZmFrZQ==");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/karte/kontakt.vcf/route.test.ts`
Expected: FAIL — cannot resolve `./route`.

- [ ] **Step 3: Write minimal implementation**

Create `src/app/karte/kontakt.vcf/route.ts`:

```ts
import { buildVcard } from "@/lib/karte";
import { KARTE_PHOTO_BASE64 } from "@/lib/karte-photo";

export function GET() {
  return new Response(buildVcard(KARTE_PHOTO_BASE64), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="ajdin-dzafic.vcf"',
    },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/karte/kontakt.vcf/route.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/karte/kontakt.vcf/route.ts src/app/karte/kontakt.vcf/route.test.ts
git commit -m "feat(karte): vCard endpoint /karte/kontakt.vcf

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: The card page `/karte`

**Files:**
- Create: `src/app/karte/page.tsx`
- Test: `src/app/karte/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/karte/page.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KartePage, { metadata } from "./page";

describe("KartePage", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("shows the contact details and a save link", () => {
    render(<KartePage />);
    expect(screen.getByText("Ajdin Dzafic")).toBeTruthy();
    expect(screen.getByText(/Automatisierung für Betriebe/)).toBeTruthy();
    expect(screen.getByText("ajdin@vrelo-ki.de")).toBeTruthy();
    expect(screen.getByText("+49 176 4380 6085")).toBeTruthy();
    const save = screen.getByText("Kontakt speichern").closest("a");
    expect(save?.getAttribute("href")).toBe("/karte/kontakt.vcf");
  });

  it("links email and phone as tap targets", () => {
    render(<KartePage />);
    expect(screen.getByText("ajdin@vrelo-ki.de").closest("a")?.getAttribute("href"))
      .toBe("mailto:ajdin@vrelo-ki.de");
    expect(screen.getByText("+49 176 4380 6085").closest("a")?.getAttribute("href"))
      .toBe("tel:+4917643806085");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/karte/page.test.tsx`
Expected: FAIL — cannot resolve `./page`.

- [ ] **Step 3: Write minimal implementation**

Create `src/app/karte/page.tsx`:

```tsx
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandWord } from "@/components/BrandWord";
import { KARTE } from "@/lib/karte";

export const metadata: Metadata = {
  title: "Visitenkarte: Ajdin Dzafic",
  robots: { index: false, follow: false },
};

export default function KartePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
      <div className="card-depth w-full rounded-3xl border border-faden bg-papier p-8 text-center">
        <Image
          src="/images/karte-portrait.webp"
          alt="Ajdin Dzafic"
          width={160}
          height={160}
          priority
          className="mx-auto rounded-full object-cover"
        />
        <h1 className="mt-6 text-2xl font-semibold text-tinte">{KARTE.fullName}</h1>
        <p className="mt-1 text-lg text-vrelo-petrol">
          <BrandWord>Vrelo</BrandWord>
        </p>
        <p className="mt-1 text-sm text-tinte/80">{KARTE.descriptor}</p>

        <div className="mt-6 space-y-2 text-sm">
          <a href={`mailto:${KARTE.email}`} className="block text-vrelo-petrol underline">
            {KARTE.email}
          </a>
          <a href={`tel:${KARTE.phone.replace(/\s+/g, "")}`} className="block text-vrelo-petrol underline">
            {KARTE.phone}
          </a>
        </div>

        <a
          href={KARTE.vcfPath}
          className="mt-8 inline-block w-full rounded-xl bg-vrelo-petrol px-6 py-3 font-semibold text-papier"
        >
          Kontakt speichern
        </a>

        <Link href="/" className="mt-4 block text-xs text-tinte/60 underline">
          Website ansehen
        </Link>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/karte/page.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/karte/page.tsx src/app/karte/page.test.tsx
git commit -m "feat(karte): branded contact card page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: The QR-only page `/karte/qr`

**Files:**
- Create: `src/app/karte/qr/page.tsx`
- Test: `src/app/karte/qr/page.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/karte/qr/page.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KarteQrPage, { metadata } from "./page";

describe("KarteQrPage", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("renders the QR image pointing at the committed SVG", () => {
    render(<KarteQrPage />);
    const img = screen.getByAltText(/QR-Code/);
    expect(img.getAttribute("src")).toBe("/karte-qr.svg");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/karte/qr/page.test.tsx`
Expected: FAIL — cannot resolve `./page`.

- [ ] **Step 3: Write minimal implementation**

Create `src/app/karte/qr/page.tsx`:

```tsx
import type { Metadata } from "next";
import { BrandWord } from "@/components/BrandWord";

export const metadata: Metadata = {
  title: "QR-Code: Visitenkarte",
  robots: { index: false, follow: false },
};

export default function KarteQrPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-papier px-6">
      {/* Static committed SVG; plain img avoids next/image SVG config. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/karte-qr.svg" alt="QR-Code zur Visitenkarte" className="w-64 max-w-[80vw]" />
      <p className="text-lg text-vrelo-petrol">
        <BrandWord>Vrelo</BrandWord>
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/app/karte/qr/page.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/karte/qr/page.tsx src/app/karte/qr/page.test.tsx
git commit -m "feat(karte): QR-only page /karte/qr

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Lock the routes out of the sitemap

`/karte`, `/karte/qr`, `/karte/kontakt.vcf` are already excluded because `sitemap.ts` lists routes explicitly and we never add them. This task adds a regression test so nobody adds them later by accident.

**Files:**
- Modify: `src/app/sitemap.test.ts`

- [ ] **Step 1: Extend the exclusion test**

In `src/app/sitemap.test.ts`, find the test `it("excludes the direct-link outreach pages", ...)` and add these assertions inside it, after the existing `expect(...).not.toContain(...)` lines:

```ts
    expect(urls).not.toContain(`${siteUrl}/karte`);
    expect(urls).not.toContain(`${siteUrl}/karte/qr`);
```

- [ ] **Step 2: Run the sitemap test**

Run: `npm test -- src/app/sitemap.test.ts`
Expected: PASS (all sitemap tests, including the extended exclusion test).

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.test.ts
git commit -m "test(karte): assert /karte routes stay out of the sitemap

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Brand byte-check, full test run, build

**Files:** none (verification only)

- [ ] **Step 1: Verify German copy bytes (no Gedankenstrich; „ü" intact)**

Titles were written colon-joined in Tasks 4–5 (no em-dash) on purpose. Confirm no
en/em dashes slipped into the new source files:

Run: `perl -CSD -ne 'print "$ARGV:$.: $_" if /\x{2013}|\x{2014}/' src/lib/karte.ts src/app/karte/page.tsx src/app/karte/qr/page.tsx`
Expected: no output (clean).

And confirm the `ü` survived as real UTF-8 in the builder + page:

Run: `grep -c "Automatisierung für Betriebe" src/lib/karte.ts`
Expected: `1`.

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all tests pass (existing suite + the new karte tests).

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds; the build output lists `/karte`, `/karte/qr`, and `/karte/kontakt.vcf` as routes.

- [ ] **Step 5: Final commit if the build produced any lockfile/cache changes**

Only if `git status` shows changes:

```bash
git add -A
git commit -m "chore(karte): finalize build

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Manual verification after deploy (post-merge, not a build step)

Push to `main` auto-deploys to Vercel. Then, from a phone:
1. Open `vrelo-ki.de/karte/qr`, hold it out, scan with a second phone → it opens `vrelo-ki.de/karte`.
2. On `/karte`, tap „Kontakt speichern" → the phone's Contacts app opens pre-filled with name, *Vrelo*, descriptor, email, phone, website, and the photo. Save it.
3. Tap the email and phone lines → mail composer / dialer open.
4. Confirm `vrelo-ki.de/karte` does not appear in `vrelo-ki.de/sitemap.xml`.

If the embedded photo ever misbehaves on an old iOS, the fallback is to drop the `PHOTO` line (call `buildVcard()` without the arg in the route) — the rest of the card still saves.
