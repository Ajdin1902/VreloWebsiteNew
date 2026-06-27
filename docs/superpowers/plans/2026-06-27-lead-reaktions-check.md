# Lead-Reaktions-Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/lead-check` — a 6-question interactive self-check that shows independent brokers, gain-led, the € upside of sub-5-minute lead response, bridging to the *Termin-Quelle* and a booked call.

**Architecture:** Pure logic core (`src/lib/leadCheck.ts` + `src/lib/leadCheckEmail.ts`, fully unit-tested, no React/IO) consumed by client components (`src/components/lead-check/*`) on a `noindex` route (`src/app/lead-check/page.tsx`). The optional email-capture mirrors the existing Kontakt Server Action → Resend exactly. The € math is recomputed server-side (never trust client numbers).

**Tech Stack:** Next.js 16 (App Router) · TypeScript · Tailwind v4 `@theme` tokens · Vitest + React Testing Library (jsdom) · Resend · `@calcom/embed-react`.

**Spec:** `docs/superpowers/specs/2026-06-27-lead-reaktions-check-design.md` — read it; all numbers and copy below come from it.

**Conventions (from CLAUDE.md):**
- German client copy; generic masculine; calm, no hype; „…" = U+201E/U+201C; spaced en-dash „ – " = U+2013. **After writing any file with German copy, byte-verify quotes** (the Edit tool downgrades closing „ to ASCII). Verify command appears in each copy task.
- Pure-core split: logic in `src/lib`, UI in `src/components`, never mix.
- Resend test mock MUST use a constructable `function` (Vitest v4) — see Task 4.
- AA tokens: on amber cards links = navy (`lightLinkClass`), errors = `text-signal-tief`; never `text-stein` on petrol.
- Run from the repo root `Website/`. Branch already exists: `feat/lead-reaktions-check`.

---

# Phase 1 — Pure logic core (no credentials, no React)

### Task 1: Types, constants, and question data

**Files:**
- Create: `src/lib/leadCheck.ts`
- Test: `src/lib/leadCheck.steps.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/leadCheck.steps.test.ts
import { describe, it, expect } from "vitest";
import { STEPS, DEFAULT_PROVISION } from "./leadCheck";

describe("STEPS", () => {
  it("has the 6 questions in order", () => {
    expect(STEPS.map((s) => s.id)).toEqual([
      "anfragenProWoche",
      "reaktionszeit",
      "abendsWochenende",
      "imTermin",
      "nachfassen",
      "provision",
    ]);
  });

  it("marks only the provision step optional, pre-filled with the default", () => {
    const provision = STEPS.find((s) => s.id === "provision");
    expect(provision).toMatchObject({ kind: "number", optional: true, defaultValue: DEFAULT_PROVISION });
    expect(STEPS.filter((s) => "optional" in s && s.optional)).toHaveLength(1);
  });

  it("gives every choice step at least two options", () => {
    for (const s of STEPS) {
      if (s.kind === "choice") expect(s.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/leadCheck.steps.test.ts`
Expected: FAIL — cannot resolve `./leadCheck`.

- [ ] **Step 3: Write the minimal implementation**

```ts
// src/lib/leadCheck.ts

export type Reaktionszeit = "unter5min" | "unter1std" | "selberTag" | "1bis2tage" | "wennZeit";
export type AbendsWochenende = "immer" | "manchmal" | "nein";
export type ImTermin = "automatisch" | "wartet" | "gehtUnter";
export type Nachfassen = "mehrmals" | "einmal" | "selten" | "nie";

export type LeadCheckAnswers = {
  anfragenProWoche: number;
  reaktionszeit: Reaktionszeit;
  abendsWochenende: AbendsWochenende;
  imTermin: ImTermin;
  nachfassen: Nachfassen;
  provision?: number;
};

export const DEFAULT_PROVISION = 4000;

type ChoiceOption<V extends string> = { value: V; label: string };

export type Step =
  | { id: "anfragenProWoche"; kind: "number"; label: string; placeholder: string; min: number }
  | {
      id: "provision";
      kind: "number";
      label: string;
      placeholder: string;
      min: number;
      optional: true;
      defaultValue: number;
      hint: string;
    }
  | { id: "reaktionszeit"; kind: "choice"; label: string; options: readonly ChoiceOption<Reaktionszeit>[] }
  | { id: "abendsWochenende"; kind: "choice"; label: string; options: readonly ChoiceOption<AbendsWochenende>[] }
  | { id: "imTermin"; kind: "choice"; label: string; options: readonly ChoiceOption<ImTermin>[] }
  | { id: "nachfassen"; kind: "choice"; label: string; options: readonly ChoiceOption<Nachfassen>[] };

export const STEPS: readonly Step[] = [
  {
    id: "anfragenProWoche",
    kind: "number",
    label: "Wie viele Anfragen bekommst du im Schnitt pro Woche?",
    placeholder: "z. B. 10",
    min: 0,
  },
  {
    id: "reaktionszeit",
    kind: "choice",
    label: "Wie schnell antwortest du typischerweise auf eine neue Anfrage?",
    options: [
      { value: "unter5min", label: "unter 5 Minuten" },
      { value: "unter1std", label: "unter 1 Stunde" },
      { value: "selberTag", label: "am selben Tag" },
      { value: "1bis2tage", label: "1–2 Tage" },
      { value: "wennZeit", label: "wenn ich dazu komme" },
    ],
  },
  {
    id: "abendsWochenende",
    kind: "choice",
    label: "Bekommt eine Anfrage auch abends und am Wochenende eine Antwort?",
    options: [
      { value: "immer", label: "immer" },
      { value: "manchmal", label: "manchmal" },
      { value: "nein", label: "nein" },
    ],
  },
  {
    id: "imTermin",
    kind: "choice",
    label: "Was passiert mit einer Anfrage, während du im Termin sitzt?",
    options: [
      { value: "automatisch", label: "wird automatisch beantwortet" },
      { value: "wartet", label: "wartet, bis ich Zeit habe" },
      { value: "gehtUnter", label: "geht manchmal unter" },
    ],
  },
  {
    id: "nachfassen",
    kind: "choice",
    label: "Wie oft fasst du bei jemandem nach, der sich nicht meldet?",
    options: [
      { value: "mehrmals", label: "mehrmals, systematisch" },
      { value: "einmal", label: "einmal" },
      { value: "selten", label: "selten" },
      { value: "nie", label: "nie" },
    ],
  },
  {
    id: "provision",
    kind: "number",
    label: "Was ist dir ein abgeschlossener Kunde im Schnitt wert?",
    placeholder: "4000",
    min: 0,
    optional: true,
    defaultValue: DEFAULT_PROVISION,
    hint: "Wir rechnen mit dem Branchenschnitt. Ist dein Schnitt anders? Hier anpassen.",
  },
];
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/lib/leadCheck.steps.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Verify German typography (the `1–2 Tage` uses the en-dash escape, so this is just a sanity check)**

Run: `node -e "const s=require('fs').readFileSync('src/lib/leadCheck.ts','utf8'); console.log('ASCII-quote in copy:', /\"[A-Za-zäöü]/.test(s) ? 'CHECK' : 'none')"`
Expected: `none` (all German strings use single-quoted TS literals or escapes, no ASCII double-quotes inside copy).

- [ ] **Step 6: Commit**

```bash
git add src/lib/leadCheck.ts src/lib/leadCheck.steps.test.ts
git commit -m "feat(lead-check): types, constants, and question data

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: `computeResult` — the scoring model

**Files:**
- Modify: `src/lib/leadCheck.ts` (append)
- Test: `src/lib/leadCheck.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/leadCheck.test.ts
import { describe, it, expect } from "vitest";
import { computeResult, type LeadCheckAnswers } from "./leadCheck";

const base: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};

describe("computeResult", () => {
  it("matches the worked example", () => {
    const r = computeResult(base);
    expect(r.currentLossPct).toBe(50);
    expect(r.score).toBe("langsam");
    expect(r.anfragenProJahr).toBe(520);
    expect(r.verloreneAnfragenProJahr).toBe(260);
    expect(r.recoverableTermine).toBe(208);
    expect(r.zusaetzlicheAbschluesse).toBe(42);
    expect(r.eurUpside).toBe(168000);
  });

  it("floors loss at 10% for the fully-fast profile (no invented upside)", () => {
    const r = computeResult({
      anfragenProWoche: 10,
      reaktionszeit: "unter5min",
      abendsWochenende: "immer",
      imTermin: "automatisch",
      nachfassen: "mehrmals",
    });
    expect(r.currentLossPct).toBe(10);
    expect(r.score).toBe("schnell");
    expect(r.recoverableTermine).toBe(0);
    expect(r.eurUpside).toBe(0);
  });

  it("caps current loss at 85%", () => {
    const r = computeResult({
      anfragenProWoche: 10,
      reaktionszeit: "wennZeit", // 0.75
      abendsWochenende: "nein", // +0.10
      imTermin: "gehtUnter", // +0.10
      nachfassen: "nie", // +0.10  → 1.05 capped to 0.85
    });
    expect(r.currentLossPct).toBe(85);
  });

  it("defaults provision to 4000 and flags it", () => {
    const r = computeResult({ ...base, provision: undefined });
    expect(r.provisionUsed).toBe(4000);
    expect(r.provisionWasDefault).toBe(true);
  });

  it("uses a supplied provision without the default flag", () => {
    const r = computeResult({ ...base, provision: 6000 });
    expect(r.provisionUsed).toBe(6000);
    expect(r.provisionWasDefault).toBe(false);
    expect(r.eurUpside).toBe(42 * 6000);
  });

  it("clamps absurd request volume to 200/week before computing", () => {
    const r = computeResult({ ...base, anfragenProWoche: 5000 });
    expect(r.anfragenProJahr).toBe(200 * 52);
  });

  it("returns all-zero, no NaN, for zero requests", () => {
    const r = computeResult({ ...base, anfragenProWoche: 0 });
    expect(r.anfragenProJahr).toBe(0);
    expect(r.verloreneAnfragenProJahr).toBe(0);
    expect(r.eurUpside).toBe(0);
    expect(Number.isNaN(r.eurUpside)).toBe(false);
  });

  it("sets score bands at the boundaries", () => {
    // loss 0.20 → schnell; 0.21+ → solide; 0.45 → solide; >0.45 → langsam
    const fast = computeResult({ anfragenProWoche: 1, reaktionszeit: "unter1std", abendsWochenende: "immer", imTermin: "automatisch", nachfassen: "selten" }); // 0.25+0.05=0.30 solide
    expect(fast.score).toBe("solide");
    const schnell = computeResult({ anfragenProWoche: 1, reaktionszeit: "unter5min", abendsWochenende: "manchmal", imTermin: "automatisch", nachfassen: "einmal" }); // 0.10+0.05=0.15 schnell
    expect(schnell.score).toBe("schnell");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/leadCheck.test.ts`
Expected: FAIL — `computeResult` is not exported.

- [ ] **Step 3: Append the implementation to `src/lib/leadCheck.ts`**

```ts
// --- scoring model (append to src/lib/leadCheck.ts) ---

export type Score = "schnell" | "solide" | "langsam";

export type LeadCheckResult = {
  currentLossPct: number;
  score: Score;
  anfragenProJahr: number;
  verloreneAnfragenProJahr: number;
  recoverableTermine: number;
  zusaetzlicheAbschluesse: number;
  eurUpside: number;
  provisionUsed: number;
  provisionWasDefault: boolean;
};

export const ACHIEVABLE_LOSS = 0.1;
export const CLOSE_RATE = 0.2;
const MAX_ANFRAGEN = 200;
const MIN_PROVISION = 100;
const MAX_PROVISION = 1_000_000;

const BASE_LOSS: Record<Reaktionszeit, number> = {
  unter5min: 0.1,
  unter1std: 0.25,
  selberTag: 0.4,
  "1bis2tage": 0.6,
  wennZeit: 0.75,
};
const ABENDS_MOD: Record<AbendsWochenende, number> = { immer: 0, manchmal: 0.05, nein: 0.1 };
const TERMIN_MOD: Record<ImTermin, number> = { automatisch: 0, wartet: 0.05, gehtUnter: 0.1 };
const NACHFASS_MOD: Record<Nachfassen, number> = { mehrmals: -0.1, einmal: 0, selten: 0.05, nie: 0.1 };

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

export function computeResult(a: LeadCheckAnswers): LeadCheckResult {
  const anfragenWoche = clamp(Number.isFinite(a.anfragenProWoche) ? a.anfragenProWoche : 0, 0, MAX_ANFRAGEN);
  const provisionWasDefault = a.provision == null || !Number.isFinite(a.provision);
  const provisionUsed = provisionWasDefault
    ? DEFAULT_PROVISION
    : clamp(a.provision as number, MIN_PROVISION, MAX_PROVISION);

  const rawLoss =
    BASE_LOSS[a.reaktionszeit] + ABENDS_MOD[a.abendsWochenende] + TERMIN_MOD[a.imTermin] + NACHFASS_MOD[a.nachfassen];
  const currentLoss = clamp(rawLoss, 0.1, 0.85);

  const anfragenProJahr = Math.round(anfragenWoche * 52);
  const verloreneAnfragenProJahr = Math.round(anfragenProJahr * currentLoss);
  const recoverableShare = Math.max(0, currentLoss - ACHIEVABLE_LOSS);
  const recoverableTermine = Math.round(anfragenProJahr * recoverableShare);
  const zusaetzlicheAbschluesse = Math.round(recoverableTermine * CLOSE_RATE);
  const eurUpside = zusaetzlicheAbschluesse * provisionUsed;

  const score: Score = currentLoss <= 0.2 ? "schnell" : currentLoss <= 0.45 ? "solide" : "langsam";

  return {
    currentLossPct: Math.round(currentLoss * 100),
    score,
    anfragenProJahr,
    verloreneAnfragenProJahr,
    recoverableTermine,
    zusaetzlicheAbschluesse,
    eurUpside,
    provisionUsed,
    provisionWasDefault,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/lib/leadCheck.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/leadCheck.ts src/lib/leadCheck.test.ts
git commit -m "feat(lead-check): computeResult scoring model

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Email payload core (`leadCheckEmail.ts`)

**Files:**
- Create: `src/lib/leadCheckEmail.ts`
- Test: `src/lib/leadCheckEmail.test.ts`

Reuses `isHoneypotTripped` / `isTooFast` from `src/lib/contact.ts` (DRY).

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/leadCheckEmail.test.ts
import { describe, it, expect } from "vitest";
import { evaluateLeadCheckSubmission, type LeadCheckFields } from "./leadCheckEmail";
import type { LeadCheckAnswers } from "./leadCheck";

const answers: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};

const good: LeadCheckFields = { email: "makler@example.de", honeypot: "", renderedAt: 0, answers };

describe("evaluateLeadCheckSubmission", () => {
  it("drops a honeypot hit", () => {
    expect(evaluateLeadCheckSubmission({ ...good, honeypot: "x" }, 999999).action).toBe("drop");
  });

  it("rejects a too-fast submission", () => {
    const d = evaluateLeadCheckSubmission({ ...good, renderedAt: 1000 }, 1500); // < 3000ms
    expect(d.action).toBe("reject");
  });

  it("flags an invalid email", () => {
    const d = evaluateLeadCheckSubmission({ ...good, email: "nope" }, 999999);
    expect(d.action).toBe("invalid");
  });

  it("builds the email with the recomputed result and answers", () => {
    const d = evaluateLeadCheckSubmission(good, 999999);
    expect(d.action).toBe("send");
    if (d.action === "send") {
      expect(d.email.replyTo).toBe("makler@example.de");
      expect(d.email.text).toContain("Score: langsam");
      expect(d.email.text).toContain("168000");
      expect(d.email.text).toContain("Reaktionszeit: selberTag");
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/leadCheckEmail.test.ts`
Expected: FAIL — cannot resolve `./leadCheckEmail`.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/leadCheckEmail.ts
import { isHoneypotTripped, isTooFast } from "./contact";
import { computeResult, type LeadCheckAnswers, type LeadCheckResult } from "./leadCheck";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadCheckEmail(email: string): string | undefined {
  if (!EMAIL_RE.test(email.trim())) return "Bitte gib eine gültige E-Mail-Adresse an.";
  return undefined;
}

export type LeadCheckEmail = { subject: string; text: string; replyTo: string };

export function buildLeadCheckEmail(p: {
  email: string;
  answers: LeadCheckAnswers;
  result: LeadCheckResult;
}): LeadCheckEmail {
  const { email, answers, result } = p;
  const lines = [
    `E-Mail: ${email.trim()}`,
    "",
    "Antworten:",
    `Anfragen/Woche: ${answers.anfragenProWoche}`,
    `Reaktionszeit: ${answers.reaktionszeit}`,
    `Abends/Wochenende: ${answers.abendsWochenende}`,
    `Im Termin: ${answers.imTermin}`,
    `Nachfassen: ${answers.nachfassen}`,
    `Provision: ${result.provisionUsed}${result.provisionWasDefault ? " (Standard)" : ""}`,
    "",
    "Ergebnis:",
    `Score: ${result.score}`,
    `Aktueller Verlust: ${result.currentLossPct}%`,
    `Verlorene Anfragen/Jahr: ${result.verloreneAnfragenProJahr}`,
    `Zusaetzliche Abschluesse/Jahr: ${result.zusaetzlicheAbschluesse}`,
    `Euro-Potenzial/Jahr: ${result.eurUpside}`,
  ];
  return { subject: "Neuer Lead-Reaktions-Check", text: lines.join("\n"), replyTo: email.trim() };
}

export type LeadCheckFields = {
  email: string;
  honeypot: string;
  renderedAt: number;
  answers: LeadCheckAnswers;
};

export type LeadCheckDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | { action: "send"; email: LeadCheckEmail };

export function evaluateLeadCheckSubmission(f: LeadCheckFields, now: number): LeadCheckDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const emailErr = validateLeadCheckEmail(f.email);
  if (emailErr) return { action: "invalid", error: emailErr };
  const result = computeResult(f.answers);
  return { action: "send", email: buildLeadCheckEmail({ email: f.email, answers: f.answers, result }) };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/lib/leadCheckEmail.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/leadCheckEmail.ts src/lib/leadCheckEmail.test.ts
git commit -m "feat(lead-check): email payload + submission evaluation core

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

# Phase 2 — Server Action, components, route

### Task 4: Optional-email Server Action

**Files:**
- Create: `src/app/lead-check/actions.ts`
- Test: `src/app/lead-check/actions.test.ts`

Mirrors `src/app/kontakt/actions.ts`. The form posts the 6 answers as hidden fields; the action parses + re-evaluates (server recomputes the € math).

- [ ] **Step 1: Write the failing test**

```ts
// src/app/lead-check/actions.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  // constructable function — Vitest v4 requires `new Resend()` to work
  Resend: vi.fn(function (this: { emails: { send: typeof send } }) {
    this.emails = { send };
  }),
}));

import { submitLeadCheckEmail, type LeadCheckEmailState } from "./actions";

function fd(fields: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(fields)) f.set(k, v);
  return f;
}

const initial: LeadCheckEmailState = { status: "idle" };
const good = {
  email: "makler@example.de",
  website: "",
  renderedAt: "0",
  anfragenProWoche: "10",
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: "4000",
};

beforeEach(() => {
  send.mockReset().mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_FROM", "Vrelo <kontakt@example.de>");
  vi.stubEnv("CONTACT_TO", "hallo@example.de");
});
afterEach(() => vi.unstubAllEnvs());

describe("submitLeadCheckEmail", () => {
  it("sends via Resend on a clean submission", async () => {
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("ok");
    expect(send).toHaveBeenCalledTimes(1);
    const arg = send.mock.calls[0][0];
    expect(arg.to).toBe("hallo@example.de");
    expect(arg.replyTo).toBe("makler@example.de");
    expect(arg.text).toContain("Score: langsam");
  });

  it("silently succeeds without sending on a honeypot hit", async () => {
    const r = await submitLeadCheckEmail(initial, fd({ ...good, website: "spam" }));
    expect(r.status).toBe("ok");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns invalid on a bad email and does not send", async () => {
    const r = await submitLeadCheckEmail(initial, fd({ ...good, email: "nope" }));
    expect(r.status).toBe("invalid");
    expect(send).not.toHaveBeenCalled();
  });

  it("returns error when Resend resolves an error object", async () => {
    send.mockResolvedValueOnce({ data: null, error: { name: "x", message: "bad" } });
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
  });

  it("reports not-configured when env is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const r = await submitLeadCheckEmail(initial, fd(good));
    expect(r.status).toBe("error");
    expect(send).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/app/lead-check/actions.test.ts`
Expected: FAIL — cannot resolve `./actions`.

- [ ] **Step 3: Write the implementation**

```ts
// src/app/lead-check/actions.ts
"use server";

import { Resend } from "resend";
import { isContactConfigured, contactFrom, contactTo, resendKey } from "@/lib/contact";
import { evaluateLeadCheckSubmission, type LeadCheckFields } from "@/lib/leadCheckEmail";
import type {
  LeadCheckAnswers,
  Reaktionszeit,
  AbendsWochenende,
  ImTermin,
  Nachfassen,
} from "@/lib/leadCheck";

export type LeadCheckEmailState =
  | { status: "idle" }
  | { status: "ok" }
  | { status: "error"; message: string }
  | { status: "invalid"; error: string };

const GENERIC_ERROR = "Da ist etwas schiefgelaufen. Schreib mir gern direkt.";

function parse(formData: FormData): LeadCheckFields {
  const get = (k: string) => String(formData.get(k) ?? "");
  const provisionRaw = get("provision");
  const answers: LeadCheckAnswers = {
    anfragenProWoche: Number(get("anfragenProWoche")) || 0,
    reaktionszeit: get("reaktionszeit") as Reaktionszeit,
    abendsWochenende: get("abendsWochenende") as AbendsWochenende,
    imTermin: get("imTermin") as ImTermin,
    nachfassen: get("nachfassen") as Nachfassen,
    provision: provisionRaw ? Number(provisionRaw) : undefined,
  };
  return {
    email: get("email"),
    honeypot: get("website"),
    renderedAt: Number(get("renderedAt")) || 0,
    answers,
  };
}

export async function submitLeadCheckEmail(
  _prev: LeadCheckEmailState,
  formData: FormData,
): Promise<LeadCheckEmailState> {
  const decision = evaluateLeadCheckSubmission(parse(formData), Date.now());

  if (decision.action === "drop") return { status: "ok" };
  if (decision.action === "reject") return { status: "error", message: decision.message };
  if (decision.action === "invalid") return { status: "invalid", error: decision.error };

  if (!isContactConfigured()) {
    return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
  }

  try {
    const resend = new Resend(resendKey());
    const { error } = await resend.emails.send({
      from: contactFrom()!,
      to: contactTo()!,
      replyTo: decision.email.replyTo,
      subject: decision.email.subject,
      text: decision.email.text,
    });
    if (error) return { status: "error", message: GENERIC_ERROR };
    return { status: "ok" };
  } catch {
    return { status: "error", message: GENERIC_ERROR };
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/app/lead-check/actions.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/app/lead-check/actions.ts src/app/lead-check/actions.test.ts
git commit -m "feat(lead-check): optional-email Server Action (Resend)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: `Question` component (one step)

**Files:**
- Create: `src/components/lead-check/Question.tsx`
- Test: `src/components/lead-check/Question.test.tsx`

Renders one `Step`: a choice list (click a button → `onAnswer(value)`) or a number input with a „Weiter" button (and „Überspringen" when optional). Keyboard-accessible buttons.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/lead-check/Question.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Question } from "./Question";
import { STEPS } from "@/lib/leadCheck";

const choiceStep = STEPS.find((s) => s.id === "reaktionszeit")!;
const numberStep = STEPS.find((s) => s.id === "anfragenProWoche")!;
const optionalStep = STEPS.find((s) => s.id === "provision")!;

describe("Question", () => {
  it("renders choice options and reports the chosen value", () => {
    const onAnswer = vi.fn();
    render(<Question step={choiceStep} onAnswer={onAnswer} onBack={vi.fn()} showBack={false} />);
    fireEvent.click(screen.getByRole("button", { name: "am selben Tag" }));
    expect(onAnswer).toHaveBeenCalledWith("selberTag");
  });

  it("reports a parsed number from the number step", () => {
    const onAnswer = vi.fn();
    render(<Question step={numberStep} onAnswer={onAnswer} onBack={vi.fn()} showBack={false} />);
    fireEvent.change(screen.getByLabelText(numberStep.label), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(onAnswer).toHaveBeenCalledWith(12);
  });

  it("offers Überspringen on the optional step and reports undefined", () => {
    const onAnswer = vi.fn();
    render(<Question step={optionalStep} onAnswer={onAnswer} onBack={vi.fn()} showBack />);
    fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
    expect(onAnswer).toHaveBeenCalledWith(undefined);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/lead-check/Question.test.tsx`
Expected: FAIL — cannot resolve `./Question`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/lead-check/Question.tsx
"use client";

import { useState } from "react";
import type { Step } from "@/lib/leadCheck";

const optionClass =
  "w-full rounded-lg border border-tiefes-wasser/20 bg-papier px-4 py-3 text-left text-tinte transition-colors hover:border-vrelo-petrol hover:bg-gletscher/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier";
const primaryBtn =
  "inline-flex items-center justify-center rounded-lg bg-tiefes-wasser px-5 py-2.5 text-sm font-semibold text-papier transition-colors hover:bg-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";
const ghostBtn =
  "inline-flex items-center justify-center rounded-lg border border-stein px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-tiefes-wasser";

// onAnswer receives the typed value for a choice step, a number for a number
// step, or `undefined` when an optional step is skipped (caller applies default).
export function Question({
  step,
  onAnswer,
  onBack,
  showBack,
}: {
  step: Step;
  onAnswer: (value: string | number | undefined) => void;
  onBack: () => void;
  showBack: boolean;
}) {
  const isOptional = step.kind === "number" && "optional" in step && step.optional === true;
  const [num, setNum] = useState<string>("");
  const inputId = `lc-${step.id}`;

  return (
    <div>
      <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{step.label}</h2>

      {step.kind === "choice" ? (
        <ul className="mt-6 space-y-3">
          {step.options.map((o) => (
            <li key={o.value}>
              <button type="button" className={optionClass} onClick={() => onAnswer(o.value)}>
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6">
          <label htmlFor={inputId} className="sr-only">
            {step.label}
          </label>
          <input
            id={inputId}
            type="number"
            inputMode="numeric"
            min={step.min}
            placeholder={step.placeholder}
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className="w-full rounded-md border border-tiefes-wasser/20 bg-papier px-3 py-2 text-tinte focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
          />
          {isOptional && "hint" in step ? <p className="mt-2 text-sm text-stumm">{step.hint}</p> : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={primaryBtn} onClick={() => onAnswer(num === "" ? undefined : Number(num))}>
              Weiter
            </button>
            {isOptional ? (
              <button type="button" className={ghostBtn} onClick={() => onAnswer(undefined)}>
                {"Überspringen"}
              </button>
            ) : null}
          </div>
        </div>
      )}

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

> Note on the optional number step: on „Weiter" with an empty field it reports `undefined` (caller applies the €4.000 default) — same as „Überspringen". Filling a value reports the number.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/lead-check/Question.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/lead-check/Question.tsx src/components/lead-check/Question.test.tsx
git commit -m "feat(lead-check): Question step component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: `Result` + `ResultEmailForm`

**Files:**
- Create: `src/components/lead-check/ResultEmailForm.tsx`
- Create: `src/components/lead-check/Result.tsx`
- Test: `src/components/lead-check/Result.test.tsx`

`Result` is gain-led: € headline, score badge, loss as context, „Wie wir rechnen" disclosure, tips, bridge, primary CTA = `SchedulerEmbed`, secondary = `ResultEmailForm`. Uses `de-DE` number formatting and `BrandWord` for *Termin-Quelle*.

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/lead-check/Result.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Result } from "./Result";
import { computeResult, type LeadCheckAnswers } from "@/lib/leadCheck";

const langsam: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};
const schnell: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "unter5min",
  abendsWochenende: "immer",
  imTermin: "automatisch",
  nachfassen: "mehrmals",
};

describe("Result", () => {
  it("leads with the € upside for a slow profile", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    // de-DE formats 168000 as 168.000
    expect(screen.getByText(/168\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Deine Lead-Reaktion/)).toBeInTheDocument();
  });

  it("does not invent a € promise for an already-fast profile", () => {
    render(<Result answers={schnell} result={computeResult(schnell)} calLink={undefined} />);
    expect(screen.getByText(/schon schnell/)).toBeInTheDocument();
  });

  it("shows the calculation disclosure", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    expect(screen.getByText(/Wie wir rechnen/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/lead-check/Result.test.tsx`
Expected: FAIL — cannot resolve `./Result`.

- [ ] **Step 3a: Write `ResultEmailForm.tsx`**

```tsx
// src/components/lead-check/ResultEmailForm.tsx
"use client";

import { useActionState, useState } from "react";
import { submitLeadCheckEmail, type LeadCheckEmailState } from "@/app/lead-check/actions";
import type { LeadCheckAnswers } from "@/lib/leadCheck";

const initial: LeadCheckEmailState = { status: "idle" };

// Posts the answers as hidden fields so the Server Action recomputes the result
// server-side (never trusts client math). The whole block is optional capture.
export function ResultEmailForm({ answers }: { answers: LeadCheckAnswers }) {
  const [state, formAction, pending] = useActionState(submitLeadCheckEmail, initial);
  const [renderedAt] = useState(() => Date.now());

  if (state.status === "ok") {
    return <p className="text-gletscher">Danke {"–"} die Zusammenfassung ist unterwegs.</p>;
  }

  return (
    <form action={formAction} className="mt-4 space-y-3" noValidate>
      <input type="hidden" name="renderedAt" value={renderedAt} />
      <input type="hidden" name="anfragenProWoche" value={answers.anfragenProWoche} />
      <input type="hidden" name="reaktionszeit" value={answers.reaktionszeit} />
      <input type="hidden" name="abendsWochenende" value={answers.abendsWochenende} />
      <input type="hidden" name="imTermin" value={answers.imTermin} />
      <input type="hidden" name="nachfassen" value={answers.nachfassen} />
      {answers.provision != null ? <input type="hidden" name="provision" value={answers.provision} /> : null}
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} aria-hidden="true" autoComplete="off" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <label htmlFor="lc-email" className="block text-sm text-gletscher">
        Zusammenfassung per Mail {"–"} und ich melde mich, wenn du magst.
      </label>
      <div className="flex flex-wrap gap-3">
        <input
          id="lc-email"
          name="email"
          type="email"
          placeholder="deine@mail.de"
          className="min-w-[14rem] flex-1 rounded-md border border-papier/30 bg-tiefes-wasser/40 px-3 py-2 text-papier placeholder:text-gletscher/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
        >
          {pending ? "Wird gesendet …" : "Schicken"}
        </button>
      </div>
      {state.status === "invalid" ? <p className="text-sm text-signal">{state.error}</p> : null}
      {state.status === "error" ? <p className="text-sm text-signal">{state.message}</p> : null}
    </form>
  );
}
```

- [ ] **Step 3b: Write `Result.tsx`**

```tsx
// src/components/lead-check/Result.tsx
"use client";

import { withBrandWords } from "@/components/BrandWord";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { ResultEmailForm } from "./ResultEmailForm";
import type { LeadCheckAnswers, LeadCheckResult } from "@/lib/leadCheck";

const eur = (n: number) => new Intl.NumberFormat("de-DE").format(n);

const SCORE_LABEL: Record<LeadCheckResult["score"], string> = {
  schnell: "schnell",
  solide: "solide",
  langsam: "langsam",
};

export function Result({
  answers,
  result,
  calLink,
}: {
  answers: LeadCheckAnswers;
  result: LeadCheckResult;
  calLink: string | undefined;
}) {
  const fast = result.score === "schnell";

  return (
    <div className="space-y-10">
      {/* Score badge */}
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">
        Deine Lead-Reaktion: <span className="text-tiefes-wasser">{SCORE_LABEL[result.score]}</span>
      </p>

      {/* Gain-led headline */}
      {fast ? (
        <p className="text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">
          {withBrandWords(
            "Du reagierst schon schnell. Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.",
          )}
        </p>
      ) : (
        <div>
          <p className="text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">
            Mit einer Antwort in unter 5 Minuten wären bei dir rund{" "}
            <strong>{result.zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr</strong> drin {"–"} ca.{" "}
            <strong>{eur(result.eurUpside)} €</strong>. Ohne eine einzige neue Anfrage.
          </p>
          {result.provisionWasDefault ? (
            <p className="mt-3 text-sm text-stumm">
              Gerechnet mit 4.000 € pro Abschluss {"–"} passt du den Wert an, wird die Schätzung
              genauer.
            </p>
          ) : null}
        </div>
      )}

      {/* Loss as context (smaller) */}
      {!fast ? (
        <p className="text-tinte">
          Aktuell werden rund {result.currentLossPct} % deiner Anfragen kalt, bevor daraus ein Termin wird {"–"}{" "}
          das sind ca. {result.verloreneAnfragenProJahr} im Jahr.
        </p>
      ) : null}

      {/* Calculation disclosure */}
      <details className="rounded-lg border border-tiefes-wasser/15 bg-gletscher/30 p-4">
        <summary className="cursor-pointer text-sm font-medium text-tiefes-wasser">Wie wir rechnen</summary>
        <p className="mt-3 text-sm text-tinte">
          Grundlage ist die Lead-Response-Forschung (HBR/InsideSales): nach der Fünf-Minuten-Marke fällt die
          Chance, einen Lead zu erreichen und zu qualifizieren, um rund das Acht- bis Zehnfache. Wir rechnen bewusst
          konservativ {"–"} und selbst dann, wenn nur jeder fünfte zurückgeholte Termin zum Abschluss
          wird.
        </p>
      </details>

      {/* Quick DIY tips */}
      <div>
        <h3 className="text-lg font-semibold text-tiefes-wasser">Drei Dinge, die du sofort tun kannst</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-tinte">
          <li>Eine feste Fünf-Minuten-Regel für neue Anfragen.</li>
          <li>Eine einfache Auto-Antwort, die sofort bestätigt.</li>
          <li>Eine feste Nachfass-Routine für alle, die sich nicht melden.</li>
        </ul>
        <p className="mt-3 text-sm text-stumm">
          Das Schwere ist, das <strong>konsequent</strong> zu tun {"–"} nachts, im Termin, bei jeder Anfrage.
        </p>
      </div>

      {/* Bridge + CTA on petrol water */}
      <div className="rounded-2xl bg-vrelo-petrol p-8 md:p-10">
        <p className="text-balance font-serif text-xl text-papier md:text-2xl">
          {withBrandWords(
            "Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.",
          )}
        </p>
        <div className="mt-6">
          <SchedulerEmbed calLink={calLink} />
        </div>
        <div className="mt-8 border-t border-papier/15 pt-6">
          <ResultEmailForm answers={answers} />
        </div>
      </div>
    </div>
  );
}
```

> The headline strings contain `–` (en-dash) and ` `/` ` (non-breaking / narrow no-break spaces before €/%). These are intentional and survive as escapes — no byte-verification needed because they are not literal „…" quotes.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/lead-check/Result.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/lead-check/Result.tsx src/components/lead-check/ResultEmailForm.tsx src/components/lead-check/Result.test.tsx
git commit -m "feat(lead-check): gain-led Result + optional email capture

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: `LeadCheck` orchestrator

**Files:**
- Create: `src/components/lead-check/LeadCheck.tsx`
- Test: `src/components/lead-check/LeadCheck.test.tsx`

Holds step index + accumulated answers; renders `Question` per step; on the last answer computes the result and renders `Result`. A progress indicator („Frage N von 6").

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/lead-check/LeadCheck.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadCheck } from "./LeadCheck";

function answerAll() {
  // Q1 number
  fireEvent.change(screen.getByLabelText(/Anfragen bekommst du/), { target: { value: "10" } });
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  // Q2..Q5 choices
  fireEvent.click(screen.getByRole("button", { name: "am selben Tag" }));
  fireEvent.click(screen.getByRole("button", { name: "manchmal" }));
  fireEvent.click(screen.getByRole("button", { name: "wartet, bis ich Zeit habe" }));
  fireEvent.click(screen.getByRole("button", { name: "einmal" }));
  // Q6 optional → skip
  fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
}

describe("LeadCheck", () => {
  it("walks all 6 steps and shows the gain-led result", () => {
    render(<LeadCheck calLink={undefined} />);
    expect(screen.getByText(/Frage 1 von 6/)).toBeInTheDocument();
    answerAll();
    expect(screen.getByText(/Deine Lead-Reaktion/)).toBeInTheDocument();
    expect(screen.getByText(/168\.000/)).toBeInTheDocument(); // default provision applied on skip
  });

  it("lets the user go back to a previous step", () => {
    render(<LeadCheck calLink={undefined} />);
    fireEvent.change(screen.getByLabelText(/Anfragen bekommst du/), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText(/Frage 2 von 6/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Zurück/ }));
    expect(screen.getByText(/Frage 1 von 6/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/lead-check/LeadCheck.test.tsx`
Expected: FAIL — cannot resolve `./LeadCheck`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/components/lead-check/LeadCheck.tsx
"use client";

import { useState } from "react";
import { STEPS, computeResult, DEFAULT_PROVISION, type LeadCheckAnswers } from "@/lib/leadCheck";
import { Question } from "./Question";
import { Result } from "./Result";

export function LeadCheck({ calLink }: { calLink: string | undefined }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<LeadCheckAnswers>>({});

  if (index >= STEPS.length) {
    const final: LeadCheckAnswers = {
      anfragenProWoche: answers.anfragenProWoche ?? 0,
      reaktionszeit: answers.reaktionszeit ?? "selberTag",
      abendsWochenende: answers.abendsWochenende ?? "manchmal",
      imTermin: answers.imTermin ?? "wartet",
      nachfassen: answers.nachfassen ?? "einmal",
      provision: answers.provision, // undefined → computeResult applies DEFAULT_PROVISION
    };
    return <Result answers={final} result={computeResult(final)} calLink={calLink} />;
  }

  const step = STEPS[index];

  const handleAnswer = (value: string | number | undefined) => {
    setAnswers((prev) => {
      // For the optional provision step, undefined means "use default" — store the
      // default explicitly so the email form posts a value; other steps store as-is.
      if (step.id === "provision") {
        return { ...prev, provision: typeof value === "number" ? value : DEFAULT_PROVISION };
      }
      return { ...prev, [step.id]: value };
    });
    setIndex((i) => i + 1);
  };

  return (
    <div>
      <p className="text-sm text-stumm">Frage {index + 1} von {STEPS.length}</p>
      <div className="mt-4">
        <Question step={step} onAnswer={handleAnswer} onBack={() => setIndex((i) => Math.max(0, i - 1))} showBack={index > 0} />
      </div>
    </div>
  );
}
```

> The result test expects `168.000` after skipping provision: skip stores `DEFAULT_PROVISION` (4000) → `computeResult` → 42 × 4000 = 168000. The orchestrator stores the default explicitly on skip so both the display and the email form agree.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/lead-check/LeadCheck.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/lead-check/LeadCheck.tsx src/components/lead-check/LeadCheck.test.tsx
git commit -m "feat(lead-check): step orchestrator

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Route page (`/lead-check`, noindex)

**Files:**
- Create: `src/app/lead-check/page.tsx`
- Test: `src/app/lead-check/page.test.tsx`

Server component: metadata with `robots: { index: false, follow: false }`, `PageIntro` lead, the `LeadCheck` client widget (passed `calLink()` from env). No JSON-LD (page is noindex). Not added to nav (scope).

- [ ] **Step 1: Write the failing test**

```tsx
// src/app/lead-check/page.test.tsx
import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("/lead-check metadata", () => {
  it("is excluded from indexing (outreach door-opener, not SEO)", () => {
    expect(metadata.robots).toMatchObject({ index: false });
  });
  it("has a title", () => {
    expect(metadata.title).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/app/lead-check/page.test.tsx`
Expected: FAIL — cannot resolve `./page`.

- [ ] **Step 3: Write the implementation**

```tsx
// src/app/lead-check/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { LeadCheck } from "@/components/lead-check/LeadCheck";
import { calLink } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Lead-Reaktions-Check",
  description:
    "In zwei Minuten siehst du, wie viele Abschlüsse mit deinem heutigen Posteingang mehr drin wären – wenn jede Anfrage sofort eine Antwort bekäme.",
  robots: { index: false, follow: false },
};

export default function LeadCheckPage() {
  return (
    <>
      <PageIntro
        eyebrow="Der Lead-Reaktions-Check"
        title="Wie viel lässt du jede Woche liegen?"
        lead="In zwei Minuten siehst du, wie viele Abschlüsse mit deinem heutigen Posteingang mehr drin wären – wenn jede Anfrage sofort eine Antwort bekäme. Sechs Fragen, kein Login, dein Ergebnis sofort."
      />
      <Section tone="paper" className="-mt-12 md:-mt-16">
        <div className="mx-auto max-w-2xl">
          <LeadCheck calLink={calLink()} />
        </div>
      </Section>
    </>
  );
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/app/lead-check/page.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Byte-verify German typography in the page + result copy**

Run:
```bash
node -e "for (const p of ['src/app/lead-check/page.tsx','src/components/lead-check/Result.tsx','src/components/lead-check/ResultEmailForm.tsx','src/components/lead-check/Question.tsx']) { const s=require('fs').readFileSync(p,'utf8'); const ascii=(s.match(/„[^“\n]*\"/g)||[]).length; const em=(s.match(/—/g)||[]).length; console.log(p, 'ascii-closed:', ascii, 'em-dash:', em); }"
```
Expected: every file `ascii-closed: 0` and `em-dash: 0` (German copy uses `–` en-dash escapes and no literal „…" with ASCII close).

- [ ] **Step 6: Commit**

```bash
git add src/app/lead-check/page.tsx src/app/lead-check/page.test.tsx
git commit -m "feat(lead-check): /lead-check route (noindex)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Full gate + browser verification

**Files:** none (verification only)

- [ ] **Step 1: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Full test suite**

Run: `npm test`
Expected: all suites pass (existing + the new leadCheck/leadCheckEmail/actions/Question/Result/LeadCheck/page tests).

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: builds; `/lead-check` appears in the route list.

- [ ] **Step 5: Browser verification**

Run `npm start`, open `http://localhost:3000/lead-check`. Verify at **1440** and **390**:
- All 6 steps advance; choices auto-advance, number steps need „Weiter"; „Überspringen" works on provision; „← Zurück" works.
- Result is **gain-led** (€ headline first, loss smaller); the „Wie wir rechnen" disclosure opens; the petrol bridge + „Termin anzeigen" (Cal) render; the optional email field sits on the petrol card and is readable (AA).
- An already-fast profile (unter 5 Min + immer + automatisch + mehrmals) shows the „schon schnell" copy and **no invented €**.
- German typography renders („…", en-dash); *Termin-Quelle* is Fraunces italic via `BrandWord`.
- No console errors; `prefers-reduced-motion` unaffected (no custom motion added).

- [ ] **Step 6: Commit any fixes from verification, then the branch is ready for finishing-a-development-branch**

```bash
git add -A
git commit -m "fix(lead-check): browser-verification polish

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

> After the gate is green, hand off to **superpowers:finishing-a-development-branch** (merge `feat/lead-reaktions-check` → `main`; push auto-deploys to Vercel). Visual refinement (spacing/rhythm/motion) can follow via the `Website:impeccable` skill on a separate pass — out of scope here.

---

## Self-review notes (coverage)

- **Calc model** (spec §1): Tasks 1–2 — tiers, modifiers, cap 0.85, floor 0.10, recoverable, € via 20 % close-rate, score bands, worked example, all edges. ✓
- **Copy** (spec §2): German strings in Tasks 1 (questions), 6 (result, gain-led + `schnell` special-case + disclosure), 8 (intro). Typography verified in Tasks 1, 8. ✓
- **Architecture** (spec §3): pure `leadCheck.ts` (1–2) + `leadCheckEmail.ts` (3) + Server Action (4) + components (5–7) + route (8). Server recomputes math. Resend gated by `isContactConfigured()`; Cal via `SchedulerEmbed` EU origin. ✓
- **Testing** (spec §4): unit (1–3), action with constructable Resend mock (4), components RTL (5–7), metadata (8), full gate (9). ✓
- **Scope** (spec §5): fixed 20 % (no slider), no newsletter, no DB, noindex, not in nav. ✓
