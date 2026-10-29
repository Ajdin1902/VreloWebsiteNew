# Elektro-Bauplan: unlisted landing page + PDF by e-mail (design)

**Date:** 2026-10-29 · **Status:** draft for Ajdin's review · **Owner:** Ajdin Dzafic
**Context:** the PDF is done (spec `2026-10-29-elektro-bauplan-pdf-design.md`, shareable copy `Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf`). This page reuses the Agentur-Bauplan mechanics (spec `2026-10-27-agentur-bauplan-design.md`, code under `src/app/bauplan/`, `src/components/bauplan/`, `src/lib/bauplan*.ts`). Brainstormed with Ajdin 2026-10-29.

## 1. Intent

Ajdin e-mails owner-led Elektrobetriebe from his local lead list (Regensburg/Oberpfalz, `Knowledge/marketing/leads/leads.csv`, subsegment `elektro`, 175 rows, none contacted). Each mail carries a personal link to this page. The page has one job: **the Meister sees his own pain in five seconds and requests the PDF.** Everything on it serves that (Ajdin: „the real value is them seeing their pain and getting the pdf“).

The page is compact by decision: page 1 of the PDF as a web page, cut down. The detail (the „So gehst du vor“ boxes, tools per stage, the facts) stays in the PDF so the PDF stays worth requesting.

## 2. Goals, non-goals, anti-goals

**Goals**
- Pain first: the three-line evening/weekend picture and the HWK 61 % above the fold on a phone.
- One action: request the PDF by e-mail. A button in the hero jumps to the form.
- Hormozi landing-page order, compact: hero (pain + CTA) → outcome/solution (the assistant, Heute | Mit) → value stack (what is in the PDF) → form. Objections answered inside the copy: free, only one mail, start with one stage, nothing goes out without your approval, DSGVO.
- `?src=el<nn>` per recipient, so Ajdin sees which Betrieb requested.

**Non-goals**
- No price, no duration, no call CTA, no calendar. The only ask is the form; the PDF's closing P.S. carries the soft ask.
- No newsletter sign-up, no tracking beyond the internal notification.
- Not public: `noindex`, not in the sitemap, not linked anywhere.
- The outreach mail wave itself is not part of this build (it runs through the `writing-outreach-emails` skill once the page is live; template draft in §8 for reference).

**Anti-goals (failure even if it works)**
- A long page that reads like the PDF. If a section does not move the reader toward the form, it goes.
- Any client name or Power-Connect detail (same exclusion list as the PDF guard).
- Offer voice („mit mir“, „richte ich ein“): the page is a free guideline, like the PDF.
- The MDZ two-hour line or the Regensburg/BMW sentence on the page: **mail only** (Ajdin 2026-10-29).
- Hype register, exclamation marks. Brand.md wins over Hormozi tone.

## 3. Constraints

- **Brand:** `Website/Brand.md`. Papier background, Plus Jakarta Sans, du-form, generic masculine, German quotes „…“, **no Gedankenstrich**, **no comma before „und“**, *Vrelo* in Fraunces italic via `BrandWord` where it appears.
- **Facts (from the PDF spec):** the 61 % is always „der befragten Handwerksbetriebe“ and about Bürokratie, with the source line and link. No promise for Rexel/FEGA, never „alle Großhändler“.
- **Copy guards:** extend the existing guard style to the new page copy: `findCopyIssues` clean, no price/duration words, no offer phrases, no client names (reuse the regexes from `elektroBauplanTemplate.test.ts`).
- **DSGVO:** the existing Datenschutz section „Bauplan-PDF anfordern“ already covers „das PDF“ on „der nicht öffentlich verlinkten Seite zum Bauplan“; no new legal text (Claude's call; it is written generically).
- **Prose:** the page and reader-mail copy in §5 and §7 already went through `stop-slop` (2026-10-29) and is frozen once Ajdin approves this document. The builder pins it word for word in tests and does not reword it; any copy change goes back to Ajdin first. Ajdin sees the built page on localhost before anything is pushed.
- Deploy to prod only on Ajdin's go.

## 4. Routing and configuration

- Same route `/bauplan/[code]`. A second env var **`BAUPLAN_CODE_ELEKTRO`** holds the Elektro slug (proposal: `elektro-quelle-2026`, set in Vercel and `.env.local`). `BAUPLAN_CODE` keeps serving the Agentur page unchanged. Each code can be rotated without touching the other; an unset var means that variant 404s.
- A code resolves to a variant: `agentur` | `elektro` | none (404). The page, the metadata title (`Bauplan für Elektrobetriebe`), the form and the server action all go through that resolution. The action re-checks the code it receives, so a rotated code also retires open pages (existing behaviour, keep it per variant).
- The prefix focus route `/bauplan/` already gives the logo-only header and minimal footer; nothing to change in `nav.ts`.
- **Builder's call:** how the variants are modelled (a small registry keyed by variant with PDF path, attachment filename, mail copy and page component is the expected shape). Existing Agentur tests must stay green and unchanged in meaning.

## 5. The page (copy final: `stop-slop` pass done 2026-10-29, approved with this document)

One column, phone first, max width about 720 px. Four blocks.

**1. Hero (dark pain band, the PDF's `schmerz` look: tiefes-wasser background, honig accents)**
- Kicker: „Bauplan für Elektrobetriebe“
- H1: „Mehr Büro als Baustelle?“
- Three lines: „Tagsüber auf der Baustelle.“ / „Abends Angebote und Rechnungen.“ / „Am Wochenende der Rest.“
- Statistic: „61 %“ (Fraunces italic, large) + „der befragten Handwerksbetriebe sagen: Durch Bürokratie bleibt weniger Zeit für die Aufträge.“
- Source, small: „Handwerkskammer Dortmund, Sonderumfrage 2023, rund 700 Betriebe · hwk-do.de“ (link to the HWK PDF, same URL as the PDF template)
- Button: „Bauplan kostenlos anfordern“ → jumps to `#pdf`.

**2. The solution**
- H2: „Dein Bauplan zum Selbstbau: der eigene KI-Büroassistent“
- One line: „Er bereitet Angebote, Rechnungen und Bestellungen vor. DSGVO-konform.“
- Four-step flow (chips, wrap to 2×2 on a phone; last chip highlighted as in the PDF): „Du sprichst ein“ · „Er versteht“ · „Er bereitet vor“ · „Du gibst frei“.
- Heute | Mit dem Büroassistenten, three rows (Claude's call: the fourth PDF row „Wissen nur in deinem Kopf“ is dropped for compactness):
  - Angebote am Abend → Einsprechen, Entwurf liegt bereit
  - Preise einzeln nachschlagen → Einkaufspreise kommen automatisch
  - Rechnungen von Hand → Rechnung mit einem „passt“

**3. Value stack: „Das steht im Bauplan“** (Ajdin 2026-10-29: its own honey-coloured card, `bg-sonnenlicht` with a `honig` left border and tiefes-wasser bullets, so it stands apart from the Papier sections; mockup `docs/design/elektro-bauplan/landing-mockup.html`)
- „Fünf Stufen: Fundament, Betriebsgehirn, Angebote und Rechnungen, Großhandel, Ausbau. Du fängst mit einer an.“
- „Zu jeder Stufe: „So gehst du vor“, Schritt für Schritt.“
- „Beispiele mit Programmen, die du kennst: sevDesk, Lexware, ELDIS, Datanorm.“
- „Drei Regeln, damit nichts ohne deine Freigabe rausgeht und alles DSGVO-konform bleibt.“
(Claude's call: the „Drei Regeln“ box from PDF page 1 becomes this one bullet; the full rules live in the PDF.)

**4. The form (`id="pdf"`, bordered card, the only form)**
- H2: „Den Bauplan als PDF“
- Line: „Kostenlos, sechs Seiten. Ich schicke ihn dir per Mail.“
- Label: „Deine E-Mail-Adresse“ · Button: „PDF zuschicken“ · pending label as on the Agentur form
- Under the button: „Du bekommst nur diese eine Mail.“ + link „Datenschutz“
- Success (inline): „Ist unterwegs. Schau auch im Spam-Ordner nach.“
- Same anti-spam as the Agentur form: honeypot, minimum fill time, hidden `src` and `code`.

Nothing after the form. No Merak block, no origin line.

## 6. The PDF file

- The approved PDF (`Website/.preview/elektro-bauplan.pdf`, byte-identical to `Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf`) is copied to `public/bauplan/elektro-bauplan-<first 8 hex of sha256>.pdf`. No re-render: extend `scripts/render-elektro-bauplan.mjs --publish` to also write the hashed public copy (and remove older `elektro-bauplan-*.pdf`), print the name, and the constant for the PDF path is updated to it.
- ⚠ Same rule as the Agentur file: the hashed filename is load-bearing, never rename it, no clean-named copy in `public/`.
- Attachment filename in the mail: `Vrelo-Bauplan-Elektrobetriebe.pdf`.

## 7. The e-mails (form → Resend)

Same flow and error handling as `submitBauplanRequest`: PDF attached as bytes (disk first, fetch fallback), reader mail first, internal mail second, internal failure does not fail the request.

**Reader mail** (du, like the page)
- Subject: „Dein Bauplan für Elektrobetriebe“
- Body: „Hallo, / der Bauplan hängt als PDF an dieser Mail. Falls der Anhang nicht ankommt, lädst du ihn hier: <link> / Fang mit der Stufe an, die dich heute am meisten Zeit kostet. Zu jeder Stufe steht drin, wie du vorgehst. / Ajdin Dzafic“. No further ask (the PDF's P.S. is the ask). HTML + plain text.

**Internal mail**
- Subject: „Elektro-Bauplan angefordert: <email>“; body: E-Mail, Quelle (`src` or „Website“), Zeitpunkt, and the variant. `replyTo` = the reader.
- **Builder check:** the Agentur notifications land in `INBOX.System`; confirm whichever rule routes them (Postfach-Assistent or a mailbox filter) also matches the new subject, or adjust the subject to keep matching.

## 8. Outreach mail (reference only, built later with `writing-outreach-emails`)

Sie by default, mirrored per Betrieb (du/Sie rule). Subject „Weniger Büro am Abend: ein Bauplan für Elektrobetriebe“. Body: personal opener · Bauplan sentence · „Ich komme aus Regensburg. Nach über drei Jahren als IT-ler bei BMW habe ich meine eigene IT-Firma gegründet: Vrelo.“ · proof „Für einen Hausmeisterservice läuft ein Sprachassistent nach diesem Muster. Er spart dem Inhaber jeden Tag zwei Stunden Büroarbeit nach der eigentlichen Arbeit.“ (confirmed by Ajdin 2026-10-29; business not named; if asked: MDZ = his father's business) · link `vrelo-ki.de/bauplan/<code>?src=el<nn>` + PDF attached · „Viele Grüße, Ajdin Dzafic“ · „P.S. Bei Fragen von Ihrer Seite melden Sie sich einfach bei mir.“ · the usual signature. Cold e-mail to local Betriebe: Ajdin's decision, UWG § 7 risk carried as for the agencies. The lead list gets the `kontakt_status`/`kontakt_log` columns used the same way.

## 9. Tests (what „done“ means)

- Route: Elektro code renders the Elektro page with title „Bauplan für Elektrobetriebe“ and `noindex`; Agentur code still renders the Agentur page; a wrong code and an unset `BAUPLAN_CODE_ELEKTRO` 404; the two codes never cross (the Elektro code never serves the Agentur page and vice versa).
- Action: a valid Elektro request sends the reader mail with the Elektro subject, the Elektro attachment filename and the Elektro PDF bytes; the internal mail names the variant and `src`; a code that matches no variant refuses.
- Page: the order hero → solution → value → form; the hero button targets `#pdf`; the 61 % sentence, source and link are present; exactly one form; no element after the form.
- Copy guards on the page data and the reader mail (see §3), plus „Kostenlos“ and „nur diese eine Mail“ present.
- Sitemap still has no `/bauplan` entry.
- Manual: `npm start`, phone width, request with a real address, both mails arrive, attachment opens, `src` shows in the notification. Vercel env `BAUPLAN_CODE_ELEKTRO` set before the push; push only on Ajdin's go.

## 10. Left to the builder

- Component structure and Tailwind classes (reuse site tokens: `bg-tiefes-wasser`, `text-honig`, `bg-gletscher`, `bg-sonnenlicht`, card and button styles of the Agentur page).
- Whether the Elektro page gets its own component (expected) or shares parts with `BauplanPage`.
- Exact pending label and error copy (reuse the Agentur ones).

## 11. Afterwards (not this build)

- First outreach wave via `writing-outreach-emails` (new template folder `templates/elektro/`, target CSV `leads.csv` filtered to `subsegment = elektro`).
- HQ CLAUDE.md §2.2 line updated with the live URL pattern; Vault light sync.
