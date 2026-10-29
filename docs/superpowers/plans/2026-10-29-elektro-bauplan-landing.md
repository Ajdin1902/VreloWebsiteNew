# Elektro-Bauplan Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A second unlisted Bauplan page `/bauplan/<BAUPLAN_CODE_ELEKTRO>` for Elektrobetriebe that shows the pain and mails the approved six-page PDF, next to the unchanged Agentur page.

**Architecture:** The existing `/bauplan/[code]` route resolves a code to a variant (`agentur` | `elektro`) from two env vars. Mail decision, server action and route pick PDF, attachment name and copy per variant; the Elektro page is its own component fed by its own copy module and reuses `BauplanPdfForm` with variant copy. The approved PDF is copied (not re-rendered) to a hashed file under `public/bauplan/`.

**Tech Stack:** Next.js 16 (App Router, server actions), React, Tailwind, Vitest + Testing Library, Resend.

**Spec:** `docs/superpowers/specs/2026-10-29-elektro-bauplan-landing-design.md` (mockup `docs/design/elektro-bauplan/landing-mockup.html`)

## Global Constraints

- Copy in spec §5 and §7 is frozen: pin it word for word, never reword. A copy problem goes back to Ajdin.
- German copy: du-form, „…“ quotes (U+201E/U+201C), no Gedankenstrich (U+2013/U+2014), no comma before „und“. `findCopyIssues` must return `[]` on every string.
- The Write/Edit tools can downgrade „“ to ASCII quotes: in TS sources write them as `„`/`“` escapes, and after every write check the bytes (`python -I` count of U+201E/U+201C, zero ASCII `"` inside copy strings).
- Page and reader mail: no price/duration (`/€|\bEuro\b|\bnetto\b|\bWochen\b|\bTagen?\b|\bMonate?n?\b/`), no offer voice (`/[Mm]it mir|ohne mich|binde ich|richte ich|baue ich|wir zusammen/`), no client names (`/Power-Connect|Öksüz|\bMDZ\b|Velp|\bAlen\b|Bergisch|Hausmeister/`), no call CTA (`/Prozess-Check|buchen|Termin|Erstgespräch/`).
- Agentur behaviour and its existing tests stay unchanged in meaning (`BAUPLAN_CODE`, „Bauplan angefordert: <email>“, `Vrelo-Bauplan-Agenturen.pdf`).
- The hashed public PDF name is load-bearing: never rename it, no clean-named copy in `public/`.
- Work on branch `feat/elektro-bauplan-landing` in the main checkout (the render script needs the sibling kit). Never stage Ajdin's own uncommitted files (`CLAUDE.md`, `.claude/skills/ratgeber-article/*`). Commits end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`; commit messages via a file and `git commit -F`.
- Nothing is pushed and no Vercel env is changed without Ajdin's go.

## Review Focus

1. Both env vars hold the same code: the Agentur page must win deterministically, never a mix (test in Task 1).
2. Only `BAUPLAN_CODE_ELEKTRO` set (Agentur unset): the Elektro page and its form must still work (tests in Tasks 1 and 4).
3. Env values with surrounding whitespace: trimmed, like `bauplanCode()` (test in Task 1).
4. A request whose code was rotated away after the page loaded: refused, no mail sent, for the Elektro variant too (test in Task 4).
5. The Elektro PDF path constant pointing at a file that is not in `public/`: caught by an exists test, not by a failing mail in production (test in Task 3).

---

### Task 1: Code → variant resolution

**Files:**
- Modify: `src/lib/bauplan.ts`
- Test: `src/lib/bauplan.test.ts`

**Interfaces:**
- Produces: `export type BauplanVariant = "agentur" | "elektro"`; `bauplanVariant(slug: string): BauplanVariant | undefined`; `isBauplanCode(slug)` stays and equals `bauplanVariant(slug) !== undefined`.

- [ ] **Step 0: Branch + commit the design**

`git switch -c feat/elektro-bauplan-landing`; commit the spec, this plan and `docs/design/elektro-bauplan/landing-mockup.html` („docs(bauplan): Elektro landing spec, plan and mockup“).

- [ ] **Step 1: Write the failing tests** (save/restore both env vars in `afterEach`)

```ts
describe("bauplanVariant", () => {
  it("maps each configured code to its variant", () => {
    process.env.BAUPLAN_CODE = "agentur-7k3m"; process.env.BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026";
    expect(bauplanVariant("agentur-7k3m")).toBe("agentur");
    expect(bauplanVariant("elektro-quelle-2026")).toBe("elektro");
    expect(bauplanVariant("other")).toBeUndefined();
  });
  it("works with only the Elektro code set", () => {
    delete process.env.BAUPLAN_CODE; process.env.BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026";
    expect(bauplanVariant("elektro-quelle-2026")).toBe("elektro");
    expect(bauplanVariant("")).toBeUndefined();
  });
  it("trims env values", () => {
    process.env.BAUPLAN_CODE_ELEKTRO = "  elektro-quelle-2026 ";
    expect(bauplanVariant("elektro-quelle-2026")).toBe("elektro");
  });
  it("lets Agentur win when both env vars hold the same code", () => {
    process.env.BAUPLAN_CODE = "same"; process.env.BAUPLAN_CODE_ELEKTRO = "same";
    expect(bauplanVariant("same")).toBe("agentur");
  });
  it("keeps isBauplanCode true for either variant", () => {
    process.env.BAUPLAN_CODE = "a1"; process.env.BAUPLAN_CODE_ELEKTRO = "e1";
    expect(isBauplanCode("a1") && isBauplanCode("e1")).toBe(true);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/lib/bauplan.test.ts` → FAIL (`bauplanVariant` is not exported).
- [ ] **Step 3: Implement** in `src/lib/bauplan.ts`: read both vars at call time (trimmed, empty = unset); check Agentur first. Update the file header comment to name both variants.
- [ ] **Step 4: Run** the same command → PASS (old tests too).
- [ ] **Step 5: Commit** „feat(bauplan): resolve a code to the agentur or elektro variant“.

---

### Task 2: Publish the approved PDF to `public/`

**Files:**
- Modify: `scripts/render-elektro-bauplan.mjs`
- Create: `public/bauplan/elektro-bauplan-<hash8>.pdf` (generated)

- [ ] **Step 1: Extend `--publish`**: after the gate, besides the share copy, write `public/bauplan/elektro-bauplan-<first 8 hex of sha256 of the reviewed PDF>.pdf`, delete any other `public/bauplan/elektro-bauplan-*.pdf`, never touch `agentur-bauplan-*`, and print `public/bauplan/<name>`. Update the header comment (drop the „No file under public/“ line). `--publish=<path>` still only redirects the share copy.
- [ ] **Step 2: Verify the input is the approved file**: `sha256sum .preview/elektro-bauplan.pdf ../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf` → identical (expected prefix `1d65185e`).
- [ ] **Step 3: Run** `npm run bauplan:elektro -- --publish` → gate „6 pages“ passes, prints `public/bauplan/elektro-bauplan-1d65185e.pdf`; `cmp` that file against the share copy → identical; `ls public/bauplan` shows the Agentur file unchanged plus exactly one Elektro file.
- [ ] **Step 4: Commit** the script and the PDF („feat(bauplan): publish the Elektro PDF under a hashed public name“).

---

### Task 3: Variant-aware mail decision

**Files:**
- Modify: `src/lib/bauplanEmail.ts`
- Test: `src/lib/bauplanEmail.test.ts`

**Interfaces:**
- Consumes: `BauplanVariant` (Task 1); the file name printed in Task 2.
- Produces: `ELEKTRO_BAUPLAN_PDF_PATH = "/bauplan/elektro-bauplan-<hash8>.pdf"`; `bauplanPdfPath(v: BauplanVariant): string`; `bauplanAttachmentName(v: BauplanVariant): string` (`"Vrelo-Bauplan-Agenturen.pdf"` | `"Vrelo-Bauplan-Elektrobetriebe.pdf"`); `evaluateBauplanRequest(f, now, pdfUrl, variant: BauplanVariant = "agentur")`. `BAUPLAN_PDF_PATH` stays the Agentur path.

- [ ] **Step 1: Write the failing tests**

```ts
describe("Elektro variant", () => {
  const d = evaluateBauplanRequest({ ...base, source: "el07" }, 10_000, PDF, "elektro");
  if (d.action !== "send") throw new Error(d.action);
  it("uses the Elektro subjects and copy", () => {
    expect(d.readerEmail.subject).toBe("Dein Bauplan für Elektrobetriebe");
    expect(d.readerEmail.text).toContain("der Bauplan hängt als PDF an dieser Mail.");
    expect(d.readerEmail.text).toContain("Fang mit der Stufe an, die dich heute am meisten Zeit kostet. Zu jeder Stufe steht drin, wie du vorgehst.");
    expect(d.readerEmail.text).toContain(PDF);
    expect(d.internalEmail.subject).toBe("Elektro-Bauplan angefordert: a@b.de");
    expect(d.internalEmail.text).toContain("Quelle: el07");
    expect(d.internalEmail.text).toContain("Bauplan: Elektrobetriebe");
  });
  it("keeps the reader mail clean", () => {
    expect(findCopyIssues(d.readerEmail.text)).toEqual([]);
    expect(d.readerEmail.text).not.toMatch(/Erstgespräch|Prozess-Check|buchen|€|Wochen/i);
  });
  it("leaves the Agentur mail as it was", () => {
    const a = evaluateBauplanRequest(base, 10_000, PDF);
    if (a.action !== "send") throw new Error(a.action);
    expect(a.readerEmail.subject).toBe("Dein Bauplan für Agenturen");
    expect(a.internalEmail.subject).toBe("Bauplan angefordert: a@b.de");
  });
  it("names the attachment and PDF per variant, and the Elektro file exists", () => {
    expect(bauplanAttachmentName("elektro")).toBe("Vrelo-Bauplan-Elektrobetriebe.pdf");
    expect(bauplanPdfPath("agentur")).toBe(BAUPLAN_PDF_PATH);
    expect(existsSync(join(process.cwd(), "public", ELEKTRO_BAUPLAN_PDF_PATH))).toBe(true);
  });
});
```

- [ ] **Step 2: Run** `npx vitest run src/lib/bauplanEmail.test.ts` → FAIL (missing exports).
- [ ] **Step 3: Implement**: one config record per variant (PDF path, attachment name, reader subject, reader paragraphs, internal subject prefix, label „Agenturen“/„Elektrobetriebe“). Elektro reader body, verbatim: „Hallo,“ / „der Bauplan hängt als PDF an dieser Mail. Falls der Anhang nicht ankommt, lädst du ihn hier:“ + link / „Fang mit der Stufe an, die dich heute am meisten Zeit kostet. Zu jeder Stufe steht drin, wie du vorgehst.“ / „Ajdin Dzafic“. The internal mail gets a `Bauplan: <label>` line for both variants. Agentur strings unchanged.
- [ ] **Step 4: Run** → PASS, plus the old tests in the file.
- [ ] **Step 5: Commit** „feat(bauplan): Elektro reader and internal mail“.

---

### Task 4: Server action per variant

**Files:**
- Modify: `src/app/bauplan/actions.ts`
- Test: `src/app/bauplan/actions.test.ts`

**Interfaces:**
- Consumes: `bauplanVariant` (Task 1); `bauplanPdfPath`, `bauplanAttachmentName`, `evaluateBauplanRequest(..., variant)` (Task 3).

- [ ] **Step 1: Write the failing tests** (add `BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026"` to `beforeEach`, restore in `afterEach`)

```ts
it("sends the Elektro PDF and mails for the Elektro code", async () => {
  send.mockResolvedValue({ error: null });
  const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", src: "el07", code: "elektro-quelle-2026" }));
  expect(s.status).toBe("ok");
  expect(readFile.mock.calls[0][0]).toMatch(/elektro-bauplan-[0-9a-f]{8}\.pdf$/);
  expect(send.mock.calls[0][0].attachments[0].filename).toBe("Vrelo-Bauplan-Elektrobetriebe.pdf");
  expect(send.mock.calls[0][0].subject).toBe("Dein Bauplan für Elektrobetriebe");
  expect(send.mock.calls[1][0].subject).toBe("Elektro-Bauplan angefordert: a@b.de");
});
it("works with only the Elektro code configured", async () => {
  delete process.env.BAUPLAN_CODE; send.mockResolvedValue({ error: null });
  expect((await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "elektro-quelle-2026" }))).status).toBe("ok");
});
it("refuses a rotated Elektro code without sending", async () => {
  process.env.BAUPLAN_CODE_ELEKTRO = "elektro-neu";
  const s = await submitBauplanRequest(idle, fd({ renderedAt: "0", email: "a@b.de", code: "elektro-quelle-2026" }));
  expect(s.status).toBe("error");
  expect(send).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run** `npx vitest run src/app/bauplan/actions.test.ts` → FAIL (Agentur attachment/subject on the Elektro code).
- [ ] **Step 3: Implement**: resolve `variant = bauplanVariant(get("code"))`; evaluate with `variant ?? "agentur"` (drop/reject/invalid order unchanged); refuse when `variant` is undefined; `loadPdf` and `pdfUrl` from `bauplanPdfPath(variant)`; attachment name from `bauplanAttachmentName(variant)`; log prefix stays `[bauplan]`.
- [ ] **Step 4: Run** → PASS (all old Agentur tests too).
- [ ] **Step 5: Commit** „feat(bauplan): server action serves the Elektro variant“.

---

### Task 5: Elektro page copy, component and form copy

**Files:**
- Create: `src/lib/elektroBauplanPage.ts`, `src/lib/elektroBauplanPage.test.ts`
- Create: `src/components/bauplan/ElektroBauplanPage.tsx`, `src/components/bauplan/ElektroBauplanPage.test.tsx`
- Modify: `src/components/bauplan/BauplanPdfForm.tsx` (+ its test)

**Interfaces:**
- Produces: `export type PdfFormCopy = { label: string; button: string; pending: string; hinweis: string; success: string }`; `BauplanPdfForm({ source?, code, copy?: PdfFormCopy })` (default = `bauplanPage.pdf`, so the Agentur page is unchanged); `elektroBauplanPage` (shape below); `ElektroBauplanPage({ data: typeof elektroBauplanPage; form?: ReactNode })`.

`elektroBauplanPage` content, verbatim from spec §5:
- `kicker` „Bauplan für Elektrobetriebe“ · `title` „Mehr Büro als Baustelle?“
- `schmerz.zeilen` [„Tagsüber auf der Baustelle.“, „Abends Angebote und Rechnungen.“, „Am Wochenende der Rest.“] · `schmerz.zahl` „61 %“ (non-breaking space U+00A0) · `schmerz.satz` „der befragten Handwerksbetriebe sagen: Durch Bürokratie bleibt weniger Zeit für die Aufträge.“ · `schmerz.quelle` „Handwerkskammer Dortmund, Sonderumfrage 2023, rund 700 Betriebe“ · `schmerz.quelleLink` { text „hwk-do.de“, href = the HWK URL from `elektroBauplanTemplate.test.ts` } · `schmerz.cta` „Bauplan kostenlos anfordern“
- `loesung.heading` „Dein Bauplan zum Selbstbau: der eigene KI-Büroassistent“ · `loesung.sub` „Er bereitet Angebote, Rechnungen und Bestellungen vor. DSGVO-konform.“ · `loesung.flow` [{„Du sprichst ein“, „Sprache, Foto, Mail“}, {„Er versteht“, „und fragt nach“}, {„Er bereitet vor“, „Angebot, Rechnung“}, {„Du gibst frei“, „dann geht es raus“}] · `loesung.vergleich` heads „Heute“ / „Mit dem Büroassistenten“, rows [„Angebote am Abend“ → „Einsprechen, Entwurf liegt bereit“], [„Preise einzeln nachschlagen“ → „Einkaufspreise kommen automatisch“], [„Rechnungen von Hand“ → „Rechnung mit einem „passt““]
- `inhalt.heading` „Das steht im Bauplan“ · `inhalt.punkte` the four spec bullets verbatim
- `pdf.heading` „Den Bauplan als PDF“ · `pdf.intro` „Kostenlos, sechs Seiten. Ich schicke ihn dir per Mail.“ · `pdf.form` { label „Deine E-Mail-Adresse“, button „PDF zuschicken“, pending „Wird gesendet …“, hinweis „Du bekommst nur diese eine Mail.“, success „Ist unterwegs. Schau auch im Spam-Ordner nach.“ }

- [ ] **Step 1: Write the failing tests**

`elektroBauplanPage.test.ts` (reuse the `strings()` walker from `bauplanPage.test.ts`): every string passes `findCopyIssues`; none matches the Global Constraints regexes; `schmerz.satz` contains „der befragten Handwerksbetriebe“; `inhalt.punkte` has length 4; `pdf.intro` contains „Kostenlos“ and `pdf.form.hinweis` contains „nur diese eine Mail“; `vergleich` has 3 rows; no string contains „Hausmeister“ or „BMW“ (mail only).

`ElektroBauplanPage.test.tsx`:

```tsx
it("renders pain, solution, value and form in that order, the form last", () => {
  const { container } = render(<ElektroBauplanPage data={elektroBauplanPage} form={<div data-testid="slot" />} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mehr Büro als Baustelle?");
  const ids = [...container.querySelectorAll("section[id]")].map((s) => s.id);
  expect(ids).toEqual(["schmerz", "loesung", "inhalt", "pdf"]);
  expect(container.querySelector("#pdf")).toContainElement(screen.getByTestId("slot"));
  expect(container.querySelector("#pdf")!.nextElementSibling).toBeNull();
});
it("jumps from the hero to the form and links the source", () => {
  render(<ElektroBauplanPage data={elektroBauplanPage} />);
  expect(screen.getByRole("link", { name: "Bauplan kostenlos anfordern" })).toHaveAttribute("href", "#pdf");
  expect(screen.getByRole("link", { name: "hwk-do.de" })).toHaveAttribute("href", elektroBauplanPage.schmerz.quelleLink.href);
  expect(screen.getByText(/61/)).toBeInTheDocument();
  expect(screen.getAllByTestId("inhalt-punkt")).toHaveLength(4);
});
```

`BauplanPdfForm.test.tsx`: add „renders the passed copy“: render with `copy={elektroBauplanPage.pdf.form}` → button „PDF zuschicken“ present; the existing Agentur tests unchanged (button „Bauplan zuschicken“).

- [ ] **Step 2: Run** `npx vitest run src/lib/elektroBauplanPage.test.ts src/components/bauplan` → FAIL (modules missing).
- [ ] **Step 3: Implement** the copy module (quotes as `„`/`“` escapes), the `copy` prop, and the component matching the mockup: `#schmerz` full-width `bg-tiefes-wasser` band (kicker `text-honig`, h1, three lines with the last in `text-honig`, „61 %“ in Fraunces italic `text-honig` large, stacked above the sentence below `sm`, source small in `text-stein`, amber button to `#pdf`); `#loesung` (h2, sub in `text-stumm`, four chips `bg-gletscher` in 2×2 below `sm` and 4 across from `sm`, last chip `bg-sonnenlicht`; Heute | Mit table with `bg-lesepapier`/`bg-gletscher` heads); `#inhalt` card `bg-sonnenlicht` with a `border-l-4 border-honig` and `bg-tiefes-wasser` bullet dots; `#pdf` card `border-2 border-amber bg-lesepapier` with h2, intro and the form slot. Text column `max-w-2xl`, page `bg-papier`, phone gutter `px-4`. Data-testids: `inhalt-punkt`.
- [ ] **Step 4: Run** the same command → PASS; byte check of `elektroBauplanPage.ts` (no ASCII `"` inside copy, U+201E count = U+201C count).
- [ ] **Step 5: Commit** „feat(bauplan): Elektro page copy and component“.

---

### Task 6: Route wiring, docs, local env

**Files:**
- Modify: `src/app/bauplan/[code]/page.tsx` (+ `page.test.tsx`)
- Modify: `CLAUDE.md` (Website; only the Elektro bullet, staged with `git add -p`, Ajdin's own edits stay unstaged)
- Modify: `.env.local` (git-ignored): `BAUPLAN_CODE_ELEKTRO=elektro-quelle-2026`

**Interfaces:**
- Consumes: `bauplanVariant` (Task 1), `ElektroBauplanPage`, `elektroBauplanPage`, `BauplanPdfForm` with `copy` (Task 5).

- [ ] **Step 1: Write the failing tests** in `page.test.tsx` (save/restore `BAUPLAN_CODE_ELEKTRO`):

```ts
it("titles and renders the Elektro page on the Elektro code", async () => {
  process.env.BAUPLAN_CODE = "agentur-7k3m"; process.env.BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026";
  const m = await generateMetadata({ params: Promise.resolve({ code: "elektro-quelle-2026" }) });
  expect(m.title).toBe("Bauplan für Elektrobetriebe");
  expect(m.robots).toMatchObject({ index: false, follow: false });
  const el = await Page({ params: Promise.resolve({ code: "elektro-quelle-2026" }), searchParams: Promise.resolve({ src: "EL07" }) });
  const { container } = render(el);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Mehr Büro als Baustelle?");
  expect(container.querySelector('input[name="src"]')).toHaveAttribute("value", "el07");
});
it("keeps the Agentur page on the Agentur code", async () => {
  process.env.BAUPLAN_CODE = "agentur-7k3m"; process.env.BAUPLAN_CODE_ELEKTRO = "elektro-quelle-2026";
  render(await Page({ params: Promise.resolve({ code: "agentur-7k3m" }), searchParams: Promise.resolve({}) }));
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/lebt von deinen Kunden/);
});
it("404s the Elektro code when its env var is unset", async () => {
  delete process.env.BAUPLAN_CODE_ELEKTRO;
  await expect(Page({ params: Promise.resolve({ code: "elektro-quelle-2026" }), searchParams: Promise.resolve({}) })).rejects.toThrow("NOT_FOUND");
});
```

(If rendering the page pulls the server action into the test, mock `@/app/bauplan/actions` as `BauplanPdfForm.test.tsx` does.)

- [ ] **Step 2: Run** `npx vitest run "src/app/bauplan/[code]/page.test.tsx"` → FAIL (Elektro code 404s / wrong title).
- [ ] **Step 3: Implement**: switch on `bauplanVariant(code)`; title „Bauplan für Agenturen“ | „Bauplan für Elektrobetriebe“; Elektro renders `<ElektroBauplanPage data={elektroBauplanPage} form={<BauplanPdfForm source={normalizeSource(src)} code={code} copy={elektroBauplanPage.pdf.form} />} />`.
- [ ] **Step 4: Run** the file → PASS; then the whole suite `npm test > .superpowers/elektro-landing-suite.log 2>&1; tail -5` → all green; `npx tsc --noEmit` and `npm run lint` clean.
- [ ] **Step 5: Docs**: in `Website/CLAUDE.md` rewrite the Elektro bullet's last sentences: landing page `/bauplan/<BAUPLAN_CODE_ELEKTRO>` (same route, variant resolution in `src/lib/bauplan.ts`, Agentur wins on equal codes), copy `src/lib/elektroBauplanPage.ts`, component `ElektroBauplanPage`, links `?src=el<nn>` (lead-list id), `--publish` also writes `public/bauplan/elektro-bauplan-<hash>.pdf` and the constant `ELEKTRO_BAUPLAN_PDF_PATH` must then be updated, **`BAUPLAN_CODE_ELEKTRO` must be set in Vercel Production before the push**, spec + plan paths.
- [ ] **Step 6: Commit** „feat(bauplan): /bauplan route serves the Elektro page“ (stage only the files of this task; `git add -p CLAUDE.md` for the bullet).

---

### Task 7: Localhost check with Ajdin

- [ ] **Step 1:** `npm run build && npm start`; open `http://localhost:3000/bauplan/elektro-quelle-2026?src=el01` at 390 px and desktop; compare with the mockup; confirm `/bauplan/<local BAUPLAN_CODE>` still shows the Agentur page and a wrong code 404s.
- [ ] **Step 2:** Request the PDF with Ajdin's address: reader mail „Dein Bauplan für Elektrobetriebe“ arrives with `Vrelo-Bauplan-Elektrobetriebe.pdf` (opens, 6 pages); the notification „Elektro-Bauplan angefordert: …“ shows `Quelle: el01` and `Bauplan: Elektrobetriebe` and lands where the Agentur ones land.
- [ ] **Step 3:** Show Ajdin the page on localhost. Changes → back into the tasks above. Then stop: Vercel env `BAUPLAN_CODE_ELEKTRO` and the push to `main` only on his go.
