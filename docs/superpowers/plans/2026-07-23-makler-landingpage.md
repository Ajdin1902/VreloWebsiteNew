# Makler-Landingpage `/makler` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/makler`, a `noindex` focus-mode outreach landing page that sells Die Termin-Quelle (lead) and the Document Concierge (second step) to independent Makler and Finanz-/Versicherungsmakler and closes on an embedded Cal booking.

**Architecture:** One new route under `src/app/makler/`, all copy in a typed module `src/lib/makler.ts`, section components under `src/components/makler/`. Site chrome is suppressed by a new `ChromeGate` client component in the root layout that returns `null` on routes listed in `focusRoutes` (`src/lib/nav.ts`); the page renders its own minimal header and footer. Two shared components gain one optional, backwards-compatible prop each.

**Tech Stack:** Next.js 16 App Router · TypeScript · Tailwind v4 (`@theme` tokens) · Vitest + React Testing Library (jsdom) · `@calcom/embed-react`.

**Spec:** `docs/superpowers/specs/2026-07-23-makler-landingpage-design.md`

## Global Constraints

- **German copy rules (Brand.md).** Quotes are `„…“` = U+201E / U+201C — **never** the ASCII straight quote. The Gedankenstrich is the **spaced en-dash** ` – ` (U+2013) — **never** the em-dash U+2014. Generic masculine (`Kunden`, `Kollegen`), first person („Ich“), `du`-Ansprache. No hype vocabulary (skalieren, KI-Magie, Game-Changer), no `!!!`.
- **Verify bytes after every write to a file containing German copy.** The Edit/Write tools silently downgrade the closing `“` to ASCII `"`. Audit and repair with:
  ```bash
  perl -CSD -ne 'while(/(["\x{2014}])/g){$c{$1}++} END{for(sort keys %c){printf "U+%04X %s\n", ord($_), $c{$_}}}' FILE
  perl -CSD -i -pe 's/\x{201E}([^\x{201E}"]*)"/\x{201E}$1\x{201C}/g; s/\x{2014}/\x{2013}/g' FILE
  ```
- **No prices anywhere on the page.** No `€` figure, no monthly rate, no ROI anchor. Price is revealed in the Angebot after Discovery.
- **No fabricated proof.** No testimonials, no invented client names, no numbers we cannot stand behind. The Document Concierge is **not built** — describe it as what gets built for the client, never as a running system he can look at today.
- **`Vrelo` and `Merak` always render through `<BrandWord>`** (Fraunces italic). `PageIntro`/`PageHero` auto-wrap via `withBrandWords`; anywhere else, wrap by hand. Never hand-roll the italic.
- **Palette discipline:** use `@theme` tokens only (`bg-papier`, `text-tiefes-wasser`, `bg-vrelo-petrol`, …). On petrol, body text is `gletscher`; **never `text-stein` on petrol** (4.2:1, fails AA). Amber on petrol is 3.8:1 — amber may only carry text ≥24px.
- **Every new German-copy file must pass the copy-guard test from Task 2.**
- Commit messages end with `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`.
- Branch: `feat/makler-landingpage` (already created, spec already committed).

## File Structure

| File | Responsibility |
|---|---|
| `src/lib/nav.ts` *(modify)* | Adds `focusRoutes` + `isFocusRoute()` beside the existing `navLinks`. |
| `src/components/ChromeGate.tsx` *(create)* | Client component; hides its children on focus routes. |
| `src/app/layout.tsx` *(modify)* | Wraps `<Header />` and `<Footer />` in `ChromeGate`. |
| `src/lib/makler.ts` *(create)* | **All** page copy, typed. Single source for the page's German text. |
| `src/lib/makler.test.ts` *(create)* | Copy guard: punctuation, no prices. |
| `src/components/makler/MaklerHeader.tsx` *(create)* | Logo + one CTA to `#termin`. No nav. |
| `src/components/makler/MaklerFooter.tsx` *(create)* | Impressum · Datenschutz · Kontakt. |
| `src/components/PageHero.tsx` *(modify)* | Optional `actions` slot below the lead. |
| `src/components/kontakt/SchedulerEmbed.tsx` *(modify)* | Optional `fallbackHint` prop. |
| `src/components/makler/TerminQuelleBlock.tsx` *(create)* | Product 1 panel + `/demo` invitation. |
| `src/components/makler/DocumentConciergeBlock.tsx` *(create)* | Product 2 + trust block + config-gated video slot. |
| `src/components/makler/ProblemSection.tsx` *(create)* | The two leaks. |
| `src/components/makler/WarumIch.tsx` *(create)* | Four differentiator cards. |
| `src/components/makler/Garantie.tsx` *(create)* | Risk reversal + Gründungs-Zusage. |
| `src/components/makler/Einwaende.tsx` *(create)* | `FaqItem` accordion. |
| `src/components/makler/TerminSection.tsx` *(create)* | `id="termin"` booking close. |
| `src/app/makler/page.tsx` *(create)* | Composition + `noindex` metadata. |
| `src/app/sitemap.test.ts` *(modify)* | Assert `/makler` is absent. |

---

### Task 1: Focus-route chrome suppression

**Files:**
- Modify: `src/lib/nav.ts`
- Create: `src/components/ChromeGate.tsx`
- Create: `src/components/ChromeGate.test.tsx`
- Create: `src/lib/nav.test.ts`
- Modify: `src/app/layout.tsx:48-52`

**Interfaces:**
- Consumes: nothing.
- Produces: `focusRoutes: string[]`, `isFocusRoute(pathname: string | null): boolean` from `@/lib/nav`; `<ChromeGate>{children}</ChromeGate>` from `@/components/ChromeGate`.

- [ ] **Step 1: Write the failing nav test**

Create `src/lib/nav.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { navLinks, focusRoutes, isFocusRoute } from "./nav";

describe("focus routes", () => {
  it("treats /makler as a focus route", () => {
    expect(focusRoutes).toContain("/makler");
    expect(isFocusRoute("/makler")).toBe(true);
  });

  it("never hides the chrome on a nav route", () => {
    for (const l of navLinks) {
      expect(isFocusRoute(l.href)).toBe(false);
    }
    expect(isFocusRoute("/")).toBe(false);
  });

  it("keeps full chrome on the other noindex pages", () => {
    // /lead-check and /demo deliberately keep the site header and footer.
    expect(isFocusRoute("/lead-check")).toBe(false);
    expect(isFocusRoute("/demo")).toBe(false);
  });

  it("falls back to showing the chrome when the pathname is unknown", () => {
    expect(isFocusRoute(null)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/nav.test.ts`
Expected: FAIL — `focusRoutes` is not exported from `./nav`.

- [ ] **Step 3: Implement in `src/lib/nav.ts`**

Append below the existing `navLinks` export:

```ts
// Focus routes render without the site header/footer: single-purpose outreach
// pages where every nav link is an exit before the CTA. They bring their own
// minimal chrome. /lead-check and /demo are NOT focus routes — they are
// noindex, but they still sit inside the normal site frame.
export const focusRoutes: string[] = ["/makler"];

// A null pathname (no router context) falls back to "show the chrome" — the
// safe, normal case.
export function isFocusRoute(pathname: string | null): boolean {
  return pathname !== null && focusRoutes.includes(pathname);
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/lib/nav.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing ChromeGate test**

Create `src/components/ChromeGate.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChromeGate } from "./ChromeGate";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("ChromeGate", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("renders its children on a normal route", () => {
    render(<ChromeGate><p>Kopfzeile</p></ChromeGate>);
    expect(screen.getByText("Kopfzeile")).toBeInTheDocument();
  });

  it("renders its children on /lead-check", () => {
    pathname.current = "/lead-check";
    render(<ChromeGate><p>Kopfzeile</p></ChromeGate>);
    expect(screen.getByText("Kopfzeile")).toBeInTheDocument();
  });

  it("renders nothing on a focus route", () => {
    pathname.current = "/makler";
    const { container } = render(<ChromeGate><p>Kopfzeile</p></ChromeGate>);
    expect(screen.queryByText("Kopfzeile")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
```

Note the `vi.hoisted` wrapper: a plain top-level `const` referenced inside a `vi.mock` factory throws `Cannot access '…' before initialization` under Vitest v4 (recorded gotcha).

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/components/ChromeGate.test.tsx`
Expected: FAIL — cannot resolve `./ChromeGate`.

- [ ] **Step 7: Implement `src/components/ChromeGate.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { isFocusRoute } from "@/lib/nav";

// Hides the site chrome on focus routes (single-purpose outreach landing pages).
// Header and Footer are Server Components and must be passed as CHILDREN, never
// as a prop — passing a component across the RSC boundary as a prop throws.
// usePathname() resolves during SSR of client components in the App Router, so
// the chrome is already absent in the server-rendered HTML: no flash, no CLS.
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isFocusRoute(pathname)) return null;
  return <>{children}</>;
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run src/components/ChromeGate.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 9: Wire it into the root layout**

In `src/app/layout.tsx`, add the import beside the existing ones:

```tsx
import { ChromeGate } from "@/components/ChromeGate";
```

Replace the body (currently lines 48-52):

```tsx
      <body className="flex min-h-screen flex-col">
        <ChromeGate>
          <Header />
        </ChromeGate>
        <main className="flex-1">{children}</main>
        <ChromeGate>
          <Footer />
        </ChromeGate>
      </body>
```

- [ ] **Step 10: Run the full suite to prove nothing regressed**

Run: `npm test`
Expected: PASS — every existing test still green.

- [ ] **Step 11: Commit**

```bash
git add src/lib/nav.ts src/lib/nav.test.ts src/components/ChromeGate.tsx src/components/ChromeGate.test.tsx src/app/layout.tsx
git commit -m "feat: suppress site chrome on focus routes via ChromeGate

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Copy module + copy guard

**Files:**
- Create: `src/lib/makler.ts`
- Create: `src/lib/makler.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: from `@/lib/makler` — the types `MaklerFlowStep`, `MaklerBullet`, `MaklerProduct`, `MaklerPage`, and the const `makler: MaklerPage`. Every later task reads its text from this object; no German copy is hard-coded in a component.

- [ ] **Step 1: Write the failing copy-guard test**

Create `src/lib/makler.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { makler } from "./makler";

// Walk the copy object and collect every string, so the guards below cover
// nested products, bullets and flow steps without listing them by hand.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const all = strings(makler);

describe("makler copy", () => {
  it("collects a substantial body of copy", () => {
    expect(all.length).toBeGreaterThan(40);
  });

  it("uses German quotes, never ASCII double quotes", () => {
    const bad = all.filter((s) => s.includes('"'));
    expect(bad).toEqual([]);
  });

  it("uses the en-dash, never the em-dash", () => {
    const bad = all.filter((s) => s.includes("—"));
    expect(bad).toEqual([]);
  });

  it("pairs every opening German quote with a closing one", () => {
    for (const s of all) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });

  it("never names a price", () => {
    const bad = all.filter((s) => /€|\bEUR\b|\d\s*(Euro|netto)\b/i.test(s));
    expect(bad).toEqual([]);
  });

  it("points the demo invitation at /demo and the CTA at the booking anchor", () => {
    expect(makler.terminQuelle.proof?.href).toBe("/demo");
    expect(makler.hero.cta.href).toBe("#termin");
  });

  it("ships the Document Concierge without a video until one is recorded", () => {
    expect(makler.documentConcierge.demoVideo).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/lib/makler.test.ts`
Expected: FAIL — cannot resolve `./makler`.

- [ ] **Step 3: Create `src/lib/makler.ts`**

Write the file exactly as below. It is long; it is the whole page's text.

```ts
// Public, price-free copy for the /makler outreach landing page — a focus-mode
// page sent by direct link to a scored lead (independent Makler and Finanz-/
// Versicherungsmakler). Sources of truth for the offers themselves (price,
// guarantee, rationale) live in HQ and must be changed there first:
//   ../../../Knowledge/Offers/Termin-Quelle.md
//   ../../../Knowledge/Strategy/Document_Concierge.md
// Rules: no prices, no invented numbers, no testimonials. German punctuation
// per Brand.md – „…“ (U+201E/U+201C) and the spaced en-dash „ – “ (U+2013).
// Guarded by makler.test.ts.

export type MaklerBullet = { title: string; body: string };
export type MaklerFlowStep = { title: string; body: string };

export type MaklerProduct = {
  eyebrow: string;
  name: string;
  promise: string;
  body: string;
  /** Short chips rendered as an arrow-separated mechanism row. */
  chips?: string[];
  /** Numbered flow cards (the Document Concierge's seven steps). */
  flow?: MaklerFlowStep[];
  solves?: MaklerBullet[];
  outcome?: string;
  /** The try-it-out invitation (Termin-Quelle → /demo). */
  proof?: { prompt: string; body: string; label: string; href: string };
  /** Set once the loop video exists; null renders the flow cards instead. */
  demoVideo: { slug: string; caption: string } | null;
  /** Honest note where a product is built-to-order rather than shippable software. */
  note?: string;
  trust?: { title: string; body: string };
};

export type MaklerPage = {
  hero: {
    title: string;
    lead: string;
    cta: { label: string; href: string };
    ctaNote: string;
  };
  problem: { title: string; intro: string; leaks: MaklerBullet[]; close: string };
  terminQuelle: MaklerProduct;
  bridge: { title: string; body: string };
  documentConcierge: MaklerProduct;
  warumIch: { title: string; intro: string; points: MaklerBullet[] };
  garantie: {
    title: string;
    intro: string;
    promises: MaklerBullet[];
    close: string;
    founding: { title: string; body: string };
  };
  einwaende: { title: string; items: { question: string; answer: string }[] };
  close: {
    title: string;
    body: string;
    fallbackHint: string;
    fallback: { prompt: string; label: string; href: string };
  };
};

export const makler: MaklerPage = {
  hero: {
    title: "Jede Anfrage, die wartet, ist ein Termin weniger.",
    lead: "Ich baue unabhängigen Maklern und Finanzberatern zwei Systeme: eines, das jede Anfrage in unter fünf Minuten beantwortet und in einen Termin verwandelt – und eines, das die Unterlagen deiner Kunden vollständig einsammelt, ohne dass du hinterhertelefonierst. Du lernst nichts, du wartest nichts, du bekommst das Ergebnis.",
    cta: { label: "Erstgespräch vereinbaren", href: "#termin" },
    ctaNote: "Kostenloses Erstgespräch – 30 Minuten, unverbindlich.",
  },

  problem: {
    title: "An zwei Stellen läuft dir die Zeit weg",
    intro:
      "Beides kennst du. Beides kostet dich Geld, ohne dass es je auf einer Rechnung auftaucht.",
    leaks: [
      {
        title: "Die Anfrage, die kalt wird",
        body: "Eine Anfrage kommt abends um halb zehn herein. Du siehst sie am nächsten Morgen zwischen zwei Terminen. Bis du antwortest, hat der Interessent längst drei weitere Berater angeschrieben – und spricht mit dem, der zuerst zurückgemeldet hat. Die Anfrage war da. Der Abschluss nicht.",
      },
      {
        title: "Die Unterlagen, denen du hinterhertelefonierst",
        body: "Gehaltsabrechnung, Kontoauszüge, Steuerbescheid, SCHUFA, Ausweis. Du fragst einmal. Du fragst nach einer Woche noch einmal. Dann kommt das Foto vom Küchentisch, schief und halb abgeschnitten. Der Fall zieht sich um Wochen – nicht weil etwas schwierig wäre, sondern weil du Bote und Mahnung in einer Person bist.",
      },
    ],
    close: "Für beides gibt es bei mir ein System. Das erste ist der Anfang.",
  },

  terminQuelle: {
    eyebrow: "Schritt eins",
    name: "Die Termin-Quelle",
    promise: "Aus jeder Anfrage wird ein Termin – von selbst, während du arbeitest.",
    body: "Jede Anfrage bekommt in unter fünf Minuten eine persönliche Antwort. Rund um die Uhr, auch nachts und am Wochenende. Das System stellt zwei, drei ruhige Rückfragen, bietet freie Zeiten aus deinem Kalender an, bucht den Termin und fasst nach, wenn jemand still bleibt. Gebaut auf deine Anfragequellen, deinen Ton, deinen Kalender – kein Baukasten von der Stange.",
    chips: ["Antwort in unter 5 Minuten", "Qualifizieren", "Termin buchen", "Nachfassen", "Protokoll"],
    solves: [
      {
        title: "Antwortet, wenn du schläfst",
        body: "Die meisten Anfragen kommen abends und am Wochenende. Genau dann ist die Termin-Quelle wach.",
      },
      {
        title: "Fragt nach, bevor du Zeit investierst",
        body: "Zwei bis drei Rückfragen klären die Eckdaten. Du gehst nur noch in Gespräche, die passen können.",
      },
      {
        title: "Beendet das Termin-Pingpong",
        body: "Der passende Termin landet direkt in deinem Kalender. Kein Hin und Her über fünf Mails.",
      },
      {
        title: "Bleibt dran, ohne zu nerven",
        body: "Meldet sich jemand nicht, fragt das System höflich nach. Die meisten Kontakte brauchen mehrere Anläufe – die übernimmt es für dich.",
      },
    ],
    outcome:
      "Mehr Termine aus den Anfragen, die du ohnehin schon hast. Und ein ruhiger Kopf, weil keine mehr liegen bleibt.",
    proof: {
      prompt: "Glaub mir das nicht – probier es aus.",
      body: "Du beschreibst kurz dein Geschäft und schreibst dem System dann als dein eigener Interessent. Zwei Minuten, kein Login, nichts wird gespeichert.",
      label: "Spiel deinen eigenen Kunden",
      href: "/demo",
    },
    demoVideo: null,
  },

  bridge: {
    title: "Der Termin steht. Und dann?",
    body: "Dann beginnt der Teil, der wirklich Wochen frisst: die Unterlagen. Dafür baue ich das zweite System.",
  },

  documentConcierge: {
    eyebrow: "Schritt zwei",
    name: "Der Document Concierge",
    promise: "Du fragst nie wieder nach einer Unterlage.",
    body: "Du legst einen Fall in einem 20-Sekunden-Formular an – Name, Kontakt, Art des Falls. Ab da übernimmt das System: Es schickt deinem Kunden eine ruhige Checkliste mit einem einzigen sicheren Upload-Link, prüft jede hochgeladene Datei darauf, ob sie plausibel das richtige und lesbare Dokument ist, und schickt offensichtlich falsche oder unscharfe Uploads freundlich zurück – bevor sie bei dir landen. Was fehlt, fragt es in ruhigem Abstand nach. Bleibt ein Kunde stecken, hört es auf und sagt dir Bescheid, statt ins Leere zu mahnen.",
    flow: [
      { title: "Fall anlegen", body: "20 Sekunden: Name, Kontakt, Art des Falls. Mehr machst du nicht." },
      { title: "Checkliste raus", body: "Dein Kunde bekommt sie auf seinem Kanal, mit einem sicheren Upload-Link." },
      { title: "Hochladen ohne Login", body: "Eine Seite, ein Tipp aufs Handy. Keine Registrierung, kein Passwort." },
      { title: "Sofort geprüft", body: "Falsches oder unlesbares Dokument? Geht freundlich zurück, bevor du es überhaupt siehst." },
      { title: "Ruhig nachgefasst", body: "Nur was noch fehlt, in ruhigem Abstand. Höflich und beharrlich." },
      { title: "Abgelegt bei dir", body: "Jede Datei benannt und sortiert in deinem eigenen Cloud-Ordner." },
      { title: "Eine Meldung an dich", body: "Alle sieben da – oder: es fehlt noch der Kontoauszug. Du musst nichts öffnen." },
    ],
    outcome:
      "Vollständige, geprüfte Akten in deiner eigenen Cloud – und kein einziges Telefonat, in dem du um eine Gehaltsabrechnung bittest.",
    trust: {
      title: "Wo die Unterlagen liegen",
      body: "Die Dokumente deiner Kunden landen in deiner eigenen Cloud, nicht bei mir. Mein System ist der Bote, nicht der Tresor: Eine Datei berührt meine Seite nur auf dem Weg zu dir und wird danach gelöscht. Gehostet in der EU, verschlüsselt übertragen, mit Auftragsverarbeitungsvertrag. Bei Gehaltsabrechnungen und SCHUFA-Auskünften ist das keine Formalie, sondern die Grundbedingung.",
    },
    note: "Den Document Concierge baue ich für dich – nach deinen Fallarten, deinen Checklisten, deiner Cloud. Es gibt ihn nicht als fertige Software zum Anklicken. Deshalb siehst du hier den Ablauf; alles Weitere zeige ich dir im Gespräch.",
    demoVideo: null,
  },

  warumIch: {
    title: "Warum ich",
    intro:
      "Zwei Systeme, ein Verantwortlicher. Was das im Alltag für dich bedeutet:",
    points: [
      {
        title: "Ein Ansprechpartner",
        body: "Du sprichst mit dem, der baut. Keine Agentur-Kette, kein Ticket-System, keine Übergabe an jemanden, den du nie kennengelernt hast.",
      },
      {
        title: "Maßgeschneidert, nicht von der Stange",
        body: "Ich baue auf deine Anfragequellen, deinen Ton, deinen Kalender, deine Fallarten. Ein Baukasten würde dich zwingen, dich anzupassen. Hier ist es umgekehrt.",
      },
      {
        title: "Klartext statt Technik-Deutsch",
        body: "Ich erkläre dir, was das System tut, in Sätzen, die du deinem Steuerberater weitererzählen könntest.",
      },
      {
        title: "Du lernst und wartest nichts",
        body: "Kein neues Werkzeug auf deinem Schreibtisch. Das System läuft im Hintergrund, ich halte es am Laufen. Du bekommst Termine und vollständige Akten.",
      },
    ],
  },

  garantie: {
    title: "Ich gehe in Vorleistung, nicht du.",
    intro: "Du zahlst nicht im Voraus für etwas, das noch nicht läuft. Die Absicherung sitzt an drei Stellen:",
    promises: [
      {
        title: "Du zahlst die Schlussrechnung erst nach deiner eigenen Abnahme.",
        body: "Das System muss in deinem Test sauber laufen: jede Testanfrage beantwortet, qualifiziert, als Termin gebucht. Läuft es nicht wie zugesagt, baue ich nach.",
      },
      {
        title: "Jede Anfrage bekommt in unter fünf Minuten eine Antwort.",
        body: "Rund um die Uhr. Darauf gebe ich mein Wort. Nicht auf dein Anfrage-Volumen – das bestimmt dein Markt, nicht ich.",
      },
      {
        title: "Der erste Monat Betrieb geht auf mich.",
        body: "Überzeugt dich das System im ersten Monat laufenden Betriebs nicht, kündigst du und bekommst diesen Monat erstattet.",
      },
    ],
    close:
      "Ich sichere zu, was ich in der Hand habe: Funktion, Reaktionszeit, sauberer Betrieb.",
    founding: {
      title: "Meine ersten drei Kunden",
      body: "Für meine ersten drei Kunden gebe ich eine zusätzliche Zusage: Hält die Termin-Quelle die Fünf-Minuten-Antwort in einem Monat einmal nicht ein, ist dieser Monat für dich kostenlos. Ich sage das einmal, ohne Countdown – es ist schlicht der Stand.",
    },
  },

  einwaende: {
    title: "Was du dich jetzt fragst",
    items: [
      {
        question: "Ich habe doch schon ein Kontaktformular und einen Kalender-Link.",
        answer:
          "Das Formular sammelt eine Anfrage – reagieren, qualifizieren und nachfassen musst du weiter selbst, und zwar rechtzeitig. Genau da geht das Geld verloren: Die meisten Anfragen kommen abends oder am Wochenende, und bis du am Schreibtisch bist, ist der Interessent oft schon woanders. Der Kalender-Link hilft nur dem, der ohnehin buchen will. Die Termin-Quelle schließt die Lücke dazwischen.",
      },
      {
        question: "Ich bin kein Technik-Mensch.",
        answer:
          "Du lernst und wartest nichts. Ich baue und betreibe alles; du bekommst die fertigen Termine und die vollständigen Akten. Wenn du eine Änderung willst, schreibst du mir einen Satz.",
      },
      {
        question: "Meine Anfragen sind zu individuell für einen Bot.",
        answer:
          "Das System ersetzt dich nicht. Es nimmt den immer gleichen ersten Schritt ab und reicht dir den qualifizierten Termin. Die Beratung und den Abschluss machst weiter du.",
      },
      {
        question: "Klingt das nicht wie ein Roboter?",
        answer:
          "Der Ton wird auf dich abgestimmt, und du gibst die Antworten vor der Inbetriebnahme frei. Es klingt nach dir. Dass ein digitaler Assistent antwortet, wird dabei offen gesagt – verstecken wäre der schlechtere Weg.",
      },
      {
        question: "Was ist mit den Daten meiner Kunden?",
        answer:
          "Alles läuft EU-gehostet und DSGVO-konform, mit Auftragsverarbeitungsvertrag. Beim Document Concierge liegen die Dokumente in deiner eigenen Cloud – meine Seite ist nur der Weg dorthin und löscht danach.",
      },
      {
        question: "Wird das ein großes, riskantes Projekt?",
        answer:
          "Nein. Der erste Schritt ist ein Gespräch, danach ein Angebot mit klarem Umfang. Gebaut wird in Wochen, nicht in Quartalen, und die Schlussrechnung zahlst du erst nach deiner Abnahme.",
      },
    ],
  },

  close: {
    title: "Lass uns 30 Minuten sprechen",
    body: "Im Erstgespräch schauen wir uns an, wo bei dir die Anfragen hereinkommen und wo die Zeit wirklich hängt. Danach weißt du, was ich bauen würde, wie lange es dauert und was es kostet. Passt es nicht, sage ich dir das.",
    fallbackHint: "Schreib mir so lange einfach über das Kontaktformular.",
    fallback: { prompt: "Lieber schreiben?", label: "Zum Kontaktformular", href: "/kontakt" },
  },
};
```

- [ ] **Step 4: Repair the German punctuation bytes**

The Write tool downgrades `“` to ASCII `"`. Audit, repair, re-audit:

```bash
cd Website
perl -CSD -ne 'while(/(["\x{2014}])/g){$c{$1}++} END{for(sort keys %c){printf "U+%04X %s\n", ord($_), $c{$_}}}' src/lib/makler.ts
perl -CSD -i -pe 's/\x{201E}([^\x{201E}"]*)"/\x{201E}$1\x{201C}/g; s/\x{2014}/\x{2013}/g' src/lib/makler.ts
```

Expected after repair: the only ASCII `"` left are TypeScript string delimiters. The Task 2 test proves it — a downgraded quote inside a value fails `uses German quotes, never ASCII double quotes`.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/lib/makler.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/lib/makler.ts src/lib/makler.test.ts
git commit -m "feat: typed copy module for the /makler landing page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Focus chrome — MaklerHeader and MaklerFooter

**Files:**
- Create: `src/components/makler/MaklerHeader.tsx`
- Create: `src/components/makler/MaklerHeader.test.tsx`
- Create: `src/components/makler/MaklerFooter.tsx`
- Create: `src/components/makler/MaklerFooter.test.tsx`

**Interfaces:**
- Consumes: `makler` from `@/lib/makler` (Task 2); `BrandLockup`, `CTAButton` (existing).
- Produces: `<MaklerHeader />` and `<MaklerFooter />` — no props, rendered by `src/app/makler/page.tsx` in Task 7.

- [ ] **Step 1: Write the failing header test**

Create `src/components/makler/MaklerHeader.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaklerHeader } from "./MaklerHeader";
import { navLinks } from "@/lib/nav";

describe("MaklerHeader", () => {
  it("shows the brand lockup linked to the homepage", () => {
    render(<MaklerHeader />);
    expect(screen.getByRole("link", { name: /startseite/i })).toHaveAttribute("href", "/");
  });

  it("carries a CTA pointing at the booking section on the page", () => {
    render(<MaklerHeader />);
    const cta = screen.getByRole("link", { name: "Erstgespräch vereinbaren" });
    expect(cta).toHaveAttribute("href", "#termin");
  });

  it("has no site navigation — the page has one job", () => {
    render(<MaklerHeader />);
    for (const l of navLinks) {
      expect(screen.queryByRole("link", { name: l.label })).not.toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/makler/MaklerHeader.test.tsx`
Expected: FAIL — cannot resolve `./MaklerHeader`.

- [ ] **Step 3: Implement `src/components/makler/MaklerHeader.tsx`**

```tsx
import Link from "next/link";
import { BrandLockup } from "@/components/BrandLockup";
import { CTAButton } from "@/components/CTAButton";
import { makler } from "@/lib/makler";

// Focus-mode chrome: logo and one CTA, no navigation. Every nav link on a
// single-purpose outreach page is an exit before the close, so the only way
// out of this page is the booking section (or the legal links in the footer).
// Rendered by the page itself, not a layout — it can never leak elsewhere.
export function MaklerHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-faden bg-papier/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Vrelo – Startseite"
          className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
        >
          <BrandLockup variant="navy" />
        </Link>
        <CTAButton href={makler.hero.cta.href}>{makler.hero.cta.label}</CTAButton>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/makler/MaklerHeader.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing footer test**

Create `src/components/makler/MaklerFooter.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaklerFooter } from "./MaklerFooter";

describe("MaklerFooter", () => {
  it("keeps the legally required links reachable", () => {
    render(<MaklerFooter />);
    expect(screen.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/impressum");
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz");
  });

  it("offers a written route as well as the booking", () => {
    render(<MaklerFooter />);
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "/kontakt");
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/components/makler/MaklerFooter.test.tsx`
Expected: FAIL — cannot resolve `./MaklerFooter`.

- [ ] **Step 7: Implement `src/components/makler/MaklerFooter.tsx`**

```tsx
import Link from "next/link";
import { BrandWord } from "@/components/BrandWord";

const linkClass =
  "rounded-sm text-stein transition-colors hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig";

// Minimal focus-mode footer: legal reachability is not optional, the rest is.
// stein on tiefes-wasser is 7.5:1 — the only surface where stein clears AA.
export function MaklerFooter() {
  return (
    <footer className="bg-tiefes-wasser text-gletscher">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-stein md:flex-row md:items-center md:justify-between">
        <p className="text-base">
          <BrandWord>Vrelo</BrandWord> errichtet die Quelle. Du erlebst den{" "}
          <BrandWord>Merak</BrandWord>-Effekt.
        </p>
        <div className="flex gap-4">
          <Link href="/impressum" className={linkClass}>
            Impressum
          </Link>
          <Link href="/datenschutz" className={linkClass}>
            Datenschutz
          </Link>
          <Link href="/kontakt" className={linkClass}>
            Kontakt
          </Link>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run src/components/makler/MaklerFooter.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/makler
git commit -m "feat: focus-mode header and footer for /makler

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Two backwards-compatible props on shared components

**Files:**
- Modify: `src/components/PageHero.tsx:11-21` (props) and the lead `Section` at the end of the file
- Modify: `src/components/kontakt/SchedulerEmbed.tsx:16-26`
- Create: `src/components/PageHero.test.tsx`
- Modify: `src/components/kontakt/SchedulerEmbed.test.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: `PageHero` accepts optional `actions?: ReactNode`, rendered below the lead. `SchedulerEmbed` accepts optional `fallbackHint?: string`, replacing the default not-configured second line.

Both props are optional with the current behaviour as the default, so `/kontakt`, `/faq`, `/leistungen`, `/ueber-mich` and `/ratgeber` are untouched.

- [ ] **Step 1: Write the failing PageHero test**

Create `src/components/PageHero.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHero } from "./PageHero";

describe("PageHero", () => {
  it("renders the title as the page H1 and the lead below it", () => {
    render(<PageHero title="Titel" lead="Der Vorspann." src="/images/x.webp" />);
    expect(screen.getByRole("heading", { level: 1, name: "Titel" })).toBeInTheDocument();
    expect(screen.getByText("Der Vorspann.")).toBeInTheDocument();
  });

  it("renders nothing extra when no actions are passed", () => {
    render(<PageHero title="Titel" lead="Der Vorspann." src="/images/x.webp" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders an optional actions slot below the lead", () => {
    render(
      <PageHero
        title="Titel"
        lead="Der Vorspann."
        src="/images/x.webp"
        actions={<a href="#termin">Erstgespräch vereinbaren</a>}
      />,
    );
    expect(screen.getByRole("link", { name: "Erstgespräch vereinbaren" })).toHaveAttribute(
      "href",
      "#termin",
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/PageHero.test.tsx`
Expected: FAIL on the third case — the actions link is not rendered. (The first two pass already.)

- [ ] **Step 3: Add the `actions` slot to `src/components/PageHero.tsx`**

Add `ReactNode` to the imports:

```tsx
import type { ReactNode } from "react";
```

Extend the props:

```tsx
export function PageHero({
  title,
  lead,
  src,
  priority = true,
  actions,
}: {
  title: string;
  lead: string;
  src: string;
  priority?: boolean;
  /** Optional CTA row rendered under the lead (focus-mode landing pages). */
  actions?: ReactNode;
}) {
```

Replace the closing `Section` block with:

```tsx
      <Section tone="paper">
        <p className="max-w-2xl text-pretty font-serif text-xl leading-[1.5] text-tiefes-wasser md:text-[1.6rem] first-letter:float-left first-letter:pr-2 first-letter:pt-1 first-letter:text-[2.8em] first-letter:font-medium first-letter:leading-[0.7] first-letter:text-vrelo-petrol">
          {withBrandWords(lead)}
        </p>
        {actions ? <div className="mt-8">{actions}</div> : null}
      </Section>
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/PageHero.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Write the failing SchedulerEmbed test**

Append to `src/components/kontakt/SchedulerEmbed.test.tsx` inside the existing `describe`:

```tsx
  it("keeps the Kontakt wording when no hint is passed", () => {
    render(<SchedulerEmbed calLink={undefined} />);
    expect(screen.getByText(/über das Formular unten/i)).toBeInTheDocument();
  });

  it("lets a page override the not-configured hint", () => {
    render(<SchedulerEmbed calLink={undefined} fallbackHint="Schreib mir über das Kontaktformular." />);
    expect(screen.getByText("Schreib mir über das Kontaktformular.")).toBeInTheDocument();
    expect(screen.queryByText(/über das Formular unten/i)).not.toBeInTheDocument();
  });
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/components/kontakt/SchedulerEmbed.test.tsx`
Expected: FAIL on the override case — the default text still renders.

- [ ] **Step 7: Add `fallbackHint` to `src/components/kontakt/SchedulerEmbed.tsx`**

Replace the signature and the not-configured branch:

```tsx
export function SchedulerEmbed({
  calLink,
  fallbackHint = "Schreib mir so lange einfach über das Formular unten.",
}: {
  calLink: string | undefined;
  /** Where to send the visitor when no scheduler is configured. Defaults to the
      Kontakt page wording, where a form does sit below the embed. */
  fallbackHint?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!calLink) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="font-serif text-xl text-papier md:text-2xl">Online-Terminbuchung folgt in Kürze.</p>
        <p className="mt-2 text-gletscher">{fallbackHint}</p>
      </div>
    );
  }
```

Leave the rest of the file unchanged.

- [ ] **Step 8: Run the full suite**

Run: `npm test`
Expected: PASS — including the untouched `/kontakt` tests.

- [ ] **Step 9: Commit**

```bash
git add src/components/PageHero.tsx src/components/PageHero.test.tsx src/components/kontakt/SchedulerEmbed.tsx src/components/kontakt/SchedulerEmbed.test.tsx
git commit -m "feat: optional actions slot on PageHero, fallbackHint on SchedulerEmbed

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Product blocks — Termin-Quelle and Document Concierge

**Files:**
- Create: `src/components/makler/TerminQuelleBlock.tsx`
- Create: `src/components/makler/TerminQuelleBlock.test.tsx`
- Create: `src/components/makler/DocumentConciergeBlock.tsx`
- Create: `src/components/makler/DocumentConciergeBlock.test.tsx`

**Interfaces:**
- Consumes: `MaklerProduct` and `makler` from `@/lib/makler` (Task 2); `Section`, `CTAButton`, `LazyVideo`, `BrandWord` (existing).
- Produces: `<TerminQuelleBlock />` (no props, reads `makler.terminQuelle`) and `<DocumentConciergeBlock product={…} />` — the DC block takes its product as a **prop** so the video-slot branch is testable both ways without touching the live module.

- [ ] **Step 1: Write the failing Termin-Quelle test**

Create `src/components/makler/TerminQuelleBlock.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminQuelleBlock } from "./TerminQuelleBlock";
import { makler } from "@/lib/makler";

describe("TerminQuelleBlock", () => {
  it("names the product as a section heading", () => {
    render(<TerminQuelleBlock />);
    expect(screen.getByRole("heading", { level: 2, name: /Termin-Quelle/ })).toBeInTheDocument();
  });

  it("shows the mechanism as an ordered list of steps", () => {
    render(<TerminQuelleBlock />);
    const list = screen.getByRole("list", { name: "Ablauf" });
    expect(list.querySelectorAll("li")).toHaveLength(makler.terminQuelle.chips!.length);
  });

  it("invites the visitor into the live demo", () => {
    render(<TerminQuelleBlock />);
    const demo = screen.getByRole("link", { name: makler.terminQuelle.proof!.label });
    expect(demo).toHaveAttribute("href", "/demo");
  });

  it("never shows a price", () => {
    const { container } = render(<TerminQuelleBlock />);
    expect(container.textContent).not.toMatch(/€/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/makler/TerminQuelleBlock.test.tsx`
Expected: FAIL — cannot resolve `./TerminQuelleBlock`.

- [ ] **Step 3: Implement `src/components/makler/TerminQuelleBlock.tsx`**

```tsx
import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// Product 1, on a deep-petrol panel so it reads as THE offer (the /leistungen
// flagship treatment). On-dark AA: amber on petrol is ~3.8:1, so amber carries
// only the large serif promise (>=24px = large-text AA); the small eyebrow is a
// navy-on-amber badge (6.8:1) and all body copy is gletscher (7:1).
export function TerminQuelleBlock() {
  const p = makler.terminQuelle;
  return (
    <Section tone="paper">
      <Reveal className="shadow-deepwater mx-auto max-w-3xl rounded-3xl bg-vrelo-petrol p-8 ring-1 ring-amber/40 md:p-12">
        <span className="inline-block rounded-full bg-amber px-3 py-1 text-xs font-semibold uppercase tracking-wide text-tiefes-wasser">
          {p.eyebrow}
        </span>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {p.name}
        </h2>
        <p className="mt-3 text-pretty font-serif text-2xl italic text-amber md:text-3xl">
          {p.promise}
        </p>
        <p className="mt-6 max-w-2xl text-pretty leading-relaxed text-gletscher">{p.body}</p>

        <ol aria-label="Ablauf" className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
          {p.chips!.map((step, i) => (
            <li key={step} className="flex items-center gap-2">
              <span className="rounded-full border border-gletscher/25 bg-gletscher/10 px-3 py-1 text-sm font-medium text-gletscher">
                {step}
              </span>
              {i < p.chips!.length - 1 && (
                <span aria-hidden="true" className="text-amber">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>

        <dl className="mt-10 grid gap-6 sm:grid-cols-2">
          {p.solves!.map((s) => (
            <div key={s.title}>
              <dt className="font-semibold text-papier">{s.title}</dt>
              <dd className="mt-1 text-pretty leading-relaxed text-gletscher">{s.body}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-10 max-w-2xl text-pretty text-lg font-medium text-papier">{p.outcome}</p>

        <div className="mt-8 rounded-2xl border border-gletscher/20 bg-gletscher/5 p-6">
          <p className="font-serif text-xl text-papier">{p.proof!.prompt}</p>
          <p className="mt-2 text-pretty text-gletscher">{p.proof!.body}</p>
          <Link
            href={p.proof!.href}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
          >
            {p.proof!.label}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/makler/TerminQuelleBlock.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the failing Document Concierge test**

Create `src/components/makler/DocumentConciergeBlock.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentConciergeBlock } from "./DocumentConciergeBlock";
import { makler, type MaklerProduct } from "@/lib/makler";

describe("DocumentConciergeBlock", () => {
  it("names the product and states where the documents live", () => {
    render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    expect(screen.getByRole("heading", { level: 2, name: /Document Concierge/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: makler.documentConcierge.trust!.title })).toBeInTheDocument();
  });

  it("renders the flow as numbered cards while no video exists", () => {
    render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    const list = screen.getByRole("list", { name: "Ablauf" });
    expect(list.querySelectorAll("li")).toHaveLength(makler.documentConcierge.flow!.length);
    expect(document.querySelector("video")).toBeNull();
  });

  it("is honest that the product is built to order, not clickable software", () => {
    render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    expect(screen.getByText(makler.documentConcierge.note!)).toBeInTheDocument();
  });

  it("swaps in the loop video once one is configured", () => {
    const withVideo: MaklerProduct = {
      ...makler.documentConcierge,
      demoVideo: { slug: "document-concierge", caption: "Der Ablauf in 30 Sekunden." },
    };
    render(<DocumentConciergeBlock product={withVideo} />);
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("poster")).toBe("/video/document-concierge-poster.jpg");
    expect(screen.getByText("Der Ablauf in 30 Sekunden.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

Run: `npx vitest run src/components/makler/DocumentConciergeBlock.test.tsx`
Expected: FAIL — cannot resolve `./DocumentConciergeBlock`.

- [ ] **Step 7: Implement `src/components/makler/DocumentConciergeBlock.tsx`**

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { LazyVideo } from "@/components/LazyVideo";
import type { MaklerProduct } from "@/lib/makler";

// Product 2, on paper — the page runs cool (petrol product 1) to warm here.
// The proof slot is config-gated exactly like the Cal/Newsletter "not yet
// configured" pattern: no video recorded -> the seven flow cards carry it. The
// derivative paths follow scripts/optimize-videos.mjs (mp4/webm + -poster.jpg).
export function DocumentConciergeBlock({ product }: { product: MaklerProduct }) {
  const p = product;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wide text-stumm">{p.eyebrow}</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
            {p.name}
          </h2>
          <p className="mt-3 text-pretty font-serif text-2xl italic text-vrelo-petrol md:text-3xl">
            {p.promise}
          </p>
          <p className="mt-6 text-pretty leading-relaxed text-tinte">{p.body}</p>
        </Reveal>

        {p.demoVideo ? (
          <Reveal className="mt-10">
            <LazyVideo
              mp4={`/video/${p.demoVideo.slug}.mp4`}
              webm={`/video/${p.demoVideo.slug}.webm`}
              poster={`/video/${p.demoVideo.slug}-poster.jpg`}
              aspect="aspect-video"
              className="card-depth w-full rounded-2xl object-cover"
            />
            <p className="mt-3 text-sm text-stumm">{p.demoVideo.caption}</p>
          </Reveal>
        ) : (
          <Reveal>
            <ol aria-label="Ablauf" className="mt-10 grid gap-4 sm:grid-cols-2">
              {p.flow!.map((s, i) => (
                <li key={s.title} className="card-depth rounded-2xl bg-papier p-5">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-vrelo-petrol text-sm font-semibold text-papier"
                  >
                    {i + 1}
                  </span>
                  <p className="mt-3 font-semibold text-tiefes-wasser">{s.title}</p>
                  <p className="mt-1 text-pretty leading-relaxed text-tinte">{s.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        <Reveal>
          <p className="mt-10 text-pretty text-lg font-medium text-tiefes-wasser">{p.outcome}</p>
        </Reveal>

        <Reveal className="card-depth mt-10 rounded-2xl bg-gletscher/40 p-6 md:p-8">
          <h3 className="font-semibold text-tiefes-wasser">{p.trust!.title}</h3>
          <p className="mt-2 text-pretty leading-relaxed text-tinte">{p.trust!.body}</p>
        </Reveal>

        <p className="mt-6 text-pretty text-sm italic text-stumm">{p.note}</p>
      </div>
    </Section>
  );
}
```

- [ ] **Step 8: Run it to verify it passes**

Run: `npx vitest run src/components/makler/DocumentConciergeBlock.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 9: Commit**

```bash
git add src/components/makler
git commit -m "feat: Termin-Quelle and Document Concierge blocks for /makler

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Supporting sections — problem, bridge, differentiators, guarantee, objections, close

**Files:**
- Create: `src/components/makler/ProblemSection.tsx`
- Create: `src/components/makler/Bridge.tsx`
- Create: `src/components/makler/WarumIch.tsx`
- Create: `src/components/makler/Garantie.tsx`
- Create: `src/components/makler/Einwaende.tsx`
- Create: `src/components/makler/TerminSection.tsx`
- Create: `src/components/makler/sections.test.tsx`

**Interfaces:**
- Consumes: `makler` from `@/lib/makler`; `Section`, `Reveal`, `WaterSection`, `FaqItem`, `SchedulerEmbed`, `calLink` (existing).
- Produces: `<ProblemSection />`, `<Bridge />`, `<WarumIch />`, `<Garantie />`, `<Einwaende />` (all prop-less) and `<TerminSection calLink={string | undefined} />`.

- [ ] **Step 1: Write the failing sections test**

Create `src/components/makler/sections.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProblemSection } from "./ProblemSection";
import { Bridge } from "./Bridge";
import { WarumIch } from "./WarumIch";
import { Garantie } from "./Garantie";
import { Einwaende } from "./Einwaende";
import { TerminSection } from "./TerminSection";
import { makler } from "@/lib/makler";

describe("ProblemSection", () => {
  it("names both leaks before either product is introduced", () => {
    render(<ProblemSection />);
    for (const leak of makler.problem.leaks) {
      expect(screen.getByRole("heading", { level: 3, name: leak.title })).toBeInTheDocument();
    }
  });
});

describe("Bridge", () => {
  it("frames the second product as the next step", () => {
    render(<Bridge />);
    expect(screen.getByRole("heading", { level: 2, name: makler.bridge.title })).toBeInTheDocument();
  });
});

describe("WarumIch", () => {
  it("lists every differentiator", () => {
    render(<WarumIch />);
    for (const p of makler.warumIch.points) {
      expect(screen.getByRole("heading", { level: 3, name: p.title })).toBeInTheDocument();
    }
  });
});

describe("Garantie", () => {
  it("states all three promises and the founding note", () => {
    render(<Garantie />);
    for (const p of makler.garantie.promises) {
      expect(screen.getByRole("heading", { level: 3, name: p.title })).toBeInTheDocument();
    }
    expect(screen.getByText(makler.garantie.founding.body)).toBeInTheDocument();
  });
});

describe("Einwaende", () => {
  it("renders every objection as a disclosure", () => {
    const { container } = render(<Einwaende />);
    expect(container.querySelectorAll("details")).toHaveLength(makler.einwaende.items.length);
  });
});

describe("TerminSection", () => {
  it("carries the anchor the header CTA points at", () => {
    const { container } = render(<TerminSection calLink={undefined} />);
    expect(container.querySelector("#termin")).not.toBeNull();
  });

  it("offers the written route when no scheduler is configured", () => {
    render(<TerminSection calLink={undefined} />);
    expect(screen.getByText(makler.close.fallbackHint)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: makler.close.fallback.label })).toHaveAttribute(
      "href",
      "/kontakt",
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/makler/sections.test.tsx`
Expected: FAIL — cannot resolve `./ProblemSection`.

- [ ] **Step 3: Implement `src/components/makler/ProblemSection.tsx`**

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// The two leaks, in his day rather than our tech — establishes the need for
// both products before either is named. Heading and intro centre on the page
// spine; the leak bodies stay left-aligned (centred body copy hurts scanning).
export function ProblemSection() {
  const p = makler.problem;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {p.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{p.intro}</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        {p.leaks.map((leak, i) => (
          <Reveal key={leak.title} delayMs={i * 80} className="card-depth rounded-2xl bg-papier p-6 md:p-8">
            <h3 className="font-serif text-xl text-vrelo-petrol md:text-2xl">{leak.title}</h3>
            <p className="mt-3 text-pretty leading-relaxed text-tinte">{leak.body}</p>
          </Reveal>
        ))}
      </div>
      <p className="mx-auto mt-10 max-w-[44rem] text-center text-lg font-medium text-tiefes-wasser">
        {p.close}
      </p>
    </Section>
  );
}
```

- [ ] **Step 4: Implement `src/components/makler/Bridge.tsx`**

```tsx
import { makler } from "@/lib/makler";

// One sentence between the two products, so product 2 reads as the next step
// rather than a second option. A beat, not a section — so it does NOT use
// `Section` (whose inner wrapper is hard-coded to py-24/py-32; overriding that
// with an arbitrary child variant is a specificity coin-flip). Plain markup
// with its own tighter padding is honest and certain.
export function Bridge() {
  const b = makler.bridge;
  return (
    <section className="bg-papier text-tinte">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 className="text-balance font-serif text-2xl italic text-vrelo-petrol md:text-3xl">
            {b.title}
          </h2>
          <p className="mt-3 text-pretty text-lg text-tinte">{b.body}</p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement `src/components/makler/WarumIch.tsx`**

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// The differentiators — deliberately no testimonials and no client logos: there
// are none we can show yet, and inventing them would break the whole posture.
export function WarumIch() {
  const w = makler.warumIch;
  return (
    <Section tint>
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {w.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{w.intro}</p>
      </div>
      <dl className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
        {w.points.map((p, i) => (
          <Reveal key={p.title} delayMs={i * 60} className="card-depth rounded-2xl bg-papier p-6">
            <dt>
              <h3 className="font-semibold text-tiefes-wasser">{p.title}</h3>
            </dt>
            <dd className="mt-2 text-pretty leading-relaxed text-tinte">{p.body}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
```

- [ ] **Step 6: Implement `src/components/makler/Garantie.tsx`**

```tsx
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// Risk reversal on the warm sonnenlicht band — the page's warmest point, right
// before the close. The Gründungs-Zusage is stated once, with no countdown and
// no scarcity styling: it is a fact about where the business stands.
export function Garantie() {
  const g = makler.garantie;
  return (
    <Section tone="warm">
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance font-serif text-3xl italic text-tiefes-wasser md:text-4xl">
          {g.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{g.intro}</p>
      </div>
      <ol className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
        {g.promises.map((p, i) => (
          <Reveal
            as="li"
            key={p.title}
            delayMs={i * 80}
            className="card-depth rounded-2xl bg-papier p-6"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-vrelo-petrol text-sm font-semibold text-papier"
            >
              {i + 1}
            </span>
            <h3 className="mt-3 font-semibold text-tiefes-wasser">{p.title}</h3>
            <p className="mt-2 text-pretty leading-relaxed text-tinte">{p.body}</p>
          </Reveal>
        ))}
      </ol>
      <p className="mx-auto mt-10 max-w-[44rem] text-center text-tinte">{g.close}</p>
      <div className="card-depth mx-auto mt-10 max-w-2xl rounded-2xl bg-papier p-6 md:p-8">
        <h3 className="font-semibold text-tiefes-wasser">{g.founding.title}</h3>
        <p className="mt-2 text-pretty leading-relaxed text-tinte">{g.founding.body}</p>
      </div>
    </Section>
  );
}
```

`text-ember` is deliberately not used here — the founding note is body copy, not a warning.

- [ ] **Step 7: Implement `src/components/makler/Einwaende.tsx`**

```tsx
import { Section } from "@/components/Section";
import { FaqItem } from "@/components/faq/FaqItem";
import { makler } from "@/lib/makler";

// Objections woven in as a calm accordion just before the close, not as a
// fear block. FaqItem is the site's existing disclosure primitive.
export function Einwaende() {
  const e = makler.einwaende;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-[44rem]">
        <h2 className="text-balance text-center text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {e.title}
        </h2>
        <div className="mt-10">
          {e.items.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 8: Implement `src/components/makler/TerminSection.tsx`**

```tsx
import Link from "next/link";
import { WaterSection } from "@/components/WaterSection";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { makler } from "@/lib/makler";

// The close. The Cal embed sits on the page itself so there is no hop between
// persuasion and booking; its iframe still loads only on click, so there is no
// third-party request on page load (the Datenschutz stance holds). The written
// route stays available underneath for anyone who would rather not book.
export function TerminSection({ calLink }: { calLink: string | undefined }) {
  const c = makler.close;
  return (
    <WaterSection className="scroll-mt-20">
      <div id="termin" className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {c.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-gletscher">{c.body}</p>
      </div>
      <div className="mt-12">
        <SchedulerEmbed calLink={calLink} fallbackHint={c.fallbackHint} />
      </div>
      <p className="mt-8 text-center text-sm text-gletscher">
        {c.fallback.prompt}{" "}
        <Link
          href={c.fallback.href}
          className="font-medium text-papier underline decoration-amber/60 underline-offset-4 transition-colors hover:decoration-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        >
          {c.fallback.label}
        </Link>
      </p>
    </WaterSection>
  );
}
```

Note `scroll-mt-20` on the section: the header is sticky, so the anchor must clear it.

- [ ] **Step 9: Run the sections test to verify it passes**

Run: `npx vitest run src/components/makler/sections.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 10: Commit**

```bash
git add src/components/makler
git commit -m "feat: supporting sections for the /makler landing page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: The page, its metadata, and the sitemap exclusion

**Files:**
- Create: `src/app/makler/page.tsx`
- Create: `src/app/makler/page.test.tsx`
- Modify: `src/app/sitemap.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 2, 3, 5, 6; `calLink` from `@/lib/contact`; `PageHero` with the Task 4 `actions` slot.
- Produces: the route `/makler` and its `metadata` export.

- [ ] **Step 1: Write the failing page test**

Create `src/app/makler/page.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MaklerPage, { metadata } from "./page";
import { makler } from "@/lib/makler";

describe("/makler", () => {
  it("is excluded from search engines", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("leads with the pain headline as the only H1", () => {
    render(<MaklerPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(makler.hero.title);
  });

  it("keeps the hero CTA and the header CTA on the booking anchor", () => {
    render(<MaklerPage />);
    const ctas = screen.getAllByRole("link", { name: makler.hero.cta.label });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) expect(cta).toHaveAttribute("href", "#termin");
  });

  it("states the friction-reducing note beside the hero CTA", () => {
    render(<MaklerPage />);
    expect(screen.getByText(makler.hero.ctaNote)).toBeInTheDocument();
  });

  it("carries both products and the demo link", () => {
    render(<MaklerPage />);
    expect(screen.getByRole("heading", { level: 2, name: /Termin-Quelle/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Document Concierge/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: makler.terminQuelle.proof!.label })).toHaveAttribute(
      "href",
      "/demo",
    );
  });

  it("brings its own minimal chrome and no site navigation", () => {
    render(<MaklerPage />);
    expect(screen.getByRole("link", { name: "Impressum" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ratgeber" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Newsletter" })).not.toBeInTheDocument();
  });

  it("never shows a price", () => {
    const { container } = render(<MaklerPage />);
    expect(container.textContent).not.toMatch(/€/);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/app/makler/page.test.tsx`
Expected: FAIL — cannot resolve `./page`.

- [ ] **Step 3: Implement `src/app/makler/page.tsx`**

```tsx
// src/app/makler/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CTAButton } from "@/components/CTAButton";
import { MaklerHeader } from "@/components/makler/MaklerHeader";
import { MaklerFooter } from "@/components/makler/MaklerFooter";
import { ProblemSection } from "@/components/makler/ProblemSection";
import { TerminQuelleBlock } from "@/components/makler/TerminQuelleBlock";
import { Bridge } from "@/components/makler/Bridge";
import { DocumentConciergeBlock } from "@/components/makler/DocumentConciergeBlock";
import { WarumIch } from "@/components/makler/WarumIch";
import { Garantie } from "@/components/makler/Garantie";
import { Einwaende } from "@/components/makler/Einwaende";
import { TerminSection } from "@/components/makler/TerminSection";
import { makler } from "@/lib/makler";
import { calLink } from "@/lib/contact";

// A focus-mode outreach landing page: sent by direct link to a scored lead, so
// it is noindex, absent from the sitemap, and absent from the navigation. The
// site header and footer are suppressed by ChromeGate (src/lib/nav.ts
// focusRoutes); the page brings its own minimal chrome instead.
export const metadata: Metadata = {
  title: "Mehr Termine, weniger Papierkram",
  description:
    "Zwei Systeme für unabhängige Makler und Finanzberater: jede Anfrage in unter fünf Minuten beantwortet und zum Termin gemacht – und die Unterlagen deiner Kunden vollständig eingesammelt, ohne Hinterhertelefonieren.",
  robots: { index: false, follow: false },
};

export default function MaklerPage() {
  return (
    <>
      <MaklerHeader />
      <PageHero
        title={makler.hero.title}
        lead={makler.hero.lead}
        src="/images/lead-check-banner.webp"
        actions={
          <div className="flex flex-col items-start gap-3">
            <CTAButton href={makler.hero.cta.href}>{makler.hero.cta.label}</CTAButton>
            <p className="text-sm text-stumm">{makler.hero.ctaNote}</p>
          </div>
        }
      />
      <ProblemSection />
      <TerminQuelleBlock />
      <Bridge />
      <DocumentConciergeBlock product={makler.documentConcierge} />
      <WarumIch />
      <Garantie />
      <Einwaende />
      <TerminSection calLink={calLink()} />
      <MaklerFooter />
    </>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/app/makler/page.test.tsx`
Expected: PASS (7 tests).

- [ ] **Step 5: Extend the sitemap test**

In `src/app/sitemap.test.ts`, add a case inside the existing `describe("sitemap", …)`:

```ts
  it("excludes the direct-link outreach pages", () => {
    const urls = sitemap().map((e) => e.url);
    expect(urls).not.toContain(`${siteUrl}/makler`);
    expect(urls).not.toContain(`${siteUrl}/lead-check`);
    expect(urls).not.toContain(`${siteUrl}/demo`);
  });
```

- [ ] **Step 6: Run the sitemap test**

Run: `npx vitest run src/app/sitemap.test.ts`
Expected: PASS — `sitemap.ts` needs no change; `/makler` was never added to `staticRoutes`.

- [ ] **Step 7: Commit**

```bash
git add src/app/makler src/app/sitemap.test.ts
git commit -m "feat: the /makler outreach landing page

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Full gate and browser verification

**Files:** none created; fixes land in the files they belong to.

**Interfaces:**
- Consumes: the finished page.
- Produces: a verified, mergeable branch.

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: PASS, no skipped suites.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: success; `/makler` appears in the route list as a static page.

- [ ] **Step 5: Re-audit the German punctuation across every file this branch touched**

```bash
perl -CSD -ne 'while(/(["\x{2014}])/g){$c{$1}++} END{for(sort keys %c){printf "U+%04X %s\n", ord($_), $c{$_}}}' src/lib/makler.ts src/components/makler/*.tsx
```
Expected: `U+2014` absent. Any `U+0022` must be a TypeScript/JSX delimiter, never inside German prose — the Task 2 guard covers `makler.ts`; eyeball the component files, which should contain almost no literal German.

- [ ] **Step 6: Browser check**

Run: `npm start` (not `npm run dev` — it is unreliable in this environment), then open `http://localhost:3000/makler`.

Verify:
- No site navigation, no burger menu, no full footer. The homepage still has all three (`http://localhost:3000/`).
- `/lead-check` and `/demo` still render with the normal site header and footer.
- The header CTA and the hero CTA both jump to the booking section, and the sticky header does not cover the heading.
- At 390 px wide: no horizontal scroll; the header CTA fits beside the logo; the two-column grids stack.
- At 1440 px: the petrol product panel and the paper sections alternate as intended.
- The Cal embed loads only after the click on „Termin anzeigen“.

- [ ] **Step 7: Commit any fixes, then request review**

```bash
git add -A
git commit -m "fix: browser-verification fixes for /makler

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

Then use the `superpowers:requesting-code-review` skill, and finish with `superpowers:finishing-a-development-branch`.

---

## Post-merge (owner actions, not code)

- Update `Website/CLAUDE.md`: add `/makler` to the route list and the changelog, and record the `ChromeGate` focus-route mechanism in the design-system section.
- Update HQ `CLAUDE.md` §7: point the Pond-1 and Pond-2 Tier-A outreach sequences at `vrelo-ki.de/makler` once the domain cutover completes.
- When the Document Concierge is built and its loop video recorded: drop the source in `Videos/`, add the slug block to `scripts/optimize-videos.mjs`, run `npm run optimize:videos`, commit source and derivatives together, then set `documentConcierge.demoVideo` in `src/lib/makler.ts`. The `DocumentConciergeBlock` needs no change; its test already covers both branches.
