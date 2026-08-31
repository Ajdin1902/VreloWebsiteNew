# Prozess-Check-Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `/prozess-check` from the old 5-question A/B/C/D qualifier for the paid €499 audit into the free **Prozess-Check-Funnel** lead magnet: a ~6-step questionnaire that returns hours/week + a pain profile (no €), an optional branded email summary, and a booked call.

**Architecture:** Pure-core scoring in `src/lib/prozessCheck.ts` (deterministic, no AI, no €). A single-screen hours-slider grid for the five time-areas; the rest are one-tap choice steps. Result = hours headline + ranked profile + scheduler embed + optional email capture (mirrors `/lead-check`: Server Action recomputes server-side, two branded mails, honeypot + min-fill anti-spam). The page flips to indexed and stays a chrome-less focus route. The `/leistungen` audit card is rewritten to the free funnel and points at `/prozess-check`.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind v4 (`@theme` tokens), Vitest + React Testing Library, Resend (email), `@calcom/embed-react` (scheduler).

**Spec:** `../../../Knowledge/marketing/prozess-check-funnel.md` (HQ funnel design, §2 time-box, §3 questionnaire + result). Four implementation forks settled 2026-08-31: (A) Block B = one grid screen with an hours slider per area; (B) keep focus route, logo only; (C) full email = branded summary mail + internal notification; (D) rewrite the `/leistungen` card + point to `/prozess-check` + one homepage entry point, leave the global CTAButton default alone.

## Global Constraints

- **German copy only** in all user-facing strings; code + comments in English.
- **German quotes** „…“ = U+201E (open) + U+201C (close), never ASCII `"`. Edit/Write silently downgrade the closing quote — after every write to a file with German copy, verify bytes and repair with codepoint escapes: `perl -CSD -i -pe 's/\x{201E}([^\x{201E}"]*)"/\x{201E}$1\x{201C}/g' FILE` (repair line-ranges; the pattern is greedy across a line).
- **No Gedankenstrich in German copy** — neither U+2013 nor U+2014. Join clauses with a comma, period, or colon; write ranges with the word `bis`. Copy-guard tests forbid both dashes. English code comments may keep the em-dash.
- **No Vrelo price anywhere on `/prozess-check` or the `/leistungen` card.** The price is named only in the sales call (HQ §4). Copy-guard tests forbid a currency token. (Hours numbers like „rund 9 Stunden" are allowed and required — they are not prices.)
- **Result shows hours + profile, never a €.** A conversion factor the owner disbelieves lowers Perceived Likelihood (the `/lead-check` `RECOVERY_RATE` lesson).
- **Generic masculine** in German copy („Kunden"), never `:innen`.
- **`BrandWord`**: „Vrelo" / „Merak" render Fraunces italic via `<BrandWord>` (or `*Vrelo*` inside `withBrandWords`-processed props). „Merak"-Effekt is a felt result, never a package name.
- **Manual/Playwright checks:** use `npm start`, not `npm run dev`, in this environment.
- **Commits** end with a `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` line.

---

## File Structure

**Rewritten:**
- `src/lib/prozessCheck.ts` — pure core: new answer model, `STEPS`, `AREA_LABEL`, `totalHours`, `rankAreas`, `resultCopy`, `RESULT_UI`.
- `src/lib/prozessCheck.test.ts` — logic + copy-guard, rewritten for the new model.
- `src/components/prozess-check/ProzessCheck.tsx` — wizard state machine over the new steps.
- `src/components/prozess-check/Question.tsx` — renders a choice step (grid step handled by the wizard).
- `src/components/prozess-check/Result.tsx` — hours + profile + scheduler + email form, or zero-state.
- `src/app/prozess-check/page.tsx` — indexed, new hero copy.
- `src/lib/prozess-audit.ts` — `/leistungen` card copy, rewritten to the free funnel.
- `src/lib/prozess-audit.test.ts` — copy-guard expectations for the rewrite.

**New:**
- `src/lib/prozessCheckEmail.ts` — `validateEmail`, `buildSummaryEmail`, `buildInternalEmail`, `evaluateSubmission`, field/decision types (mirrors `leadCheckEmail.ts`).
- `src/lib/prozessCheckEmail.test.ts` — email builders + submission gate.
- `src/app/prozess-check/actions.ts` — Server Action (mirrors `lead-check/actions.ts`).
- `src/app/prozess-check/actions.test.ts` — parse + gate.
- `src/components/prozess-check/HoursGrid.tsx` — single-screen five-slider grid.
- `src/components/prozess-check/HoursGrid.test.tsx` — slider interaction.
- `src/components/prozess-check/ResultEmailForm.tsx` — optional capture (mirrors `lead-check/ResultEmailForm.tsx`).

**Modified (small):**
- `src/app/sitemap.ts` — add `/prozess-check` to `staticRoutes`.
- `src/components/home/Referenzen.tsx:64` — the one homepage entry point, repointed to `/prozess-check`.
- `src/components/home/Referenzen.test.tsx` (or the home test asserting that href) — update the expected href.

**Unchanged (relied on):** `src/lib/nav.ts` already lists `/prozess-check` in `focusRoutes` and `focusChrome["/prozess-check"] = {}` (logo-only) — decision (B), no change. `src/lib/contact.ts` exports `EMAIL_RE`, `isHoneypotTripped`, `isTooFast`, `calBookingUrl`, `calLink`, `isContactConfigured`, `contactFrom`, `contactTo`, `resendKey`. `src/components/kontakt/SchedulerEmbed.tsx` is the Cal embed.

---

## Task 1: Rewrite the pure core (`prozessCheck.ts`)

**Files:**
- Modify (full rewrite): `src/lib/prozessCheck.ts`
- Modify (full rewrite): `src/lib/prozessCheck.test.ts`

**Interfaces:**
- Produces:
  - `type Branche = "handwerk" | "immobilien" | "reinigung" | "praxis" | "handel" | "anderes"`
  - `type Team = "allein" | "2bis5" | "6bis20" | "ueber20"`
  - `type AreaId = "anfragen" | "rechnungen" | "daten" | "erinnern" | "orga"`
  - `type Abende = "staendig" | "abundzu" | "nein"`
  - `type Versucht = "nichts" | "toolBrach" | "beauftragt"`
  - `type ProzessCheckAnswers = { branche: Branche; team: Team; stunden: Record<AreaId, number>; nervt: AreaId; abende: Abende; versucht: Versucht }`
  - `const STEPS` (typed step list, see code), `const AREA_LABEL: Record<AreaId, string>`, `const AREA_IDS: readonly AreaId[]`
  - `function totalHours(a: ProzessCheckAnswers): number`
  - `function rankAreas(a: ProzessCheckAnswers): AreaId[]`
  - `type ResultCopy = { totalHours: number; fits: boolean; headline: string; sub: string; topAreas: { id: AreaId; hours: number; label: string; sentence: string }[]; nervtLabel: string; verdict: string }`
  - `function resultCopy(a: ProzessCheckAnswers): ResultCopy`
  - `const RESULT_UI` (static UI copy)

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `src/lib/prozessCheck.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  STEPS,
  AREA_IDS,
  AREA_LABEL,
  totalHours,
  rankAreas,
  resultCopy,
  RESULT_UI,
  type ProzessCheckAnswers,
} from "./prozessCheck";

const base: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "2bis5",
  stunden: { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 },
  nervt: "anfragen",
  abende: "nein",
  versucht: "nichts",
};

describe("prozessCheck steps", () => {
  it("has the six steps in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "branche",
      "team",
      "stunden",
      "nervt",
      "abende",
      "versucht",
    ]);
  });

  it("the stunden step is the grid kind and lists all five areas", () => {
    const grid = STEPS.find((s) => s.id === "stunden");
    expect(grid?.kind).toBe("grid");
    expect(AREA_IDS).toEqual(["anfragen", "rechnungen", "daten", "erinnern", "orga"]);
  });
});

describe("totalHours + rankAreas", () => {
  it("sums the five sliders", () => {
    expect(
      totalHours({ ...base, stunden: { anfragen: 3, rechnungen: 5, daten: 1, erinnern: 2, orga: 1 } }),
    ).toBe(12);
  });

  it("ranks areas by hours descending, ties broken by area order", () => {
    expect(
      rankAreas({ ...base, stunden: { anfragen: 2, rechnungen: 5, daten: 2, erinnern: 0, orga: 0 } }),
    ).toEqual(["rechnungen", "anfragen", "daten", "erinnern", "orga"]);
  });
});

describe("resultCopy", () => {
  it("puts the summed hours in the headline and marks a real load as fitting", () => {
    const r = resultCopy({ ...base, stunden: { anfragen: 3, rechnungen: 5, daten: 1, erinnern: 0, orga: 0 } });
    expect(r.fits).toBe(true);
    expect(r.totalHours).toBe(9);
    expect(r.headline).toContain("9");
    // Top area leads the profile and carries a calm what-is-automatable sentence.
    expect(r.topAreas[0].id).toBe("rechnungen");
    expect(r.topAreas[0].sentence.length).toBeGreaterThan(0);
  });

  it("returns the honest zero-state when nothing costs time", () => {
    const r = resultCopy(base); // all sliders 0
    expect(r.fits).toBe(false);
    expect(r.totalHours).toBe(0);
    expect(r.topAreas).toEqual([]);
  });

  it("names the area the visitor said annoys him most", () => {
    const r = resultCopy({ ...base, nervt: "daten", stunden: { anfragen: 1, rechnungen: 1, daten: 1, erinnern: 1, orga: 1 } });
    expect(r.nervtLabel).toBe(AREA_LABEL.daten);
  });
});

// Copy-guard: collect every renderable German string.
function strings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const v of value) strings(v, out);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
}

const SAMPLES: ProzessCheckAnswers[] = [
  { ...base, stunden: { anfragen: 6, rechnungen: 2, daten: 1, erinnern: 0, orga: 0 }, nervt: "anfragen", abende: "staendig", versucht: "toolBrach" },
  { ...base, stunden: { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 } }, // zero-state
  { ...base, stunden: { anfragen: 1, rechnungen: 1, daten: 1, erinnern: 1, orga: 1 }, nervt: "orga", abende: "abundzu", versucht: "beauftragt" },
];

const corpus: string[] = [];
strings(STEPS, corpus);
strings(RESULT_UI, corpus);
for (const s of SAMPLES) strings(resultCopy(s), corpus);

const CURRENCY = /€|\bEUR\b|\d\s*(Euro|netto)\b/i;

describe("prozessCheck copy-guard", () => {
  it("uses German quotes, never ASCII double quotes", () => {
    expect(corpus.filter((s) => s.includes('"'))).toEqual([]);
  });
  it("uses no dash at all", () => {
    expect(corpus.filter((s) => s.includes("—") || s.includes("–"))).toEqual([]);
  });
  it("pairs every opening German quote with a closing one", () => {
    for (const s of corpus) {
      const open = (s.match(/„/g) ?? []).length;
      const close = (s.match(/“/g) ?? []).length;
      expect({ s, open, close }).toEqual({ s, open, close: open });
    }
  });
  it("never names a price (hours numbers are allowed, currency is not)", () => {
    expect(corpus.filter((s) => CURRENCY.test(s))).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/prozessCheck.test.ts`
Expected: FAIL (old exports `categorize`/`severity` gone; new symbols undefined).

- [ ] **Step 3: Rewrite the implementation**

Replace the entire contents of `src/lib/prozessCheck.ts`:

```ts
// src/lib/prozessCheck.ts
//
// Pure core for the free /prozess-check funnel. Deterministic, no AI, no €.
// The visitor answers Branche + Team, drags an hours slider for each of five
// repetitive-work areas, then three quick feeling questions. The result mirrors
// his own numbers back: total hours/week + a ranked pain profile. No price ever
// (that is named in the call). Spec: Knowledge/marketing/prozess-check-funnel.md
// Distinct from leadCheck.ts on purpose — that one does € math, this one never does.

export type Branche = "handwerk" | "immobilien" | "reinigung" | "praxis" | "handel" | "anderes";
export type Team = "allein" | "2bis5" | "6bis20" | "ueber20";
export type AreaId = "anfragen" | "rechnungen" | "daten" | "erinnern" | "orga";
export type Abende = "staendig" | "abundzu" | "nein";
export type Versucht = "nichts" | "toolBrach" | "beauftragt";

export type ProzessCheckAnswers = {
  branche: Branche;
  team: Team;
  stunden: Record<AreaId, number>; // 0..10 per area
  nervt: AreaId;
  abende: Abende;
  versucht: Versucht;
};

// Order is the tie-break order for equal hours.
export const AREA_IDS: readonly AreaId[] = ["anfragen", "rechnungen", "daten", "erinnern", "orga"];

export const AREA_LABEL: Record<AreaId, string> = {
  anfragen: "Anfragen beantworten und Termine ausmachen",
  rechnungen: "Rechnungen, Belege und Mahnungen",
  daten: "Daten aus Mails oder Zetteln in ein System tippen",
  erinnern: "Kunden erinnern und nachfassen",
  orga: "Interne Orga: Zettel, Listen, Zuruf",
};

// A calm, honest sentence per area on what is typically automatable. No promise,
// no €, no vendor name. One water-metaphor concept at most; kept short.
export const AREA_SENTENCE: Record<AreaId, string> = {
  anfragen: "Anfragen lassen sich sofort beantworten und zu einem Termin führen, ohne dass du daneben sitzt.",
  rechnungen: "Belege und Rechnungen lassen sich einlesen, zuordnen und ablegen, statt sie abzutippen.",
  daten: "Daten wandern von selbst von A nach B, sobald eine Mail oder ein Formular reinkommt.",
  erinnern: "Erinnerungen und Nachfass-Nachrichten gehen automatisch raus, zur richtigen Zeit, an die richtige Person.",
  orga: "Wiederkehrende Abläufe laufen im Hintergrund, damit weniger auf Zetteln und im Kopf hängt.",
};

type ChoiceOption<V extends string> = { value: V; label: string };

export type Step =
  | { id: "branche"; kind: "choice"; label: string; options: readonly ChoiceOption<Branche>[] }
  | { id: "team"; kind: "choice"; label: string; options: readonly ChoiceOption<Team>[] }
  | { id: "stunden"; kind: "grid"; label: string; hint: string; max: number }
  | { id: "nervt"; kind: "choice"; label: string; options: readonly ChoiceOption<AreaId>[] }
  | { id: "abende"; kind: "choice"; label: string; options: readonly ChoiceOption<Abende>[] }
  | { id: "versucht"; kind: "choice"; label: string; options: readonly ChoiceOption<Versucht>[] };

export const STEPS: readonly Step[] = [
  {
    id: "branche",
    kind: "choice",
    label: "Was machst du?",
    options: [
      { value: "handwerk", label: "Handwerk" },
      { value: "immobilien", label: "Immobilien" },
      { value: "reinigung", label: "Reinigung oder Dienstleistung" },
      { value: "praxis", label: "Praxis oder Kanzlei" },
      { value: "handel", label: "Handel" },
      { value: "anderes", label: "Etwas anderes" },
    ],
  },
  {
    id: "team",
    kind: "choice",
    label: "Wie groß ist dein Team?",
    options: [
      { value: "allein", label: "Ich allein" },
      { value: "2bis5", label: "2 bis 5" },
      { value: "6bis20", label: "6 bis 20" },
      { value: "ueber20", label: "Mehr als 20" },
    ],
  },
  {
    id: "stunden",
    kind: "grid",
    label: "Wo geht deine Zeit hin?",
    hint: "Schätz für jede Aufgabe grob, wie viele Stunden pro Woche sie dich kostet. Null ist völlig in Ordnung.",
    max: 10,
  },
  {
    id: "nervt",
    kind: "choice",
    label: "Was davon nervt dich am meisten?",
    options: AREA_IDS.map((id) => ({ value: id, label: AREA_LABEL[id] })),
  },
  {
    id: "abende",
    kind: "choice",
    label: "Arbeitest du abends oder am Wochenende Liegengebliebenes ab?",
    options: [
      { value: "staendig", label: "Ja, regelmäßig" },
      { value: "abundzu", label: "Ab und zu" },
      { value: "nein", label: "Nein" },
    ],
  },
  {
    id: "versucht",
    kind: "choice",
    label: "Hast du schon versucht, das loszuwerden?",
    options: [
      { value: "nichts", label: "Noch nichts" },
      { value: "toolBrach", label: "Software gekauft, aber halb eingerichtet" },
      { value: "beauftragt", label: "Freelancer oder Agentur beauftragt" },
    ],
  },
];

export function totalHours(a: ProzessCheckAnswers): number {
  return AREA_IDS.reduce((sum, id) => sum + (a.stunden[id] || 0), 0);
}

// Areas by hours descending; equal hours keep AREA_IDS order (stable).
export function rankAreas(a: ProzessCheckAnswers): AreaId[] {
  return [...AREA_IDS].sort((x, y) => (a.stunden[y] || 0) - (a.stunden[x] || 0));
}

export type ResultCopy = {
  totalHours: number;
  /** false only when the visitor reports zero hours everywhere. */
  fits: boolean;
  headline: string;
  sub: string;
  topAreas: { id: AreaId; hours: number; label: string; sentence: string }[];
  nervtLabel: string;
  verdict: string;
};

const nf = new Intl.NumberFormat("de-DE");

export function resultCopy(a: ProzessCheckAnswers): ResultCopy {
  const total = totalHours(a);
  const nervtLabel = AREA_LABEL[a.nervt];

  if (total === 0) {
    return {
      totalHours: 0,
      fits: false,
      headline: "Bei dir frisst gerade nichts nennenswert Zeit.",
      sub: "Das ist ein gutes Zeichen. Wenn sich das ändert und dir eine Aufgabe den Tag frisst, weißt du, wo ich bin.",
      topAreas: [],
      nervtLabel,
      verdict: "Ein Gespräch ist gerade noch nicht nötig.",
    };
  }

  // Top areas that actually carry hours; the visitor's "nervt" pick leads if it
  // ties on hours, otherwise hours decide. Show up to three.
  const ranked = rankAreas(a).filter((id) => (a.stunden[id] || 0) > 0);
  // Bring the "nervt" area to the front when it shares the top hour count.
  const topHours = a.stunden[ranked[0]] || 0;
  if (a.stunden[a.nervt] === topHours && ranked[0] !== a.nervt) {
    ranked.splice(ranked.indexOf(a.nervt), 1);
    ranked.unshift(a.nervt);
  }
  const topAreas = ranked.slice(0, 3).map((id) => ({
    id,
    hours: a.stunden[id] || 0,
    label: AREA_LABEL[id],
    sentence: AREA_SENTENCE[id],
  }));

  return {
    totalHours: total,
    fits: true,
    headline: `Rund ${nf.format(total)} Stunden pro Woche gehen bei dir in Aufgaben, die sich wiederholen.`,
    sub: "Gerechnet aus deinen eigenen Angaben.",
    topAreas,
    nervtLabel,
    verdict:
      a.abende === "staendig"
        ? "Und ein Teil davon nimmst du mit nach Hause. Genau da fangen wir an."
        : "Das ist Zeit, die sich zurückholen lässt.",
  };
}

// Static UI copy the components render (components hold no German).
export const RESULT_UI = {
  resultLabel: "Dein Ergebnis",
  profileLabel: "Am meisten kostet dich",
  nervtPrefix: "Du sagst, am meisten nervt dich: ",
  schedulerPrompt:
    "Lass uns 30 Minuten drüber sprechen. Kostenlos, unverbindlich, und du bekommst danach einen Fahrplan, der dir gehört.",
  schedulerFallbackHint: "Schreib mir so lange einfach über das Kontaktformular.",
  emailLabel: "Ergebnis lieber per Mail?",
  emailIntro: "Ich schick dir deine Auswertung zu, dann hast du sie in Ruhe.",
  exitLead: "Schau dich in Ruhe um. Wenn dich eine Aufgabe doch täglich ausbremst, bin ich da.",
  exitNewsletterPrefix: "Bis dahin: ",
  exitNewsletterLabel: "„Die Quelle“",
  exitNewsletterSuffix: ", mein Newsletter mit einem kleinen Tipp pro Woche, oder stöber im ",
  exitRatgeberLabel: "Ratgeber",
  exitSuffix: ".",
} as const;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/prozessCheck.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify German quote bytes, then commit**

Run: `perl -CSD -0777 -ne 'print "BAD\n" while /\x{201E}[^\x{201E}\x{201C}]*\x{201D}/gs' src/lib/prozessCheck.ts` (empty output = clean). If any `BAD`, repair with the Global Constraints perl command, then re-run.

```bash
git add src/lib/prozessCheck.ts src/lib/prozessCheck.test.ts
git commit -m "feat(prozess-check): rewrite pure core for the free hours+profile funnel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: Email module (`prozessCheckEmail.ts`)

**Files:**
- Create: `src/lib/prozessCheckEmail.ts`
- Test: `src/lib/prozessCheckEmail.test.ts`

**Interfaces:**
- Consumes (Task 1): `ProzessCheckAnswers`, `resultCopy`, `AREA_LABEL`, `AREA_IDS`, `totalHours`, `Branche`, `Team`, `AreaId`, `Abende`, `Versucht`. From `./contact`: `EMAIL_RE`, `isHoneypotTripped`, `isTooFast`.
- Produces:
  - `function validateEmail(email: string): string | undefined`
  - `type SummaryEmail = { to: string; subject: string; html: string; text: string }`
  - `function buildSummaryEmail(p: { email: string; answers: ProzessCheckAnswers; calUrl?: string }): SummaryEmail`
  - `type InternalEmail = { subject: string; text: string; html: string; replyTo: string }`
  - `function buildInternalEmail(p: { email: string; answers: ProzessCheckAnswers; kontaktErlaubt: boolean }): InternalEmail`
  - `type ProzessCheckFields = { email: string; honeypot: string; renderedAt: number; answers: ProzessCheckAnswers; kontaktErlaubt: boolean }`
  - `type ProzessCheckDecision = { action: "drop" } | { action: "reject"; message: string } | { action: "invalid"; error: string } | { action: "send"; leadEmail: SummaryEmail; internalEmail: InternalEmail }`
  - `function evaluateSubmission(f: ProzessCheckFields, now: number, calUrl?: string): ProzessCheckDecision`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/prozessCheckEmail.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  validateEmail,
  buildSummaryEmail,
  buildInternalEmail,
  evaluateSubmission,
  type ProzessCheckFields,
} from "./prozessCheckEmail";
import type { ProzessCheckAnswers } from "./prozessCheck";

const answers: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "6bis20",
  stunden: { anfragen: 3, rechnungen: 5, daten: 1, erinnern: 0, orga: 0 },
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("validateEmail", () => {
  it("rejects a malformed address", () => {
    expect(validateEmail("nope")).toBeTruthy();
  });
  it("accepts a valid address", () => {
    expect(validateEmail("a@b.de")).toBeUndefined();
  });
});

describe("buildSummaryEmail", () => {
  it("puts the summed hours in the summary and links only the Cal URL", () => {
    const m = buildSummaryEmail({ email: "a@b.de", answers, calUrl: "https://cal.eu/x" });
    expect(m.to).toBe("a@b.de");
    expect(m.html).toContain("9"); // 3+5+1
    expect(m.html).toContain("https://cal.eu/x");
    expect(m.html).not.toContain("€"); // no price ever
    expect(m.text).toContain("9");
  });
  it("falls back to a reply line when no Cal URL is configured", () => {
    const m = buildSummaryEmail({ email: "a@b.de", answers });
    expect(m.html).not.toContain("http");
  });
});

describe("buildInternalEmail", () => {
  it("shows the answers and the contact flag", () => {
    const m = buildInternalEmail({ email: "a@b.de", answers, kontaktErlaubt: true });
    expect(m.replyTo).toBe("a@b.de");
    expect(m.html).toContain("JA");
    const blocked = buildInternalEmail({ email: "a@b.de", answers, kontaktErlaubt: false });
    expect(blocked.html).toContain("nicht anschreiben");
  });
  it("escapes the lead address in HTML", () => {
    const m = buildInternalEmail({ email: '<x>@b.de', answers, kontaktErlaubt: false });
    expect(m.html).not.toContain("<x>@b.de");
  });
});

describe("evaluateSubmission", () => {
  const fields = (over: Partial<ProzessCheckFields> = {}): ProzessCheckFields => ({
    email: "a@b.de",
    honeypot: "",
    renderedAt: 0,
    answers,
    kontaktErlaubt: false,
    ...over,
  });

  it("drops a honeypot hit", () => {
    expect(evaluateSubmission(fields({ honeypot: "bot" }), 10_000).action).toBe("drop");
  });
  it("rejects a too-fast submit", () => {
    expect(evaluateSubmission(fields({ renderedAt: 9_999 }), 10_000).action).toBe("reject");
  });
  it("invalidates a bad email", () => {
    expect(evaluateSubmission(fields({ email: "nope" }), 10_000).action).toBe("invalid");
  });
  it("sends both mails on a clean submission", () => {
    const d = evaluateSubmission(fields(), 10_000, "https://cal.eu/x");
    expect(d.action).toBe("send");
    if (d.action === "send") {
      expect(d.leadEmail.to).toBe("a@b.de");
      expect(d.internalEmail.replyTo).toBe("a@b.de");
    }
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/lib/prozessCheckEmail.test.ts`
Expected: FAIL (module does not exist).

- [ ] **Step 3: Write the implementation**

Create `src/lib/prozessCheckEmail.ts`:

```ts
// src/lib/prozessCheckEmail.ts
// Email layer for /prozess-check. Mirrors leadCheckEmail.ts: a branded summary to
// the visitor (their hours + profile, no €, only the Cal URL as a link) and an
// internal notification so Ajdin walks into the call already knowing the profile.
import { EMAIL_RE, isHoneypotTripped, isTooFast } from "./contact";
import {
  resultCopy,
  totalHours,
  rankAreas,
  AREA_LABEL,
  type ProzessCheckAnswers,
  type Branche,
  type Team,
  type AreaId,
  type Abende,
  type Versucht,
} from "./prozessCheck";

export function validateEmail(email: string): string | undefined {
  if (!EMAIL_RE.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return undefined;
}

const nf = new Intl.NumberFormat("de-DE");
const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";
const SERIF = "font-family:Georgia,'Times New Roman',serif";

function hoursLabel(n: number): string {
  return n === 1 ? "1 Stunde" : `${nf.format(n)} Stunden`;
}

export type SummaryEmail = { to: string; subject: string; html: string; text: string };

export function buildSummaryEmail(p: {
  email: string;
  answers: ProzessCheckAnswers;
  calUrl?: string;
}): SummaryEmail {
  const { answers, calUrl } = p;
  const r = resultCopy(answers);
  const subject = "Dein Ergebnis: der Prozess-Check";

  const profileHtml = r.topAreas
    .map(
      (a) =>
        `<tr><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;font-weight:bold;width:60%">${a.label}</td><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;color:#696359;text-align:right">${hoursLabel(a.hours)}/Woche</td></tr>`,
    )
    .join("\n        ");

  const ctaInner = calUrl
    ? `<a href="${calUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">30-Minuten-Gespräch buchen</a>`
    : `<span style="color:#f4efe6;font-size:14px">Antworte einfach auf diese E-Mail. Dann melde ich mich.</span>`;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <p style="text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#696359;margin:0 0 14px">Dein Prozess-Check</p>
      <p style="${SERIF};text-align:center;font-size:24px;line-height:1.35;color:#0a2538;margin:0 0 6px">Rund <strong>${hoursLabel(r.totalHours)} pro Woche</strong> gehen in Aufgaben, die sich wiederholen.</p>
      <p style="text-align:center;font-size:14px;margin:0 0 18px">Gerechnet aus deinen eigenen Angaben.</p>
      <div style="width:44px;height:3px;background:#d4a24c;margin:0 auto 22px"></div>
      <p style="font-size:15px;font-weight:bold;color:#0a2538;margin:0 0 8px">Wo deine Zeit hingeht</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px;margin:0 0 22px">
        ${profileHtml}
      </table>
      <div style="background:#1b5063;border-radius:12px;padding:24px 22px;text-align:center;margin:0 0 26px">
        <p style="${SERIF};color:#f4efe6;font-size:17px;line-height:1.45;margin:0 0 16px">Lass uns 30 Minuten drüber sprechen. Danach bekommst du einen Fahrplan, der dir gehört.</p>
        ${ctaInner}
      </div>
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 24px">Bis bald<br>Ajdin von <em style="${SERIF};font-style:italic">Vrelo</em></p>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:0 0 14px" />
      <p style="font-size:12px;color:#696359;margin:0">Du bekommst diese E-Mail einmalig, weil du dir dein Prozess-Check-Ergebnis hast schicken lassen.</p>
    </div>
  </body>
</html>`;

  const textLines = [
    "Dein Prozess-Check",
    "",
    `Rund ${hoursLabel(r.totalHours)} pro Woche gehen in Aufgaben, die sich wiederholen.`,
    "Gerechnet aus deinen eigenen Angaben.",
    "",
    "Wo deine Zeit hingeht:",
    ...r.topAreas.map((a) => `- ${a.label}: ${hoursLabel(a.hours)}/Woche`),
    "",
    "Lass uns 30 Minuten drüber sprechen. Danach bekommst du einen Fahrplan, der dir gehört.",
    calUrl ? `30-Minuten-Gespräch buchen: ${calUrl}` : "Antworte einfach auf diese E-Mail. Dann melde ich mich.",
    "",
    "Bis bald",
    "Ajdin von Vrelo",
    "",
    "Du bekommst diese E-Mail einmalig, weil du dir dein Prozess-Check-Ergebnis hast schicken lassen.",
  ];

  return { to: p.email.trim(), subject, html, text: textLines.join("\n") };
}

const BRANCHE_LABEL: Record<Branche, string> = {
  handwerk: "Handwerk",
  immobilien: "Immobilien",
  reinigung: "Reinigung/Dienstleistung",
  praxis: "Praxis/Kanzlei",
  handel: "Handel",
  anderes: "Etwas anderes",
};
const TEAM_LABEL: Record<Team, string> = {
  allein: "Ich allein",
  "2bis5": "2 bis 5",
  "6bis20": "6 bis 20",
  ueber20: "Mehr als 20",
};
const ABENDE_LABEL: Record<Abende, string> = {
  staendig: "regelmäßig",
  abundzu: "ab und zu",
  nein: "nein",
};
const VERSUCHT_LABEL: Record<Versucht, string> = {
  nichts: "noch nichts",
  toolBrach: "Software gekauft, halb eingerichtet",
  beauftragt: "Freelancer/Agentur beauftragt",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type InternalEmail = { subject: string; text: string; html: string; replyTo: string };

export function buildInternalEmail(p: {
  email: string;
  answers: ProzessCheckAnswers;
  kontaktErlaubt: boolean;
}): InternalEmail {
  const { answers } = p;
  const email = p.email.trim();
  const total = totalHours(answers);
  const ranked = rankAreas(answers);
  const subject = `Prozess-Check: ${email}, ${total} Std./Woche`;

  const hoursRows = ranked
    .map(
      (id: AreaId) =>
        `<tr><td style="padding:6px 8px;border-bottom:1px solid #e3dccc;color:#696359;width:70%">${AREA_LABEL[id]}</td><td style="padding:6px 8px;border-bottom:1px solid #e3dccc;font-weight:bold;text-align:right">${answers.stunden[id] || 0} Std.</td></tr>`,
    )
    .join("\n        ");

  const meta: Array<[string, string]> = [
    ["E-Mail", escapeHtml(email)],
    ["Branche", BRANCHE_LABEL[answers.branche]],
    ["Team", TEAM_LABEL[answers.team]],
    ["Summe", `${total} Std./Woche`],
    ["Nervt am meisten", AREA_LABEL[answers.nervt]],
    ["Abends/Wochenende", ABENDE_LABEL[answers.abende]],
    ["Schon versucht", VERSUCHT_LABEL[answers.versucht]],
    ["Kontakt erlaubt", p.kontaktErlaubt ? "JA" : "NEIN, nicht anschreiben"],
  ];

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <p style="font-size:15px;font-weight:bold;color:#0a2538;margin:0 0 10px">Stunden je Bereich</p>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px;margin:0 0 18px">
        ${hoursRows}
      </table>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px">
        ${meta
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;color:#696359;width:46%">${k}</td><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;font-weight:bold">${v}</td></tr>`,
          )
          .join("\n        ")}
      </table>
      <p style="font-size:12.5px;color:#696359;margin:18px 0 0">Der Kunde hat seine Auswertung bereits automatisch bekommen.${
        p.kontaktErlaubt ? " Auf ‚Antworten‘ schreibst du ihm direkt." : " <strong>Er hat dem Kontakt nicht zugestimmt. Schreib ihn nicht an.</strong>"
      }</p>
    </div>
  </body>
</html>`;

  const lines = [
    `E-Mail: ${email}`,
    `Branche: ${BRANCHE_LABEL[answers.branche]}`,
    `Team: ${TEAM_LABEL[answers.team]}`,
    `Summe: ${total} Std./Woche`,
    "",
    "Stunden je Bereich:",
    ...ranked.map((id) => `- ${AREA_LABEL[id]}: ${answers.stunden[id] || 0} Std.`),
    "",
    `Nervt am meisten: ${AREA_LABEL[answers.nervt]}`,
    `Abends/Wochenende: ${ABENDE_LABEL[answers.abende]}`,
    `Schon versucht: ${VERSUCHT_LABEL[answers.versucht]}`,
    "",
    `Kontakt erlaubt: ${p.kontaktErlaubt ? "JA" : "NEIN, nicht anschreiben"}`,
  ];

  return { subject, text: lines.join("\n"), html, replyTo: email };
}

export type ProzessCheckFields = {
  email: string;
  honeypot: string;
  renderedAt: number;
  answers: ProzessCheckAnswers;
  kontaktErlaubt: boolean;
};

export type ProzessCheckDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | { action: "send"; leadEmail: SummaryEmail; internalEmail: InternalEmail };

export function evaluateSubmission(
  f: ProzessCheckFields,
  now: number,
  calUrl?: string,
): ProzessCheckDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const emailErr = validateEmail(f.email);
  if (emailErr) return { action: "invalid", error: emailErr };
  return {
    action: "send",
    leadEmail: buildSummaryEmail({ email: f.email, answers: f.answers, calUrl }),
    internalEmail: buildInternalEmail({ email: f.email, answers: f.answers, kontaktErlaubt: f.kontaktErlaubt }),
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/lib/prozessCheckEmail.test.ts`
Expected: PASS.

- [ ] **Step 5: Verify quote bytes and commit**

Run the quote-byte check from Task 1 Step 5 against `src/lib/prozessCheckEmail.ts`; repair if needed.

```bash
git add src/lib/prozessCheckEmail.ts src/lib/prozessCheckEmail.test.ts
git commit -m "feat(prozess-check): branded summary + internal notification email layer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: Server Action (`app/prozess-check/actions.ts`)

**Files:**
- Create: `src/app/prozess-check/actions.ts`
- Test: `src/app/prozess-check/actions.test.ts`

**Interfaces:**
- Consumes (Task 2): `evaluateSubmission`, `ProzessCheckFields`. From `./contact`: `isContactConfigured`, `contactFrom`, `contactTo`, `resendKey`, `calBookingUrl`. From `./prozessCheck`: `AREA_IDS`, and the enum unions for `pick()`.
- Produces:
  - `type ProzessCheckEmailState = { status: "idle" } | { status: "ok" } | { status: "error"; message: string } | { status: "invalid"; error: string }`
  - `async function submitProzessCheckEmail(prev, formData): Promise<ProzessCheckEmailState>`

- [ ] **Step 1: Write the failing test**

Create `src/app/prozess-check/actions.test.ts`. It verifies the pure parse/gate path without hitting Resend by exercising the drop/reject/invalid branches (which return before the Resend call):

```ts
import { describe, it, expect } from "vitest";
import { submitProzessCheckEmail, type ProzessCheckEmailState } from "./actions";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

const idle: ProzessCheckEmailState = { status: "idle" };

// Well-formed base answers (renderedAt far in the past so it isn't "too fast").
const good = {
  renderedAt: "0",
  email: "a@b.de",
  branche: "handwerk",
  team: "6bis20",
  h_anfragen: "3",
  h_rechnungen: "5",
  h_daten: "1",
  h_erinnern: "0",
  h_orga: "0",
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("submitProzessCheckEmail gate", () => {
  it("drops a honeypot hit as a silent ok", async () => {
    const s = await submitProzessCheckEmail(idle, fd({ ...good, website: "bot" }));
    expect(s.status).toBe("ok");
  });
  it("invalidates a bad email", async () => {
    const s = await submitProzessCheckEmail(idle, fd({ ...good, email: "nope" }));
    expect(s.status).toBe("invalid");
  });
  it("rejects a too-fast submit", async () => {
    const s = await submitProzessCheckEmail(idle, fd({ ...good, renderedAt: String(Date.now()) }));
    expect(s.status).toBe("error");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/app/prozess-check/actions.test.ts`
Expected: FAIL (module does not exist).

- [ ] **Step 3: Write the implementation**

Create `src/app/prozess-check/actions.ts`:

```ts
"use server";

import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey, calBookingUrl } from "@/lib/contact";
import { evaluateSubmission, type ProzessCheckFields } from "@/lib/prozessCheckEmail";
import { AREA_IDS, type ProzessCheckAnswers } from "@/lib/prozessCheck";

export type ProzessCheckEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; error: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

function pick<T extends string>(raw: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

// Clamp a slider value to 0..10 integer; anything odd falls back to 0.
function clampHours(raw: string): number {
  const n = Math.round(Number(raw));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n > 10 ? 10 : n;
}

function parse(formData: FormData): ProzessCheckFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  const stunden = Object.fromEntries(
    AREA_IDS.map((id) => [id, clampHours(get(`h_${id}`))]),
  ) as ProzessCheckAnswers["stunden"];
  const answers: ProzessCheckAnswers = {
    branche: pick(get("branche"), ["handwerk", "immobilien", "reinigung", "praxis", "handel", "anderes"], "anderes"),
    team: pick(get("team"), ["allein", "2bis5", "6bis20", "ueber20"], "allein"),
    stunden,
    nervt: pick(get("nervt"), AREA_IDS, "anfragen"),
    abende: pick(get("abende"), ["staendig", "abundzu", "nein"], "nein"),
    versucht: pick(get("versucht"), ["nichts", "toolBrach", "beauftragt"], "nichts"),
  };
  return {
    email: get("email"),
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
    answers,
    kontaktErlaubt: formData.get("kontakt") != null,
  };
}

export async function submitProzessCheckEmail(
  _prev: ProzessCheckEmailState,
  formData: FormData,
): Promise<ProzessCheckEmailState> {
  const decision = evaluateSubmission(parse(formData), Date.now(), calBookingUrl());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    const lead = await resend.emails.send({
      from: contactFrom()!,
      to: decision.leadEmail.to,
      subject: decision.leadEmail.subject,
      html: decision.leadEmail.html,
      text: decision.leadEmail.text,
    });
    if (lead.error) return { status: "error", message: GENERIC_ERROR };
    try {
      await resend.emails.send({
        from: contactFrom()!,
        to: contactTo()!,
        replyTo: decision.internalEmail.replyTo,
        subject: decision.internalEmail.subject,
        html: decision.internalEmail.html,
        text: decision.internalEmail.text,
      });
    } catch {
      // Internal-only failure: the lead got their summary; don't fail the UI.
    }
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}
```

> Note: the "too-fast" test asserts `status: "error"` because with no Resend env configured in the test environment the reject branch returns `{status:"error"}`. `isTooFast` uses `MIN_FILL_MS` from `contact.ts`; `renderedAt: Date.now()` is inside that window, so `evaluateSubmission` returns `reject` → `{status:"error"}` before any Resend call. If `contact.ts` `MIN_FILL_MS` is 0 in test, change the test to set `renderedAt` to `String(Date.now() + 100000)` (future) which `isTooFast` also treats as too-fast.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/app/prozess-check/actions.test.ts`
Expected: PASS. If the too-fast case fails because `MIN_FILL_MS` is 0 under test, apply the note's fallback and re-run.

- [ ] **Step 5: Commit**

```bash
git add src/app/prozess-check/actions.ts src/app/prozess-check/actions.test.ts
git commit -m "feat(prozess-check): server action recomputes result and sends both mails

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: Hours-slider grid (`HoursGrid.tsx`)

**Files:**
- Create: `src/components/prozess-check/HoursGrid.tsx`
- Test: `src/components/prozess-check/HoursGrid.test.tsx`

**Interfaces:**
- Consumes (Task 1): `AREA_IDS`, `AREA_LABEL`, `AreaId`.
- Produces: `function HoursGrid({ label, hint, max, onSubmit, onBack, showBack }: { label: string; hint: string; max: number; onSubmit: (stunden: Record<AreaId, number>) => void; onBack: () => void; showBack: boolean }): JSX.Element`. Each area is a labelled `<input type="range" min=0 max=max step=1>` defaulting to 0, with a live value readout; a single „Ergebnis zeigen" button calls `onSubmit` with the assembled record.

- [ ] **Step 1: Write the failing test**

Create `src/components/prozess-check/HoursGrid.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HoursGrid } from "./HoursGrid";
import { AREA_IDS, AREA_LABEL } from "@/lib/prozessCheck";

describe("HoursGrid", () => {
  it("renders one labelled slider per area, all starting at 0", () => {
    render(<HoursGrid label="Wo geht deine Zeit hin?" hint="h" max={10} onSubmit={() => {}} onBack={() => {}} showBack />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(AREA_IDS.length);
    for (const id of AREA_IDS) {
      expect(screen.getByLabelText(AREA_LABEL[id])).toHaveValue("0");
    }
  });

  it("submits the entered hours per area", () => {
    const onSubmit = vi.fn();
    render(<HoursGrid label="x" hint="h" max={10} onSubmit={onSubmit} onBack={() => {}} showBack={false} />);
    fireEvent.change(screen.getByLabelText(AREA_LABEL.rechnungen), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(AREA_LABEL.anfragen), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /Ergebnis zeigen/i }));
    expect(onSubmit).toHaveBeenCalledWith({ anfragen: 3, rechnungen: 5, daten: 0, erinnern: 0, orga: 0 });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/prozess-check/HoursGrid.test.tsx`
Expected: FAIL (component does not exist).

- [ ] **Step 3: Write the implementation**

Create `src/components/prozess-check/HoursGrid.tsx`:

```tsx
// src/components/prozess-check/HoursGrid.tsx
"use client";

import { useState } from "react";
import { AREA_IDS, AREA_LABEL, type AreaId } from "@/lib/prozessCheck";

const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-tiefes-wasser px-5 py-2.5 text-sm font-semibold text-papier transition-colors hover:bg-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";

const zeroState: Record<AreaId, number> = { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 };

// One accessible range slider per area. Native <input type=range> carries the
// slider role, keyboard support, and touch for free; we add a visible value
// readout tied to the label via aria. Default 0 is honest: "nothing here" is a
// valid answer and drives the zero-state result.
export function HoursGrid({
  label,
  hint,
  max,
  onSubmit,
  onBack,
  showBack,
}: {
  label: string;
  hint: string;
  max: number;
  onSubmit: (stunden: Record<AreaId, number>) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const [stunden, setStunden] = useState<Record<AreaId, number>>(zeroState);

  const setArea = (id: AreaId, value: number) => setStunden((prev) => ({ ...prev, [id]: value }));

  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{label}</h2>
      <p className="mt-2 text-sm text-stumm">{hint}</p>

      <ul className="mt-6 space-y-5">
        {AREA_IDS.map((id) => {
          const inputId = `pc-h-${id}`;
          const val = stunden[id];
          return (
            <li key={id}>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={inputId} className="text-tinte">
                  {AREA_LABEL[id]}
                </label>
                <span aria-hidden="true" className="shrink-0 font-medium text-tiefes-wasser">
                  {val === 1 ? "1 Std." : `${val} Std.`}
                </span>
              </div>
              <input
                id={inputId}
                type="range"
                min={0}
                max={max}
                step={1}
                value={val}
                onChange={(e) => setArea(id, Number(e.target.value))}
                aria-valuetext={`${val} Stunden pro Woche`}
                className="mt-2 w-full accent-vrelo-petrol"
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className={primaryBtn} onClick={() => onSubmit(stunden)}>
          Ergebnis zeigen
        </button>
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-stumm underline-offset-4 hover:text-tiefes-wasser hover:underline"
          >
            {"← Zurück"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/prozess-check/HoursGrid.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/prozess-check/HoursGrid.tsx src/components/prozess-check/HoursGrid.test.tsx
git commit -m "feat(prozess-check): accessible hours-slider grid for the five areas

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: Wizard + choice question (`ProzessCheck.tsx`, `Question.tsx`)

**Files:**
- Modify (full rewrite): `src/components/prozess-check/ProzessCheck.tsx`
- Modify (full rewrite): `src/components/prozess-check/Question.tsx`
- Test: `src/components/prozess-check/ProzessCheck.test.tsx` (rewrite the existing file)

**Interfaces:**
- Consumes (Tasks 1, 4): `STEPS`, `resultCopy`, `ProzessCheckAnswers`, `AreaId`, `HoursGrid`.
- Produces: `function ProzessCheck({ calLink }: { calLink: string | undefined }): JSX.Element` (unchanged prop shape). `function Question({ step, onAnswer, onBack, showBack })` where `step` is a `choice` step and `onAnswer(value: string)` advances.

- [ ] **Step 1: Write the failing test**

Replace `src/components/prozess-check/ProzessCheck.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProzessCheck } from "./ProzessCheck";
import { AREA_LABEL } from "@/lib/prozessCheck";

// The Cal embed is heavy and network-y; stub it so the wizard test stays a unit.
vi.mock("@/components/kontakt/SchedulerEmbed", () => ({
  SchedulerEmbed: () => <div data-testid="scheduler" />,
}));

function answerChoice(label: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name: label }));
}

describe("ProzessCheck wizard", () => {
  it("walks all steps and shows the hours result", () => {
    render(<ProzessCheck calLink="https://cal.eu/x" />);

    // Step 1 branche
    answerChoice("Handwerk");
    // Step 2 team
    answerChoice(/2 bis 5/);
    // Step 3 grid: set one slider, submit
    fireEvent.change(screen.getByLabelText(AREA_LABEL.rechnungen), { target: { value: "5" } });
    answerChoice(/Ergebnis zeigen/);
    // Step 4 nervt
    answerChoice(AREA_LABEL.rechnungen);
    // Step 5 abende
    answerChoice(/Ab und zu/);
    // Step 6 versucht
    answerChoice(/Noch nichts/);

    // Result: hours headline (5) + scheduler.
    expect(screen.getByText(/5 Stunden/)).toBeInTheDocument();
    expect(screen.getByTestId("scheduler")).toBeInTheDocument();
  });

  it("shows the honest zero-state when all sliders stay at 0", () => {
    render(<ProzessCheck calLink={undefined} />);
    answerChoice("Handwerk");
    answerChoice(/Ich allein/);
    answerChoice(/Ergebnis zeigen/); // grid untouched → all 0
    answerChoice(AREA_LABEL.anfragen);
    answerChoice(/^Nein$/);
    answerChoice(/Noch nichts/);
    expect(screen.getByText(/gerade noch nicht nötig/i)).toBeInTheDocument();
    expect(screen.queryByTestId("scheduler")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/prozess-check/ProzessCheck.test.tsx`
Expected: FAIL (old wizard shape; new steps not wired).

- [ ] **Step 3: Rewrite `Question.tsx`**

Replace `src/components/prozess-check/Question.tsx`:

```tsx
// src/components/prozess-check/Question.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import type { Step } from "@/lib/prozessCheck";

const optionClass =
  "w-full rounded-lg border border-vrelo-petrol/70 bg-gletscher/40 px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";

// Renders a single choice step. Choice clicks advance immediately (the parent
// appends the answer and moves on). The grid step is handled by the parent via
// HoursGrid, never here.
export function Question({
  step,
  onAnswer,
  onBack,
  showBack,
}: {
  step: Extract<Step, { kind: "choice" }>;
  onAnswer: (value: string) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const headingId = `pc-frage-${step.id}`;
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const isFirstRender = useRef(true);
  const [seenStepId, setSeenStepId] = useState(step.id);
  if (step.id !== seenStepId) setSeenStepId(step.id);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step.id]);

  return (
    <div>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="text-balance text-2xl font-semibold text-tiefes-wasser outline-none md:text-3xl"
      >
        {step.label}
      </h2>

      <ul role="group" aria-labelledby={headingId} className="mt-6 space-y-3">
        {step.options.map((o) => (
          <li key={o.value}>
            <button type="button" className={optionClass} onClick={() => onAnswer(o.value)}>
              {o.label}
            </button>
          </li>
        ))}
      </ul>

      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 text-sm text-stumm underline-offset-4 hover:text-tiefes-wasser hover:underline"
        >
          {"← Zurück"}
        </button>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 4: Rewrite `ProzessCheck.tsx`**

Replace `src/components/prozess-check/ProzessCheck.tsx`:

```tsx
// src/components/prozess-check/ProzessCheck.tsx
"use client";

import { useState } from "react";
import { STEPS, resultCopy, type ProzessCheckAnswers, type AreaId } from "@/lib/prozessCheck";
import { Question } from "./Question";
import { HoursGrid } from "./HoursGrid";
import { Result } from "./Result";

type PartialAnswers = Partial<Omit<ProzessCheckAnswers, "stunden">> & {
  stunden?: Record<AreaId, number>;
};

export function ProzessCheck({ calLink }: { calLink: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<PartialAnswers>({});

  if (index >= STEPS.length) {
    // Every step is required and advances on interaction, so answers are complete.
    const final: ProzessCheckAnswers = {
      branche: answers.branche ?? "anderes",
      team: answers.team ?? "allein",
      stunden: answers.stunden ?? { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 },
      nervt: answers.nervt ?? "anfragen",
      abende: answers.abende ?? "nein",
      versucht: answers.versucht ?? "nichts",
    };
    return <Result answers={final} copy={resultCopy(final)} calLink={calLink} />;
  }

  const step = STEPS[index];
  const advance = (patch: PartialAnswers) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setIndex((i) => i + 1);
  };
  const back = () => setIndex((i) => Math.max(0, i - 1));

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <p role="status" aria-live="polite" className="text-sm text-stumm">
        Frage {index + 1} von {STEPS.length}
      </p>
      <div className="mt-4">
        {step.kind === "grid" ? (
          <HoursGrid
            label={step.label}
            hint={step.hint}
            max={step.max}
            onSubmit={(stunden) => advance({ stunden })}
            onBack={back}
            showBack={index > 0}
          />
        ) : (
          <Question
            step={step}
            onAnswer={(value) => advance({ [step.id]: value } as PartialAnswers)}
            onBack={back}
            showBack={index > 0}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- src/components/prozess-check/ProzessCheck.test.tsx`
Expected: PASS. (Depends on Task 6's `Result` accepting `answers` + `copy` props — if building strictly in order, this task's test will fail to compile until Task 6 lands. Build Task 6 first if executing out of order, or stub `Result` temporarily. Recommended: execute Tasks 5 and 6 together, committing after Task 6's test passes.)

- [ ] **Step 6: Commit**

```bash
git add src/components/prozess-check/ProzessCheck.tsx src/components/prozess-check/Question.tsx src/components/prozess-check/ProzessCheck.test.tsx
git commit -m "feat(prozess-check): wizard over branche/team/grid/feeling steps

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 6: Result view + email form (`Result.tsx`, `ResultEmailForm.tsx`)

**Files:**
- Modify (full rewrite): `src/components/prozess-check/Result.tsx`
- Create: `src/components/prozess-check/ResultEmailForm.tsx`
- Test: `src/components/prozess-check/Result.test.tsx` (new)

**Interfaces:**
- Consumes (Tasks 1, 3): `ResultCopy`, `RESULT_UI`, `ProzessCheckAnswers`, `AREA_IDS`, `submitProzessCheckEmail`, `ProzessCheckEmailState`, `SchedulerEmbed`.
- Produces: `function Result({ answers, copy, calLink }: { answers: ProzessCheckAnswers; copy: ResultCopy; calLink: string | undefined }): JSX.Element`; `function ResultEmailForm({ answers }: { answers: ProzessCheckAnswers }): JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `src/components/prozess-check/Result.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Result } from "./Result";
import { resultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";

vi.mock("@/components/kontakt/SchedulerEmbed", () => ({
  SchedulerEmbed: () => <div data-testid="scheduler" />,
}));

const answers: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "6bis20",
  stunden: { anfragen: 3, rechnungen: 5, daten: 1, erinnern: 0, orga: 0 },
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("Result", () => {
  it("shows hours + top-area profile + scheduler + email form when fitting", () => {
    render(<Result answers={answers} copy={resultCopy(answers)} calLink="https://cal.eu/x" />);
    expect(screen.getByText(/9 Stunden/)).toBeInTheDocument();
    expect(screen.getByText(/Rechnungen, Belege/)).toBeInTheDocument();
    expect(screen.getByTestId("scheduler")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /mail/i })).toBeInTheDocument();
  });

  it("shows the soft exit and no scheduler on the zero-state", () => {
    const zero: ProzessCheckAnswers = { ...answers, stunden: { anfragen: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 } };
    render(<Result answers={zero} copy={resultCopy(zero)} calLink={undefined} />);
    expect(screen.queryByTestId("scheduler")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quelle/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/prozess-check/Result.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write `ResultEmailForm.tsx`**

Create `src/components/prozess-check/ResultEmailForm.tsx` (mirrors the `/lead-check` form; posts every answer as hidden fields so the Server Action recomputes server-side):

```tsx
// src/components/prozess-check/ResultEmailForm.tsx
"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { submitProzessCheckEmail, type ProzessCheckEmailState } from "@/app/prozess-check/actions";
import { AREA_IDS, type ProzessCheckAnswers } from "@/lib/prozessCheck";

const initial: ProzessCheckEmailState = { status: "idle" };

export function ResultEmailForm({ answers }: { answers: ProzessCheckAnswers }) {
  const [state, formAction, pending] = useActionState(submitProzessCheckEmail, initial);
  const [renderedAt] = useState(() => Date.now());

  const errorMsg =
    state.status === "invalid" ? state.error : state.status === "error" ? state.message : undefined;

  if (state.status === "ok") {
    return (
      <p role="status" className="text-gletscher">
        Danke. Deine Auswertung ist unterwegs.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input type="hidden" name="branche" value={answers.branche} />
      <input type="hidden" name="team" value={answers.team} />
      {AREA_IDS.map((id) => (
        <input key={id} type="hidden" name={`h_${id}`} value={answers.stunden[id]} />
      ))}
      <input type="hidden" name="nervt" value={answers.nervt} />
      <input type="hidden" name="abende" value={answers.abende} />
      <input type="hidden" name="versucht" value={answers.versucht} />
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <label htmlFor="pc-email" className="block text-sm text-gletscher">
        Auswertung per Mail
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="pc-email"
          name="email"
          type="email"
          placeholder="deine@mail.de"
          required
          aria-invalid={errorMsg != null}
          aria-describedby={`pc-email-hinweis${errorMsg ? " pc-email-err" : ""}`}
          className="min-w-[14rem] flex-1 rounded-md border border-papier/60 bg-tiefes-wasser/40 px-3 py-2 text-papier placeholder:text-gletscher/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
        >
          {pending ? "Wird gesendet …" : "Schicken"}
        </button>
      </div>

      <p id="pc-email-hinweis" className="text-sm text-gletscher/90">
        Du bekommst die Auswertung einmalig. Deine Antworten und deine Adresse sehe ich dabei mit.{" "}
        Details in der{" "}
        <Link href="/datenschutz" className="underline underline-offset-4 hover:text-papier">
          Datenschutzerklärung
        </Link>
        .
      </p>

      <label className="flex items-start gap-2 text-sm text-gletscher">
        <input id="pc-kontakt" type="checkbox" name="kontakt" className="mt-1" />
        <span>Du darfst dich bei mir melden.</span>
      </label>

      {errorMsg ? (
        <p id="pc-email-err" role="alert" className="text-sm text-signal">
          {errorMsg}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 4: Write `Result.tsx`**

Replace `src/components/prozess-check/Result.tsx`:

```tsx
// src/components/prozess-check/Result.tsx
"use client";

import Link from "next/link";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { RESULT_UI, type ResultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";
import { ResultEmailForm } from "./ResultEmailForm";

function hoursLabel(n: number): string {
  return n === 1 ? "1 Stunde" : `${n} Stunden`;
}

export function Result({
  answers,
  copy,
  calLink,
}: {
  answers: ProzessCheckAnswers;
  copy: ResultCopy;
  calLink: string | undefined;
}) {
  return (
    <div className="space-y-8">
      <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
        <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">{RESULT_UI.resultLabel}</h2>
        <p className="mt-3 text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">{copy.headline}</p>
        <p className="mt-3 text-pretty text-tinte">{copy.sub}</p>

        {copy.topAreas.length > 0 ? (
          <div className="mt-6">
            <p className="text-sm font-medium uppercase tracking-wider text-stumm">{RESULT_UI.profileLabel}</p>
            <ul className="mt-3 space-y-3">
              {copy.topAreas.map((a) => (
                <li key={a.id} className="rounded-lg border border-faden bg-gletscher/30 p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-tiefes-wasser">{a.label}</span>
                    <span className="shrink-0 text-stumm">{hoursLabel(a.hours)}/Woche</span>
                  </div>
                  <p className="mt-1 text-pretty text-sm text-tinte">{a.sentence}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-pretty text-tinte">
              {RESULT_UI.nervtPrefix}
              <span className="font-medium text-tiefes-wasser">{copy.nervtLabel}</span>.
            </p>
          </div>
        ) : null}

        <p className="mt-6 font-medium text-tiefes-wasser">{copy.verdict}</p>
      </div>

      {copy.fits ? (
        <div className="rounded-2xl bg-vrelo-petrol p-8 md:p-10">
          <p className="text-balance font-serif text-xl text-papier md:text-2xl">{RESULT_UI.schedulerPrompt}</p>
          <div className="mt-6">
            <SchedulerEmbed
              calLink={calLink}
              prompt=""
              fallbackHint={RESULT_UI.schedulerFallbackHint}
              fallbackHref="/kontakt"
            />
          </div>
          <div className="mt-8 border-t border-papier/20 pt-6">
            <p className="text-sm font-medium text-gletscher">{RESULT_UI.emailLabel}</p>
            <p className="mt-1 text-sm text-gletscher/90">{RESULT_UI.emailIntro}</p>
            <ResultEmailForm answers={answers} />
          </div>
        </div>
      ) : (
        <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
          <p className="text-pretty text-tinte">{RESULT_UI.exitLead}</p>
          <p className="mt-4 text-pretty text-tinte">
            {RESULT_UI.exitNewsletterPrefix}
            <Link href="/newsletter" className="text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser">
              {RESULT_UI.exitNewsletterLabel}
            </Link>
            {RESULT_UI.exitNewsletterSuffix}
            <Link href="/ratgeber" className="text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser">
              {RESULT_UI.exitRatgeberLabel}
            </Link>
            {RESULT_UI.exitSuffix}
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- src/components/prozess-check/Result.test.tsx src/components/prozess-check/ProzessCheck.test.tsx`
Expected: PASS (both Task 5 and Task 6 tests green now).

- [ ] **Step 6: Commit**

```bash
git add src/components/prozess-check/Result.tsx src/components/prozess-check/ResultEmailForm.tsx src/components/prozess-check/Result.test.tsx
git commit -m "feat(prozess-check): hours+profile result with scheduler and optional email

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 7: Page wiring (`page.tsx` + sitemap)

**Files:**
- Modify: `src/app/prozess-check/page.tsx`
- Modify: `src/app/sitemap.ts:8-18` (the `staticRoutes` array)

**Interfaces:**
- Consumes: `ProzessCheck` (Task 5), `calLink`.

- [ ] **Step 1: Update the page metadata + hero copy**

Replace `src/app/prozess-check/page.tsx`:

```tsx
// src/app/prozess-check/page.tsx
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ProzessCheck } from "@/components/prozess-check/ProzessCheck";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Prozess-Check",
  description:
    "In drei Minuten siehst du, wie viele Stunden pro Woche dich wiederkehrende Aufgaben kosten, und wo du am meisten Zeit zurückgewinnst. Kein Login, dein Ergebnis sofort.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/prozess-check" },
};

export default function ProzessCheckPage() {
  return (
    <>
      <PageHero
        title="Wie viel Zeit frisst der Kleinkram bei dir?"
        src="/images/lead-check-banner.webp"
        lead="Ein paar kurze Fragen, und du siehst schwarz auf weiß, wie viele Stunden pro Woche in Aufgaben gehen, die sich immer wiederholen, und wo du am meisten zurückholst. Kein Login, dein Ergebnis sofort."
      />
      {/* Same faint cool band as /lead-check so the warm paper card lifts off. */}
      <div className="-mt-10 bg-gletscher/30 md:-mt-12">
        <div className="mx-auto max-w-2xl px-6 pb-24 pt-4 md:pb-32 md:pt-6">
          <ProzessCheck calLink={calLink()} />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Add `/prozess-check` to the sitemap**

In `src/app/sitemap.ts`, add `"/prozess-check"` to the `staticRoutes` string array (after `"/leistungen"`):

```ts
  const staticRoutes = [
    "",
    "/leistungen",
    "/prozess-check",
    "/ueber-mich",
    "/faq",
    "/ratgeber",
    "/kontakt",
    "/impressum",
    "/datenschutz",
    "/newsletter",
  ].map((p) => ({
```

- [ ] **Step 3: Verify build + quote bytes**

Run: `npx tsc --noEmit` (expect clean) and the quote-byte check from Task 1 Step 5 against `src/app/prozess-check/page.tsx`.

- [ ] **Step 4: Commit**

```bash
git add src/app/prozess-check/page.tsx src/app/sitemap.ts
git commit -m "feat(prozess-check): index the page, new hero copy, add to sitemap

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 8: `/leistungen` card rewrite + homepage entry point

**Files:**
- Modify (full rewrite): `src/lib/prozess-audit.ts`
- Modify: `src/lib/prozess-audit.test.ts`
- Modify: `src/components/leistungen/ProzessAudit.tsx` (only if a field it reads is renamed — see below)
- Modify: `src/components/home/Referenzen.tsx:64` (the one homepage entry point)
- Modify: the home test asserting that href (`src/components/home/Referenzen.test.tsx` if present; otherwise the homepage test that references `#prozess-audit`)

**Interfaces:**
- Produces: `prozessAudit: ProzessAudit` with the same field names the `ProzessAudit.tsx` component already reads (`label`, `heading`, `body`, `deliverableLabel`, `deliverables`, `keepNote`, `guarantee`, `cta`, `check`). Keep the shape; change only the copy and the `cta.href`. This avoids touching the component.

- [ ] **Step 1: Read the component to confirm the fields it renders**

Run: `cat src/components/leistungen/ProzessAudit.tsx`. Confirm which of `label/heading/body/deliverableLabel/deliverables/keepNote/guarantee/cta/check` it renders. If it renders `guarantee` (the old Geld-zurück line) and you set it to empty, guard the render with a truthy check, or keep a non-price reassurance sentence. **Decision:** repurpose `guarantee` into the price-free reassurance line (below) so no component change is needed.

- [ ] **Step 2: Update the copy-guard test expectations**

In `src/lib/prozess-audit.test.ts`, ensure the corpus still fails on ASCII quotes, both dashes, and any currency token. Add an assertion that the CTA points to `/prozess-check`:

```ts
import { prozessAudit } from "./prozess-audit";
// ... existing corpus copy-guard asserts stay ...

it("routes the primary CTA to the free Prozess-Check funnel", () => {
  expect(prozessAudit.cta.href).toBe("/prozess-check");
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- src/lib/prozess-audit.test.ts`
Expected: FAIL on the new CTA assertion (href is currently `/kontakt`).

- [ ] **Step 4: Rewrite the card copy**

Replace `src/lib/prozess-audit.ts`:

```ts
// Public, price-free copy for the "Der Prozess-Audit" card on /leistungen.
// Since 2026-08-31 the audit is FREE, fed by the /prozess-check questionnaire
// (Prozess-Check-Funnel). The Fahrplan is price-free and travels; the price is
// named only in the call (HQ §4). No €499, no money-back guarantee, no handbook
// business-case line — those retired with the paid tripwire. Spec:
// Knowledge/marketing/prozess-check-funnel.md
export type ProzessAudit = {
  label: string;
  heading: string;
  body: string;
  deliverableLabel: string;
  deliverables: string[];
  keepNote: string;
  guarantee: string; // repurposed: price-free reassurance, not a money-back line
  cta: { label: string; href: string };
  check: { label: string; href: string };
};

export const prozessAudit: ProzessAudit = {
  label: "Nicht sicher, wo du anfangen sollst?",
  heading: "Der Prozess-Audit: Ich finde die eine Aufgabe, die dich am meisten kostet.",
  body: "Du merkst, dass Zeit und Anfragen durchrutschen, aber nicht genau wo. Wir sprechen 30 Minuten, kostenlos, und danach bekommst du einen Fahrplan: was sich bei dir automatisieren lässt und in welcher Reihenfolge. Der Fahrplan gehört dir. Ob du ihn selbst umsetzt, umsetzen lässt oder mit mir baust, entscheidest du danach.",
  deliverableLabel: "Das bekommst du",
  deliverables: [
    "Ein 30-minütiges Gespräch, in dem wir deine Abläufe durchgehen",
    "Deine Aufgaben, nach dem sortiert, was dich am meisten Zeit kostet",
    "Einen Fahrplan: welche Automatisierung zuerst, in welchen Schritten",
    "Eine klare Empfehlung für den ersten Schritt",
  ],
  keepNote: "Der Fahrplan gehört dir. Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen.",
  guarantee: "Der Prozess-Check und der Fahrplan kosten dich nichts. Was eine Umsetzung kosten würde, sagen wir dir im Gespräch.",
  cta: { label: "Zum kostenlosen Prozess-Check", href: "/prozess-check" },
  check: { label: "In drei Minuten siehst du, wo deine Zeit hingeht.", href: "/prozess-check" },
};
```

> If Step 1 showed the component renders both `cta` and `check` as two distinct links to the same `/prozess-check`, collapse them: keep `cta` as the button and change `check.label` to a supporting line, or drop the `check` link in the component. Prefer keeping both pointing to `/prozess-check` (one button, one text link) — no component edit needed.

- [ ] **Step 5: Repoint the homepage entry point**

In `src/components/home/Referenzen.tsx` line ~64, change the bridge href from `"/leistungen#prozess-audit"` to `"/prozess-check"`. Read the surrounding copy; if the link text says something like „Prozess-Audit ansehen", adjust it to „Mach den Prozess-Check" (German copy rules apply; verify quote bytes after). Update the matching assertion in the home test (search: `grep -rn "leistungen#prozess-audit" src`).

- [ ] **Step 6: Run the tests**

Run: `npm test -- src/lib/prozess-audit.test.ts src/components/home`
Expected: PASS.

- [ ] **Step 7: Verify quote bytes, then commit**

Run the quote-byte check against `src/lib/prozess-audit.ts` and `src/components/home/Referenzen.tsx`; repair if needed.

```bash
git add src/lib/prozess-audit.ts src/lib/prozess-audit.test.ts src/components/home/Referenzen.tsx src/components/home/Referenzen.test.tsx
git commit -m "feat(leistungen): rewrite audit card to the free funnel, point to /prozess-check

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 9: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Full test suite**

Run: `npm test`
Expected: PASS. In particular the old `prozessCheck` A/B/C/D tests are gone and no other test imports `categorize`/`severity` (search: `grep -rn "categorize\|severity" src` — should only match unrelated code, if any).

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: clean.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: success; `/prozess-check` builds as a static/dynamic route without error.

- [ ] **Step 5: Vault-wide German quote byte check**

Run across every file this branch touched:
```bash
for f in src/lib/prozessCheck.ts src/lib/prozessCheckEmail.ts src/app/prozess-check/actions.ts \
  src/components/prozess-check/HoursGrid.tsx src/components/prozess-check/Question.tsx \
  src/components/prozess-check/ProzessCheck.tsx src/components/prozess-check/Result.tsx \
  src/components/prozess-check/ResultEmailForm.tsx src/app/prozess-check/page.tsx \
  src/lib/prozess-audit.ts src/components/home/Referenzen.tsx; do
  perl -CSD -0777 -ne 'BEGIN{$f=$ARGV[0]} print "$f: BAD closing quote\n" while /\x{201E}[^\x{201E}\x{201C}]*\x{201D}/gs' "$f"
done
```
Expected: no output. Repair any `BAD` with the Global Constraints perl command.

- [ ] **Step 6: Manual smoke (optional but recommended)**

Run: `npm start`, open `/prozess-check`, walk the six steps, confirm the hours result renders, the scheduler band shows, and the zero-state (all sliders 0) shows the soft exit with no scheduler. Confirm `/leistungen` audit card CTA and the homepage bridge both land on `/prozess-check`.

- [ ] **Step 7: Finish the branch**

Use the `superpowers:finishing-a-development-branch` skill to merge `feat/prozess-check-funnel` to `main` (push → Vercel auto-deploys). Then update `Website/CLAUDE.md`: the `/prozess-check` design-system bullet (now the indexed hours+profile funnel, not the A/B/C/D qualifier) and the routes list (it is no longer noindex-only).

---

## Self-Review

**Spec coverage** (against `prozess-check-funnel.md` §3/§5 + the four forks):
- §3 questionnaire (10 questions, 3 blocks) → Task 1 `STEPS` (Betrieb ×2, hours grid = the 5 areas, feeling ×3). Frequency folded out per fork A. ✅
- §3 result (hours + ranked profile, never €) → Task 1 `resultCopy` + copy-guard; Task 6 render. ✅
- §3 zero-state honest message → Task 1 `fits:false` branch; Task 6 soft exit. ✅
- §3 ungated result, optional email, primary CTA = call → Task 6 (`SchedulerEmbed` primary, `ResultEmailForm` optional). ✅
- Fork A (grid + sliders) → Task 4. ✅
- Fork B (focus route, logo only) → unchanged `nav.ts` (already logo-only); noted in File Structure. ✅
- Fork C (full email: summary + internal) → Tasks 2, 3, 6. ✅
- Fork D (card rewrite + point to /prozess-check + one homepage entry, leave global CTA) → Task 8. ✅
- §5 index on + sitemap → Task 7. ✅
- §2 time-box / price-free Fahrplan framing (card copy) → Task 8 card body + guarantee line. ✅

**Placeholder scan:** every step carries real code or an exact command. The only conditional is Task 8 Step 1 (read the component first), which is a genuine verification step with a stated default (repurpose `guarantee`), not a placeholder. ✅

**Type consistency:** `ProzessCheckAnswers` (Task 1) is consumed unchanged by Tasks 2, 3, 5, 6. `resultCopy`/`ResultCopy` (Task 1) → Task 6. `evaluateSubmission`/`ProzessCheckFields` (Task 2) → Task 3. `submitProzessCheckEmail`/`ProzessCheckEmailState` (Task 3) → Task 6 form. `HoursGrid` `onSubmit(Record<AreaId,number>)` (Task 4) → Task 5 `advance({stunden})`. `Result({answers, copy, calLink})` (Task 6) matches the call in Task 5. `AREA_IDS` used by Tasks 2, 3, 6 is exported from Task 1. ✅

**Cross-task ordering note:** Tasks 5 and 6 are mutually referential (the wizard renders `Result`, whose new prop shape lands in Task 6). Execute them as a pair, committing after Task 6's tests pass (called out in Task 5 Step 5).
