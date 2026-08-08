# Lead-Check Result Emails Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send the lead a branded German HTML summary of their Lead-Reaktions-Check (main info central) and reformat the internal notification as HTML with KPI tiles.

**Architecture:** Both emails are built in the pure module `src/lib/leadCheckEmail.ts` (no IO). The Server Action sends the lead summary first, then the internal notification; an internal-only failure never breaks the user-facing "ok".

**Tech Stack:** Next.js 16 · TypeScript · Vitest · Resend. HTML emails = inline-styled markup mirroring `src/lib/email/newsletter-confirm.ts`.

**Spec:** `docs/superpowers/specs/2026-08-08-lead-check-result-emails-design.md` — copy and layout are defined there and are not negotiable.

## Global Constraints

- German copy: „…“ quotes (U+201E/U+201C), spaced en-dash „ – “ (U+2013), generic masculine. **After every write, byte-verify** with: `perl -CSD -ne 'while (/\x{201E}[^\x{201E}\x{201C}]{0,60}?"/g){print "BAD $ARGV:$.\n"} while(/\x{2014}/g){print "EMDASH $ARGV:$.\n"}' <file>`
- German single quotes in TS strings are written as codepoint escapes (`‚` … `‘`) — Write/Edit downgrade literals.
- The lead email contains exactly one link (the Cal URL) — never any `vercel.app` or site URL.
- Numbers: `Intl.NumberFormat("de-DE")`; ` ` before `€` in body copy.
- Run everything from `Website/`; branch `feat/lead-check-result-emails`; commits end with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: `buildLeadSummaryEmail` (pure builder, lead-facing)

**Files:**
- Modify: `src/lib/leadCheckEmail.ts`
- Test: `src/lib/leadCheckEmail.test.ts`

**Interfaces:**
- Consumes: `computeResult`, `LeadCheckResult`, `Score` from `./leadCheck`.
- Produces: `export type LeadSummaryEmail = { to: string; subject: string; html: string; text: string }` and `export function buildLeadSummaryEmail(p: { email: string; result: LeadCheckResult; calUrl?: string }): LeadSummaryEmail`. Task 3 sends `to`/`subject`/`html`/`text` verbatim.

- [ ] **Step 1: Write the failing tests** (append a new `describe` to `src/lib/leadCheckEmail.test.ts`)

```ts
import { buildLeadSummaryEmail } from "./leadCheckEmail";
import { computeResult } from "./leadCheck";

const SLOW_ANSWERS = {
  anfragenProWoche: 10, reaktionszeit: "selberTag", abendsWochenende: "manchmal",
  imTermin: "wartet", nachfassen: "einmal",
} as const; // -> 50 % loss, 42 Abschluesse, 168.000 EUR, score "langsam"

const FAST_ANSWERS = {
  anfragenProWoche: 10, reaktionszeit: "unter5min", abendsWochenende: "immer",
  imTermin: "automatisch", nachfassen: "mehrmals",
} as const; // -> score "schnell"

describe("buildLeadSummaryEmail", () => {
  const CAL = "https://cal.eu/vrelo/15min";

  it("puts the money figures central for a slow score (html + text)", () => {
    const m = buildLeadSummaryEmail({ email: "max@beispiel.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(m.to).toBe("max@beispiel.de");
    expect(m.subject).toBe("Dein Ergebnis: Lead-Reaktions-Check");
    expect(m.html).toContain("42 Abschl");
    expect(m.html).toContain("168.000");
    expect(m.html).toContain("50 %");
    expect(m.text).toContain("168.000");
    expect(m.html).toContain(CAL);
  });

  it("shows the default-provision fine print only when provision was defaulted", () => {
    const def = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(def.html).toContain("Branchenschnitt");
    const custom = buildLeadSummaryEmail({
      email: "a@b.de", result: computeResult({ ...SLOW_ANSWERS, provision: 2500 }), calUrl: CAL,
    });
    expect(custom.html).not.toContain("Branchenschnitt");
    expect(custom.html).toContain("2.500");
  });

  it("makes no money promise for a fast score", () => {
    const m = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(FAST_ANSWERS), calUrl: CAL });
    expect(m.html).toContain("Du reagierst schon schnell.");
    expect(m.html).not.toContain("€");
    expect(m.text).not.toContain("€");
    expect(m.html).toContain("Tempo absichern");
    expect(m.html).toContain(CAL); // CTA band stays
  });

  it("falls back to a reply line when no calUrl is configured", () => {
    const m = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(SLOW_ANSWERS) });
    expect(m.html).not.toContain("<a ");
    expect(m.html).toContain("Antworte einfach auf diese E-Mail");
  });

  it("contains no site links", () => {
    const m = buildLeadSummaryEmail({ email: "a@b.de", result: computeResult(SLOW_ANSWERS), calUrl: CAL });
    expect(m.html).not.toContain("vercel.app");
    expect(m.text).not.toContain("vercel.app");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/leadCheckEmail.test.ts`
Expected: FAIL — `buildLeadSummaryEmail` is not exported.

- [ ] **Step 3: Implement** (append to `src/lib/leadCheckEmail.ts`; shared helpers at module level)

```ts
import type { LeadCheckResult } from "./leadCheck"; // merge into existing import

const nf = new Intl.NumberFormat("de-DE");
const NBSP = " ";
const eurFmt = (n: number) => `${nf.format(n)}${NBSP}€`;

export type LeadSummaryEmail = { to: string; subject: string; html: string; text: string };

const SCORE_LABEL: Record<LeadCheckResult["score"], string> = {
  schnell: "schnell", solide: "solide", langsam: "langsam",
};

// Shared inline-style snippets (mirror src/lib/email/newsletter-confirm.ts)
const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";
const SERIF = "font-family:Georgia,'Times New Roman',serif";

export function buildLeadSummaryEmail(p: {
  email: string;
  result: LeadCheckResult;
  calUrl?: string;
}): LeadSummaryEmail {
  const { result, calUrl } = p;
  const fast = result.score === "schnell";
  const subject = "Dein Ergebnis: Lead-Reaktions-Check";

  const heroHtml = fast
    ? `<p style="${SERIF};text-align:center;font-size:25px;line-height:1.35;color:#0a2538;margin:0 0 6px">Du reagierst schon schnell.</p>
<p style="text-align:center;font-size:14px;margin:0 0 18px">Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.</p>`
    : `<p style="${SERIF};text-align:center;font-size:25px;line-height:1.35;color:#0a2538;margin:0 0 6px">Rund <strong>${result.zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr</strong> – ca. <strong>${eurFmt(result.eurUpside)}</strong>.</p>
<p style="text-align:center;font-size:14px;margin:0 0 18px">Mit einer Antwort in unter 5 Minuten. Ohne eine einzige neue Anfrage.</p>`;

  const contextHtml = fast
    ? ""
    : `<p style="font-size:14.5px;line-height:1.6;margin:0 0 8px">Aktuell werden rund ${result.currentLossPct}${NBSP}% deiner Anfragen kalt, bevor daraus ein Termin wird – das sind ca. ${nf.format(result.verloreneAnfragenProJahr)} im Jahr.</p>
<p style="font-size:12.5px;color:#696359;margin:0 0 22px">${
        result.provisionWasDefault
          ? `Gerechnet mit ${eurFmt(result.provisionUsed)} pro Abschluss – dem Branchenschnitt.`
          : `Gerechnet mit ${eurFmt(result.provisionUsed)} pro Abschluss.`
      }</p>`;

  const tipsHeading = fast ? "Drei Dinge, die dein Tempo absichern" : "Drei Dinge, die du sofort tun kannst";

  const ctaInner = calUrl
    ? `<a href="${calUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;font-size:14px;text-decoration:none;padding:12px 22px;border-radius:8px">15-Minuten-Gespräch buchen</a>`
    : `<span style="color:#f4efe6;font-size:14px">Antworte einfach auf diese E-Mail – dann melde ich mich.</span>`;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <p style="text-align:center;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#696359;margin:0 0 14px">Deine Lead-Reaktion: <b style="color:#0a2538">${SCORE_LABEL[result.score]}</b></p>
      ${heroHtml}
      <div style="width:44px;height:3px;background:#d4a24c;margin:0 auto 22px"></div>
      ${contextHtml}
      <div style="background:#ece3d2;border-radius:8px;padding:14px 16px;font-size:13px;line-height:1.6;margin:0 0 22px"><strong>Wie wir rechnen:</strong> Grundlage ist die Lead-Response-Forschung (HBR/InsideSales) – nach der Fünf-Minuten-Marke fällt die Chance, einen Lead zu erreichen, um rund das Acht- bis Zehnfache. Wir rechnen bewusst konservativ, und selbst dann, wenn nur jeder fünfte zurückgeholte Termin zum Abschluss wird.</div>
      <p style="font-size:15px;font-weight:bold;color:#0a2538;margin:0 0 8px">${tipsHeading}</p>
      <ul style="margin:0 0 8px;padding-left:20px;font-size:14.5px;line-height:1.6">
        <li style="margin-bottom:4px">Eine feste Fünf-Minuten-Regel für neue Anfragen.</li>
        <li style="margin-bottom:4px">Eine einfache Auto-Antwort, die sofort bestätigt.</li>
        <li>Eine feste Nachfass-Routine für alle, die sich nicht melden.</li>
      </ul>
      <p style="font-size:12.5px;color:#696359;margin:0 0 24px">Das Schwere ist, das <strong>konsequent</strong> zu tun – nachts, im Termin, bei jeder Anfrage.</p>
      <div style="background:#1b5063;border-radius:12px;padding:24px 22px;text-align:center;margin:0 0 26px">
        <p style="${SERIF};color:#f4efe6;font-size:17px;line-height:1.45;margin:0 0 16px">Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.</p>
        ${ctaInner}
      </div>
      <p style="font-size:14.5px;line-height:1.6;margin:0 0 24px">Bis bald<br>Ajdin von <em style="${SERIF};font-style:italic">Vrelo</em></p>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:0 0 14px" />
      <p style="font-size:12px;color:#696359;margin:0">Du bekommst diese E-Mail einmalig, weil du dir die Zusammenfassung deines Lead-Reaktions-Checks schicken lassen hast.</p>
    </div>
  </body>
</html>`;

  const textLines = [
    `Deine Lead-Reaktion: ${SCORE_LABEL[result.score]}`,
    "",
    ...(fast
      ? [
          "Du reagierst schon schnell.",
          "Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.",
        ]
      : [
          `Rund ${result.zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr – ca. ${nf.format(result.eurUpside)} €.`,
          "Mit einer Antwort in unter 5 Minuten. Ohne eine einzige neue Anfrage.",
          "",
          `Aktuell werden rund ${result.currentLossPct} % deiner Anfragen kalt, bevor daraus ein Termin wird – das sind ca. ${nf.format(result.verloreneAnfragenProJahr)} im Jahr.`,
          result.provisionWasDefault
            ? `Gerechnet mit ${nf.format(result.provisionUsed)} € pro Abschluss – dem Branchenschnitt.`
            : `Gerechnet mit ${nf.format(result.provisionUsed)} € pro Abschluss.`,
        ]),
    "",
    "Wie wir rechnen: Grundlage ist die Lead-Response-Forschung (HBR/InsideSales) – nach der Fünf-Minuten-Marke fällt die Chance, einen Lead zu erreichen, um rund das Acht- bis Zehnfache. Wir rechnen bewusst konservativ, und selbst dann, wenn nur jeder fünfte zurückgeholte Termin zum Abschluss wird.",
    "",
    `${tipsHeading}:`,
    "- Eine feste Fünf-Minuten-Regel für neue Anfragen.",
    "- Eine einfache Auto-Antwort, die sofort bestätigt.",
    "- Eine feste Nachfass-Routine für alle, die sich nicht melden.",
    "Das Schwere ist, das konsequent zu tun – nachts, im Termin, bei jeder Anfrage.",
    "",
    "Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.",
    calUrl ? `15-Minuten-Gespräch buchen: ${calUrl}` : "Antworte einfach auf diese E-Mail – dann melde ich mich.",
    "",
    "Bis bald",
    "Ajdin von Vrelo",
    "",
    "Du bekommst diese E-Mail einmalig, weil du dir die Zusammenfassung deines Lead-Reaktions-Checks schicken lassen hast.",
  ];

  return { to: p.email.trim(), subject, html, text: textLines.join("\n") };
}
```

Note: the fast branch must not render `€` anywhere (test guards it) — that is why `contextHtml` is empty for `fast`.

- [ ] **Step 4: Byte-verify the German copy**

Run: `perl -CSD -ne 'while (/\x{201E}[^\x{201E}\x{201C}]{0,60}?"/g){print "BAD $.\n"} while(/\x{2014}/g){print "EMDASH $.\n"}' src/lib/leadCheckEmail.ts`
Expected: no output. If BAD/EMDASH lines appear, repair with the perl codepoint-escape one-liner from Global Constraints (never literal smart chars in the repair program).

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/leadCheckEmail.test.ts`
Expected: PASS (all new + all pre-existing tests).

- [ ] **Step 6: Commit**

```bash
git add src/lib/leadCheckEmail.ts src/lib/leadCheckEmail.test.ts
git commit -m "feat(lead-check): branded HTML summary email for the lead"
```

---

### Task 2: Internal notification HTML + evaluate returns both emails

**Files:**
- Modify: `src/lib/leadCheckEmail.ts` (extend `buildLeadCheckEmail`, `LeadCheckDecision`, `evaluateLeadCheckSubmission`)
- Test: `src/lib/leadCheckEmail.test.ts`

**Interfaces:**
- Consumes: `buildLeadSummaryEmail` (Task 1), enum types from `./leadCheck`.
- Produces: `LeadCheckEmail` gains `html: string`; subject becomes dynamic. `LeadCheckDecision`'s send arm becomes `{ action: "send"; leadEmail: LeadSummaryEmail; internalEmail: LeadCheckEmail }`. `evaluateLeadCheckSubmission(f: LeadCheckFields, now: number, calUrl?: string)`. Task 3 consumes exactly these names.

- [ ] **Step 1: Write the failing tests** (append; also update any existing test asserting `decision.email` or the fixed subject)

```ts
describe("buildLeadCheckEmail (internal)", () => {
  it("carries score and € potential in the subject for a slow lead", () => {
    const m = buildLeadCheckEmail({ email: "max@beispiel.de", answers: SLOW_ANSWERS, result: computeResult(SLOW_ANSWERS) });
    expect(m.subject).toBe("Lead-Check: max@beispiel.de – langsam · 168.000 €");
    expect(m.replyTo).toBe("max@beispiel.de");
  });

  it("omits the € from the subject for a fast lead", () => {
    const m = buildLeadCheckEmail({ email: "a@b.de", answers: FAST_ANSWERS, result: computeResult(FAST_ANSWERS) });
    expect(m.subject).toBe("Lead-Check: a@b.de – schnell");
  });

  it("renders KPI tiles and German answer labels in the html", () => {
    const m = buildLeadCheckEmail({ email: "max@beispiel.de", answers: SLOW_ANSWERS, result: computeResult(SLOW_ANSWERS) });
    expect(m.html).toContain("168.000");
    expect(m.html).toContain("am selben Tag");
    expect(m.html).toContain("wartet, bis ich Zeit habe");
    expect(m.html).toContain("(Standard)");
  });

  it("escapes the lead email in the html", () => {
    const m = buildLeadCheckEmail({
      email: 'x"<img>@b.de', answers: SLOW_ANSWERS, result: computeResult(SLOW_ANSWERS),
    });
    expect(m.html).not.toContain("<img>");
    expect(m.html).toContain("&lt;img&gt;");
  });
});

describe("evaluateLeadCheckSubmission (two emails)", () => {
  const FIELDS = { email: "max@beispiel.de", honeypot: "", renderedAt: 0, answers: SLOW_ANSWERS };

  it("returns both payloads with the calUrl threaded into the lead email", () => {
    const d = evaluateLeadCheckSubmission(FIELDS, 10_000, "https://cal.eu/vrelo/15min");
    expect(d.action).toBe("send");
    if (d.action !== "send") return;
    expect(d.leadEmail.to).toBe("max@beispiel.de");
    expect(d.leadEmail.html).toContain("https://cal.eu/vrelo/15min");
    expect(d.internalEmail.replyTo).toBe("max@beispiel.de");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/leadCheckEmail.test.ts`
Expected: FAIL (subject mismatch, missing `html`, decision shape).

- [ ] **Step 3: Implement** (replace `buildLeadCheckEmail`, `LeadCheckEmail`, the decision type, and `evaluateLeadCheckSubmission`)

```ts
import {
  computeResult,
  type LeadCheckAnswers, type LeadCheckResult,
  type Reaktionszeit, type AbendsWochenende, type ImTermin, type Nachfassen,
} from "./leadCheck"; // merge into the existing import

const REAKTIONSZEIT_LABEL: Record<Reaktionszeit, string> = {
  unter5min: "unter 5 Minuten", unter1std: "unter 1 Stunde", selberTag: "am selben Tag",
  "1bis2tage": "1–2 Tage", wennZeit: "wenn ich dazu komme",
};
const ABENDS_LABEL: Record<AbendsWochenende, string> = { immer: "immer", manchmal: "manchmal", nein: "nein" };
const TERMIN_LABEL: Record<ImTermin, string> = {
  automatisch: "wird automatisch beantwortet", wartet: "wartet, bis ich Zeit habe", gehtUnter: "geht manchmal unter",
};
const NACHFASS_LABEL: Record<Nachfassen, string> = {
  mehrmals: "mehrmals, systematisch", einmal: "einmal", selten: "selten", nie: "nie",
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export type LeadCheckEmail = { subject: string; text: string; html: string; replyTo: string };

export function buildLeadCheckEmail(p: {
  email: string;
  answers: LeadCheckAnswers;
  result: LeadCheckResult;
}): LeadCheckEmail {
  const { answers, result } = p;
  const email = p.email.trim();
  const fast = result.score === "schnell";
  const subject = `Lead-Check: ${email} – ${SCORE_LABEL[result.score]}${fast ? "" : ` · ${nf.format(result.eurUpside)} €`}`;

  const rows: Array<[string, string]> = [
    ["E-Mail", escapeHtml(email)],
    ["Anfragen/Woche", String(answers.anfragenProWoche)],
    ["Reaktionszeit", REAKTIONSZEIT_LABEL[answers.reaktionszeit]],
    ["Abends/Wochenende", ABENDS_LABEL[answers.abendsWochenende]],
    ["Im Termin", TERMIN_LABEL[answers.imTermin]],
    ["Nachfassen", NACHFASS_LABEL[answers.nachfassen]],
    ["Provision", `${eurFmt(result.provisionUsed)}${result.provisionWasDefault ? " (Standard)" : ""}`],
    ["Verlorene Anfragen/Jahr", `≈ ${nf.format(result.verloreneAnfragenProJahr)}`],
    ["Zusätzliche Abschlüsse/Jahr", `≈ ${nf.format(result.zusaetzlicheAbschluesse)}`],
  ];

  const kpiCell = (n: string, l: string, main = false) =>
    `<td style="width:33%;background:${main ? "#0a2538" : "#ece3d2"};border-radius:8px;padding:12px 8px;text-align:center"><span style="${SERIF};display:block;font-size:${main ? "22px" : "20px"};color:${main ? "#d4a24c" : "#0a2538"}">${n}</span><span style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${main ? "#dce7eb" : "#696359"}">${l}</span></td>`;

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:480px;margin:0 auto">
      <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:6px 0;margin:0 0 18px"><tr>
        ${kpiCell(eurFmt(result.eurUpside), "Potenzial/Jahr", true)}
        ${kpiCell(SCORE_LABEL[result.score], "Score")}
        ${kpiCell(`${result.currentLossPct}${NBSP}%`, "Verlust aktuell")}
      </tr></table>
      <table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;color:#696359;width:46%">${k}</td><td style="padding:7px 8px;border-bottom:1px solid #e3dccc;font-weight:bold">${v}</td></tr>`,
          )
          .join("\n        ")}
      </table>
      <p style="font-size:12.5px;color:#696359;margin:18px 0 0">Der Lead hat seine Zusammenfassung bereits automatisch bekommen. Auf ‚Antworten‘ schreibst du ihm direkt.</p>
    </div>
  </body>
</html>`;

  const lines = [
    `E-Mail: ${email}`,
    "",
    "Antworten:",
    `Anfragen/Woche: ${answers.anfragenProWoche}`,
    `Reaktionszeit: ${REAKTIONSZEIT_LABEL[answers.reaktionszeit]}`,
    `Abends/Wochenende: ${ABENDS_LABEL[answers.abendsWochenende]}`,
    `Im Termin: ${TERMIN_LABEL[answers.imTermin]}`,
    `Nachfassen: ${NACHFASS_LABEL[answers.nachfassen]}`,
    `Provision: ${nf.format(result.provisionUsed)} €${result.provisionWasDefault ? " (Standard)" : ""}`,
    "",
    "Ergebnis:",
    `Score: ${SCORE_LABEL[result.score]}`,
    `Aktueller Verlust: ${result.currentLossPct} %`,
    `Verlorene Anfragen/Jahr: ${nf.format(result.verloreneAnfragenProJahr)}`,
    `Zusätzliche Abschlüsse/Jahr: ${nf.format(result.zusaetzlicheAbschluesse)}`,
    `Euro-Potenzial/Jahr: ${nf.format(result.eurUpside)} €`,
  ];

  return { subject, text: lines.join("\n"), html, replyTo: email };
}

export type LeadCheckDecision =
  | { action: "drop" }
  | { action: "reject"; message: string }
  | { action: "invalid"; error: string }
  | { action: "send"; leadEmail: LeadSummaryEmail; internalEmail: LeadCheckEmail };

export function evaluateLeadCheckSubmission(
  f: LeadCheckFields,
  now: number,
  calUrl?: string,
): LeadCheckDecision {
  if (isHoneypotTripped(f.honeypot)) return { action: "drop" };
  if (isTooFast(f.renderedAt, now)) return { action: "reject", message: "Bitte versuch es gleich noch einmal." };
  const emailErr = validateLeadCheckEmail(f.email);
  if (emailErr) return { action: "invalid", error: emailErr };
  const result = computeResult(f.answers);
  return {
    action: "send",
    leadEmail: buildLeadSummaryEmail({ email: f.email, result, calUrl }),
    internalEmail: buildLeadCheckEmail({ email: f.email, answers: f.answers, result }),
  };
}
```

Also update any pre-existing tests in `leadCheckEmail.test.ts` that assert the old `decision.email` shape or the old subject `"Neuer Lead-Reaktions-Check"` to the new shape (`d.internalEmail`, dynamic subject).

- [ ] **Step 4: Byte-verify** (same perl check as Task 1, Step 4). Expected: no output.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/lib/leadCheckEmail.test.ts`
Expected: PASS. (`src/app/lead-check/actions.ts` will now be type-broken — that is Task 3; `vitest run` on this file alone does not typecheck the action.)

- [ ] **Step 6: Commit**

```bash
git add src/lib/leadCheckEmail.ts src/lib/leadCheckEmail.test.ts
git commit -m "feat(lead-check): internal notification as HTML with KPI tiles; evaluate returns both emails"
```

---

### Task 3: Action sends both emails (lead first)

**Files:**
- Modify: `src/lib/contact.ts` (add `calBookingUrl`)
- Modify: `src/app/lead-check/actions.ts`
- Test: `src/app/lead-check/actions.test.ts`

**Interfaces:**
- Consumes: `evaluateLeadCheckSubmission(fields, now, calUrl)` → `{ action: "send"; leadEmail; internalEmail }` (Task 2).
- Produces: `calBookingUrl(): string | undefined` in `src/lib/contact.ts`; unchanged `LeadCheckEmailState` for the form.

- [ ] **Step 1: Write the failing tests** (rework the send-path tests in `src/app/lead-check/actions.test.ts`; keep the existing mock/env scaffolding — the Resend mock stays a constructable function, `send` stays the shared `vi.fn()`)

```ts
// helper in the test file: a valid FormData for the happy path
function validForm(): FormData {
  const fd = new FormData();
  fd.set("email", "max@beispiel.de");
  fd.set("renderedAt", String(Date.now() - 10_000));
  fd.set("anfragenProWoche", "10");
  fd.set("reaktionszeit", "selberTag");
  fd.set("abendsWochenende", "manchmal");
  fd.set("imTermin", "wartet");
  fd.set("nachfassen", "einmal");
  return fd;
}

it("sends the lead summary first, then the internal notification", async () => {
  send.mockResolvedValue({ error: null });
  const state = await submitLeadCheckEmail({ status: "idle" }, validForm());
  expect(state).toEqual({ status: "ok" });
  expect(send).toHaveBeenCalledTimes(2);
  expect(send.mock.calls[0][0]).toMatchObject({ to: "max@beispiel.de", subject: "Dein Ergebnis: Lead-Reaktions-Check" });
  expect(send.mock.calls[0][0].html).toContain("168.000");
  expect(send.mock.calls[1][0]).toMatchObject({ to: "hallo@example.de", replyTo: "max@beispiel.de" });
});

it("returns error when the lead send fails (no internal attempt needed for ok)", async () => {
  send.mockResolvedValueOnce({ error: { message: "boom" } });
  const state = await submitLeadCheckEmail({ status: "idle" }, validForm());
  expect(state.status).toBe("error");
});

it("stays ok when only the internal send fails", async () => {
  send.mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: { message: "boom" } });
  const state = await submitLeadCheckEmail({ status: "idle" }, validForm());
  expect(state).toEqual({ status: "ok" });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/app/lead-check/actions.test.ts`
Expected: FAIL (single send today; old payload shape).

- [ ] **Step 3: Implement**

In `src/lib/contact.ts` (below `calLink()`):

```ts
// Booking URL for emails: NEXT_PUBLIC_CAL_LINK is a path; the account lives
// in the EU data region, so the origin is cal.eu (see SchedulerEmbed).
export function calBookingUrl(): string | undefined {
  const link = calLink();
  return link ? `https://cal.eu/${link}` : undefined;
}
```

In `src/app/lead-check/actions.ts`, replace the send block of `submitLeadCheckEmail`:

```ts
import { isContactConfigured, contactFrom, contactTo, resendKey, calBookingUrl } from "@/lib/contact";

// inside submitLeadCheckEmail:
const decision = evaluateLeadCheckSubmission(parse(formData), Date.now(), calBookingUrl());

if (decision.action === "drop") return { status: "ok" };
if (decision.action === "reject") return { status: "error", message: decision.message };
if (decision.action === "invalid") return { status: "invalid", error: decision.error };

if (!isContactConfigured()) {
  return { status: "error", message: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt." };
}

try {
  const resend = new Resend(resendKey());
  // The lead's summary is the promise on the page — it goes out first and
  // decides the UI state. The internal notification must never break it.
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
    // internal-only failure: the lead got their summary; don't fail the UI
  }
  return { status: "ok" };
} catch {
  return { status: "error", message: GENERIC_ERROR };
}
```

(A resolved `{ error }` from the second send needs no handling — only a thrown error would; the inner try/catch covers it.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/app/lead-check/actions.test.ts`
Expected: PASS (new + pre-existing honeypot/too-fast/invalid/not-configured tests).

- [ ] **Step 5: Full verification**

Run: `npm test` then `npx tsc --noEmit` then `npm run lint` then `npm run build`
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/contact.ts src/app/lead-check/actions.ts src/app/lead-check/actions.test.ts
git commit -m "feat(lead-check): send the lead their summary, then the internal notification"
```
