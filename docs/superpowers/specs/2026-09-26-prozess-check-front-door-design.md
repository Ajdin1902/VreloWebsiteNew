# Prozess-Check as the front door — design (2026-09-26)

> Decided in session with Ajdin, 2026-09-26. Funnel background: `Knowledge/marketing/prozess-check-funnel.md` (HQ). This spec makes the free Prozess-Check the primary call to action across the site and every off-site channel.

## 0. Intent

- **Outcome:** more completed Prozess-Checks → more booked 30-minute calls → the HQ §3 conversation counter moves (walk-in round starts 2026-10-01).
- **Problem today:** printed channels already route to the check (`/brief`, `/flyer`), but the site does not. Every primary button (header, hero, Steps, MerakClose, every subpage ClosingCta) goes to `/kontakt`; the check appears only as an inline link (Problem) and a small card (Referenzen). Cold visitors are asked for the biggest step first.
- **Decision — "check first, call second":** every primary CTA goes to `/prozess-check`; the Erstgespräch stays reachable as a quiet secondary link („Lieber direkt reden? Erstgespräch buchen“) for warm visitors. No dead end: the check's result screen already embeds the Cal booking.
- **Value Equation (HQ §8):** Effort & Sacrifice down (3 minutes, no login, result without e-mail vs. a call with a stranger); Perceived Likelihood up (a visible example result before the click); Time Delay down (instant result).
- **Constraints:** calm Vrelo voice, no fake scarcity or countdowns · no Vrelo price and no € figure anywhere in check copy (HQ §4; the funnel doc's „€500-Wert“ stays verbal, sales conversations only, never on the site) · German copy dash-free, „…“ quotes, generic masculine, du · every new or changed German string runs through `stop-slop` before shipping.

## 1. Attribution — `?src=` per placement

`/prozess-check` already reads `?src=` (`src/lib/source.ts`, allow-listed slug ≤ 32 chars, ≤ 4 segments) and writes it into the Cal booking notes and the result e-mail. Every link to the check carries its own slug. No new analytics code.

| Slug | Placement |
|---|---|
| `header` | Header button (desktop + mobile menu) |
| `home-hero` | Homepage hero |
| `home-check` | Homepage Prozess-Check section |
| `home-steps` | Homepage Steps |
| `home-close` | Homepage MerakClose |
| `leistungen-audit` | /leistungen audit card |
| `leistungen-einwand` | /leistungen „Woran es scheitert“ row |
| `leistungen-close` | /leistungen ClosingCta |
| `ratgeber` | /ratgeber index + all article ClosingCtas |
| `ueber-mich` | /ueber-mich ClosingCta |
| `faq` | /faq ClosingCta secondary link |
| `kontakt` | /kontakt hint line |
| `footer` | Footer link |
| `karte` | /karte button |
| `warm`, `linkedin`, `newsletter`, `google` | Off-site (§4) |
| `partner-<name>` | Via `/empfehlung/<name>` redirect (§4.2) |

Links are built from one helper (e.g. `checkHref(src)` in `src/lib/`) so the slug format is tested once.

## 2. Homepage

**Order:** Hero → Problem → **ProzessCheckSection (new)** → WasIchBaue → Werkzeuge → Steps → Proof → Referenzen → MerakClose.

**Hero.** H1 unchanged („Manuelle Prozesse rauben dir die Zeit.“).
- Subline: „Ich baue maßgeschneiderte Automatisierungen für deinen Betrieb. Wo du anfängst, zeigt dir der Prozess-Check: drei Minuten, und du siehst, wie viele Stunden pro Woche im Kleinkram stecken.“
- Primary button „Prozess-Check starten“ → `home-hero`.
- Microcopy: „Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.“
- Secondary link: „Lieber direkt reden? Erstgespräch buchen“ → `/kontakt`.

**Problem.** Remove the inline Prozess-Check sentence; the section ends on the pain, the new section answers it.

**ProzessCheckSection (new component, `src/components/home/`).** Deep petrol band matching its dark neighbours; two columns on desktop, stacked on mobile.
- Eyebrow „Der Prozess-Check“ · H2 „Wie viele Stunden sind es bei dir?“
- Three steps (left):
  1. „Sechs kurze Fragen“ — „Kein Login, nichts vorzubereiten. Du schätzt, ich rechne.“
  2. „Dein Ergebnis sofort“ — „Deine Stunden pro Woche und die Aufgabe, die dich am meisten kostet. Direkt auf dem Bildschirm, ohne E-Mail-Adresse.“
  3. „Wenn du willst: 30 Minuten mit mir“ — „Wir klären, welche Aufgabe ein System übernehmen kann. Lohnt sich etwas, bekommst du in ein bis zwei Tagen einen Fahrplan. Kostenlos, und er gehört dir.“
- Example card (right): papier card, visibly labelled „Beispiel“; „Rund 9 Stunden pro Woche“, top three areas as bars, one area sentence. Built from the real result's data and pieces (`AREA_LABEL`, `AREA_SENTENCE`, the result's bar styling) with a fixed sample answer set, so the preview cannot drift from the real result screen.
- Primary button „Prozess-Check starten“ → `home-check`.

**Steps.** Step 1 „Hinschauen“ desc → „Der Prozess-Check und ein kurzes Gespräch zeigen, welche Aufgaben dich täglich Zeit kosten.“ Button → `home-steps`; microcopy as hero.

**Referenzen.** Remove the „Dein erster Schritt“ card (absorbed by the new section; MerakClose follows directly).

**MerakClose.** Heading unchanged. Lead → „Das ist der *Merak*-Effekt. Der erste Schritt dauert drei Minuten: Der Prozess-Check zeigt dir, wo deine Stunden hingehen. Kein Verkaufsgespräch.“ Button → `home-close`; secondary Erstgespräch link.

**Header (all pages).** Desktop and mobile-menu CTA → „Prozess-Check“ → `header`. „Kontakt“ stays in the nav. Focus routes (`/prozess-check`) keep their logo-only chrome.

## 3. Subpages

**ClosingCta.** Default target becomes the check; new props for the button label, the `src` slug and an optional secondary link („Lieber direkt reden? Erstgespräch buchen“ → `/kontakt`). Callers set heading/lead/slug.

- **/leistungen audit card** (`src/lib/prozess-audit.ts`): swap roles — primary „Prozess-Check starten“ → `leistungen-audit`; Erstgespräch becomes the secondary link. Card copy unchanged.
- **/leistungen „Woran es scheitert“** (`src/lib/leistungen-weg.ts`): check link gets `leistungen-einwand`.
- **/leistungen ClosingCta:** heading unchanged („Lass uns deine Quelle bauen.“); lead „Fang mit drei Minuten an: Der Prozess-Check zeigt dir, welche Aufgabe dich am meisten kostet. Danach reden wir, wenn du willst.“ → `leistungen-close`.
- **/ratgeber + /ratgeber/[slug] ClosingCta:** heading „Wie viel Zeit kostet dich das?“; lead „Der Prozess-Check zeigt dir in drei Minuten, wie viele Stunden pro Woche bei dir in solchen Aufgaben stecken.“ → `ratgeber`. No mid-article box in this round (revisit if Search Console shows real article traffic).
- **/ueber-mich ClosingCta:** heading „Fang klein an.“; lead „Der Prozess-Check zeigt dir in drei Minuten, wo deine Zeit hingeht. Wenn du danach reden willst, bin ich da.“ → `ueber-mich`; secondary Erstgespräch link visible.
- **/faq — the one exception:** ClosingCta keeps `/kontakt` primary (question intent = writing); the check is the secondary link → `faq`. FAQ data (`src/lib/faq.ts`):
  - „Wie fange ich an?“ → „Mit dem Prozess-Check: sechs kurze Fragen, drei Minuten, dein Ergebnis sofort. Wenn du danach reden willst, buchst du dir direkt 30 Minuten mit mir.“
  - New entry „Ist der Prozess-Check wirklich kostenlos?“ → „Ja. Du bekommst Klarheit über deine Zeit, ich lerne deinen Betrieb kennen. Ob wir danach zusammenarbeiten, entscheidest du.“ (flows into the FAQPage JSON-LD automatically)
- **/kontakt:** scheduler stays first; one small line above it: „Noch unsicher, ob sich ein Gespräch lohnt? Der Prozess-Check zeigt es dir in drei Minuten.“ → `kontakt`.
- **Footer:** add a „Prozess-Check“ link → `footer`.
- **/karte:** second button „Prozess-Check“ under the contact buttons → `karte`.
- **Unchanged:** `/prozess-check` itself, newsletter pages, legal pages.

## 4. Off-site checklist (settings + copy, not code — except 4.2)

1. **Warm conversations** (Schmid 2026-09-28, Zilk, M1, Göcze): before the call send „Wenn du magst, mach vorher den Prozess-Check, drei Minuten. Dann reden wir direkt über deine Zahlen.“ with `?src=warm`. Add the line to `Knowledge/marketing/first-client-conversations.md`.
2. **Referral partners** (agencies from 2026-10-01, Alen, MDZ owner): `vrelo-ki.de/empfehlung/:partner` → `/prozess-check?src=partner-:partner`, one redirect in `next.config` next to `/brief/:segment`. Booking notes then show the referrer — the proof the Tippgeber model needs (the § 299 question stays open, HQ §6). Walk-in ask: „Schick deinen Kunden einfach diesen Link.“
3. **LinkedIn** (no links in posts; cadence unchanged): Featured section + profile website button → `?src=linkedin`; the ≈1×/month sales post is about the check, link only in the first comment.
4. **Newsletter „Die Quelle“:** next issue's single P.S. ask = the check (`?src=newsletter`) instead of the reply ask; afterwards roughly monthly, rotating with the reply ask.
5. **Google-Unternehmensprofil:** „Terminbuchungslink“ → `?src=google`; website field stays the homepage. One update post with a real photo (§6a photo rule).
6. **E-Mail-Signatur:** „Wie viel Zeit frisst der Kleinkram bei dir? Prozess-Check in drei Minuten: vrelo-ki.de/prozess-check“
7. **VSL** (when recorded): closes on the check.

## 5. Testing

- Unit test for the `checkHref` helper (slug passes `normalizeSource`).
- Component tests: every CTA listed in §1 renders the expected href incl. slug; secondary Erstgespräch links point to `/kontakt`; FAQ exception keeps `/kontakt` primary; the Referenzen „Dein erster Schritt“ card and the Problem inline link are gone.
- ProzessCheckSection: example card is labelled „Beispiel“ and renders labels/sentences from the real `prozessCheck` data.
- Redirect test for `/empfehlung/:partner` if the redirects are covered; otherwise a manual check after deploy.
- Existing copy guards stay green (no Gedankenstrich, „…“ quotes, no € amounts in check copy); byte-check new German strings for U+201E/U+201C after writing.
- Manual pass: `npm start`, homepage + one subpage per type at mobile and desktop width, click-through to the check with the slug visible in the booking notes.

## 6. Measurement + review

- **Visible:** `/prozess-check` visits by referrer (Vercel Analytics) · booked calls by `src` (Cal notes; internal e-mail when an address is left).
- **Known gap:** a completed check without booking or e-mail is invisible. Closing it needs custom events (paid Vercel plan, to verify); not worth it yet.
- **Review 2026-10-10:** count check visits and bookings per slug; the placement with zero bookings is reworked first. Mid-article Ratgeber box and a hero-embedded first question (approach C) are the candidates for the next round.

## 7. Out of scope

- Changes to the questionnaire, scoring or result screen.
- Hero-embedded quiz (approach C) — later test after the review.
- Any public price or „€500-Wert“ on the site.
- Paid analytics.
