# Referenzen-Karten — Design Spec (2026-08-16)

Two anonymized reference cards ("what was the problem → what we built → how it runs → the result")
for the Vrelo marketing site, drawn from the two delivered builds: the **Velp** ClickUp phase-engine
and the **MDZ** Telegram voice-assistant. Replaces the two "references coming soon" placeholders.

## Goal & context

- Give a buyer concrete, believable proof from real builds — without naming the clients yet
  (naming is gated on Alen / the MDZ owner; anonymous sidesteps both gates).
- Two placeholders currently promise references and both get replaced:
  - `/leistungen` → `Referenzen.tsx` ("Bald: Stimmen aus echten Betrieben.")
  - Homepage → `Proof.tsx` trailing line ("Erste Kundenreferenzen folgen…").

## Decisions (locked with founder, 2026-08-16)

1. **Honesty framing: outcome only, no commercials.** Cards state problem → build → run → result,
   truthfully. Never say "paid" or "pro bono" — a reference card makes no revenue claim, so it stays
   compatible with the HQ rule that MDZ (pro-bono) proves *delivery*, not *willingness to pay*. The
   Velp engine "läuft" is literally true (live + validated on 5 lists); the MDZ numbers come straight
   from our delivery record.
2. **Placement: both pages, one shared data module** so they never drift.
3. **Anonymity: branch + region** — "Marketingagentur · Region Regensburg" / "Hausmeisterservice ·
   Oberpfalz". No client name, no "Video".
4. **Metrics: one honest number per card** — no invented precision, no prices.
5. **Homepage = compact** (label + title + result line + number); **/leistungen = full** (all four
   beats). Same data, two render depths.
6. **Closing "Ergebnis" beat on both** — the *Merak*-Effekt in plain words: ein freier Kopf, Ordnung
   und Struktur, ein verlässlicher Prozess, der den Betrieb trägt. On the compact card this line *is*
   the one-line result.

## Architecture

Single source of truth, two render depths, reused on both pages.

- **`src/lib/referenzen.ts`** — the two projects as typed data (English code, German content):
  ```ts
  export type Referenz = {
    slug: string;          // "agentur" | "hausmeister"
    label: string;         // "Marketingagentur · Region Regensburg"
    titel: string;         // the one-line headline
    problem: string;       // "Das Problem"
    gebaut: string;        // "Gebaut"
    laeuft: string;        // "Läuft"
    ergebnis: string;      // the freier-Kopf close (also the compact result line)
    kennzahl: string;      // "5 Übersichten" / "1–2 Std./Tag"
    kennzahlLabel: string; // "laufen von selbst" / "zurückgewonnen"
  };
  export const referenzen: Referenz[];
  ```
- **`src/lib/referenzen.test.ts`** — copy-guard, same pattern as `makler.test.ts`: walks every string
  in the exported objects and fails on ASCII quotes, em-dashes, unbalanced „…“, gendered `:innen`
  forms, or a price/currency token. This is the enforcement for the brand punctuation + no-price rules.
- **`src/components/referenzen/ReferenzCard.tsx`** — one card. Prop `variant: "full" | "compact"`.
  - `full`: label · titel · Das Problem · Gebaut · Läuft · Ergebnis · Kennzahl.
  - `compact`: label · titel · ergebnis (result line) · Kennzahl.
  - Opaque `card-depth` papier card; petrol accent on the Kennzahl. On-light tokens (tinte body,
    tiefes-wasser/ember headings) — no on-dark variant needed (both hosts are light/warm surfaces).
- **`/leistungen` — rewrite `Referenzen.tsx`**: `Section tone="paper"`, heading + intro, then a
  `grid gap-… sm:grid-cols-2` of two `full` cards (stacks on mobile). Keeps its slot before
  `ClosingCta`.
- **Homepage — edit `Proof.tsx`**: keep the 4 value tiles; replace the trailing
  "Erste Kundenreferenzen folgen…" paragraph with a `sm:grid-cols-2` grid of two `compact` cards.
  No new section → the tuned Spine-A backdrop sequence (…→ Proof → MerakClose) is untouched; the
  frosted-surface Proof section already reads as "here's the proof."

## Copy (drafts — run through `stop-slop`, then byte-check/repair German quotes + en-dash before ship)

**Card 1 — die Agentur (Velp):**
- label: „Marketingagentur · Region Regensburg“
- titel: „Die Kundenpipeline steuert sich selbst.“
- problem: „Jeder neue Kunde durchlief dieselben Phasen – von Hand weitergeklickt, Aufgaben jedes Mal
  neu angelegt, Fristen manuell gesetzt. Das kostete täglich Zeit und ging leicht unter.“
- gebaut: „Ein System, das jede Kundenkarte automatisch weiterschaltet, sobald ihre Aufgaben erledigt
  sind – mit den passenden Aufgaben und Werktags-Fristen für die nächste Phase.“
- laeuft: „Seit Monaten still im Hintergrund, quer durch fünf Übersichten – ohne dass jemand eine
  Karte von Hand bewegt.“
- ergebnis: „Am Ende: ein freier Kopf. Ordnung und Struktur statt täglichem Nachhalten – ein
  verlässlicher Prozess, der den Betrieb im Hintergrund trägt.“
- kennzahl: „5 Übersichten“ · kennzahlLabel: „laufen von selbst“

**Card 2 — der Hausmeisterservice (MDZ):**
- label: „Hausmeisterservice · Oberpfalz“
- titel: „Das Büro läuft per Sprachnachricht.“
- problem: „Der Inhaber ist den ganzen Tag auf seinen Objekten, selten am Schreibtisch. E-Mails,
  Termine, Aufgaben und Rechnungsdaten stapelten sich – und wurden abends nachgeholt.“
- gebaut: „Ein Assistent per Telegram: Er spricht unterwegs kurz hinein, der Rest passiert von selbst
  – E-Mail geschrieben und verschickt, Termin eingetragen, Aufgabe an einen Mitarbeiter, Notiz
  abgelegt, Rechnungsdaten erfasst.“
- laeuft: „Aus ein bis zwei Stunden Büroarbeit am Abend wird eine kurze Sprachnachricht zwischendurch.“
- ergebnis: „Am Ende: ein freier Kopf. Der Ablauf ist geordnet und läuft verlässlich – der Inhaber
  muss nicht mehr daran denken.“
- kennzahl: „1–2 Std./Tag“ · kennzahlLabel: „zurückgewonnen“

## Brand & compliance

- German punctuation: „…“ quotes (U+201E/U+201C), spaced en-dash „ – “ (U+2013), generic masculine.
  Enforced by `referenzen.test.ts`; verify bytes after every write (Write/Edit downgrade the closing
  quote).
- **No prices** anywhere (site rule) — guarded by the copy test.
- No AI label needed: these are text cards, no imagery, no "I"-claim next to a generated real-person
  photo (UWG §5 trigger does not apply).
- *Merak* is a felt result, never a package name — the `ergebnis` beat describes the feeling, it does
  not brand it.

## Testing

- `referenzen.test.ts` copy-guard (above).
- `ReferenzCard.test.tsx`: renders both variants; `full` shows all four beats, `compact` omits
  problem/gebaut/laeuft; the Kennzahl renders.
- Existing `Proof.test.tsx` updated: the "coming soon" assertion is replaced by an assertion that the
  two compact cards render.
- Full gate: `npm test` · `npx tsc --noEmit` · `npm run lint` · `npm run build`, then a browser check
  at 1440 + 390 (`npm start`).

## Out of scope

- Named testimonials / quotes / logos (blocked on owner approvals — future work once Alen and the MDZ
  owner OK it).
- A dedicated `/referenzen` page or case-study long-form.
- Process-run screenshots/videos (separate HQ todo).
