# Website review 2026-11-04 — triage of the 50 findings

Source: an external strict review of vrelo-ki.de (50 numbered findings, read as text only; Ajdin's copy `OneDrive/Desktop/improve.md`). This file sorts every finding into one of four buckets and records what was done. Numbers are the review's own.

Buckets: **Done** (branch `fix/review-2026-11-04`) · **Wrong** (the site already does it or the finding is factually off) · **Decided otherwise** (an HQ/Brand decision stands; reopen only with Ajdin) · **Ajdin** (a real point that needs his call or his input before anything is built).

## Done (commit on `fix/review-2026-11-04`)

| # | Finding | What changed |
|---|---|---|
| 6 | Guarantee conditions undefined | FAQ „Was passiert nach dem Projekt?“ now names the condition (14 days after handover, full refund + Rückbau, only after the free Prozess-Audit). Homepage placement → Ajdin. |
| 10 | „wir nennen“ on Über mich | „nenne ich Merak“. |
| 12 | Gender of „Audit“ switches | „der Prozess-Audit“ everywhere (two spots in `leistungen-weg.ts`). |
| 17 | „jahrelanger“ vs. „über drei Jahre“ | „seit über drei Jahren Prozessautomatisierer“. |
| 22/23 | Retainer vs. build-price math | FAQ sentence: the Betreuung price follows the yearly value of the task, not the build price (HQ §4 Retainer-Tiers-Begründung). The Ratgeber's 10 to 15 % stays a market range. |
| 25 | „sicher ohne Betreuung“ contradiction | FAQ: the server's OS patches itself, the applications stay at handover state (= HQ VreloVPS „secure but frozen“). |
| 26 | „keine weiteren Fremdkosten“ too absolute | FAQ: tool fees for paid API tiers (e.g. some CRMs) can apply, clarified before the decision. |
| 27 | KI cost assumption missing | FAQ: 5 to 10 Euro assumes a normal mailbox with a few dozen mails a day. |
| 29 | Förderung only on the audit page | Same Digitalbonus note on `/leistungen/prozessautomatisierung` + `/leistungen/ki-automatisierung` (shared `FOERDERUNG_NOTE`), new FAQ entry „Gibt es eine Förderung?“ (incl. „Antrag vor Auftrag, auch mündlich“ and Praxen/Freie Berufe excluded). Kept on the audit page on purpose: the application must precede the order. |
| 32 | Claude (US) vs. „Modelle in der EU“ | FAQ „Was passiert mit meinen Daten?“: sensitive builds run the model on servers within the EU in the client's own account; Claude für Unternehmen is a service of the US provider Anthropic, what goes in is agreed first. Wording „innerhalb der EU“, never „Frankfurt“ (HQ rule). |
| 33 | AI Act Art. 4 not used | Note on `/leistungen/ki-schulung`: Art. 4 KI-VO (AI literacy, since Feb 2025) with EUR-Lex link. |
| 34 | Prozess-Check storage unclear | One line under question 1: runs in the browser, only what you e-mail yourself is stored (matches the Datenschutzerklärung). |
| 35 | Dead EU ODR link | Removed; the § 36 VSBG sentence stays. `legal.test.ts` pins the absence. |
| 38 | No „Agentur“ in the Prozess-Check | Branche „Agentur oder Beratung“ added (type, action allow-list, e-mail label). |
| 42 | FAQ links land on the generic page | `faqAnchor()`/`faqHref()` in `faq.ts`, `id` on every `<details>`, `OpenFaqFromHash` opens the answer; the four `/leistungen` obstacle links deep-link. Test pins that every `/faq#` anchor exists. |
| 45 | Twitter meta = homepage on every page | Root layout keeps only `twitter.card`; title/description fall back per page. Verified in the build: `twitter:title` = „Prozess-Audit — Vrelo“. |
| 46 | Service pages: no og:image/og:locale, no suffix | Per-page `openGraph` objects removed (a page-level object replaced the layout's whole openGraph). Verified: og:title with suffix, `og:locale de_DE`, og:image on every page. |
| 47 | 3840 px hero candidates | `images.deviceSizes` capped at 1920. Verified: largest srcset candidate 1920w. |
| 50 | „No structured data“ (local angle) | FAQPage, Article, Person, Service and ProfessionalService already existed; added `PostalAddress` Regensburg to the ProfessionalService. |

## Wrong (nothing to do)

- **48 WebM only:** every `LazyVideo` ships `<source webm>` + `<source mp4>`, lazy via IntersectionObserver, reduced motion → poster. `optimize-videos.mjs` renders both.
- **49 Hero alt empty:** the hero is an abstract water backdrop under the H1; decorative `alt=""` is the documented decision (CLAUDE.md design system).
- **50 structured data:** see above, it existed.
- **43 Ratgeber taxonomy „broken“:** the filter runs on `kategorie` (every article has one); the chips the reviewer saw are `tags`, a separate field. Works as designed. Optional polish: hide tags on the cards so the two vocabularies don't sit side by side.
- **30 „DSGVO-konform just asserted“ (partly):** the Datenschutzerklärung does list the processors (Resend, Cal.com, Vercel, Anthropic + Notion for the mailbox). An AVV/TOM page is a real gap → Ajdin.

## Decided otherwise (HQ CLAUDE.md / Brand.md; reopen only with Ajdin)

- **1 Nine services:** Entscheid 2026-10-01 (KI-/Automatisierungs-Menü, HQ §3). Why: „Prozessautomatisierung“ isn't understood on first hearing, the KI work was invisible.
- **4/5/8 Niche in the hero, „du“ for Mittelstand:** buyer widened 2026-10-01 („Betriebe und Unternehmen“, Brand.md §5); „du“ is the brand voice; hero copy locked 2026-08-18. The conversation plan stays local + warm, the site stays wide.
- **9 „Quelle“/„Merak“ jargon:** the brand's two owned words (HQ §9, LinkedIn playbook §2b). Fair sub-point: the homepage uses „Merak-Effekt“ before explaining it → Ajdin (one explaining line at `MerakClose`?).
- **11 „KI“ in the headline:** Brand = Vrelo, descriptor decided; domain carries the keyword.
- **13 Meinung tone:** the Meinung category is a deliberate separate register (2026-10-08). The Schwarzenegger teaser is text only (the look-alike cover was already dropped).
- **14/15/18 anonymous references:** names wait on Alen's and Mirsad's OK (HQ §7 Proof-Freigaben); „seit Monaten“ stays until a confirmed number exists. Nothing to change on the site until the OKs arrive.
- **24 example packages with prices:** offer pages stay price-free, FAQ shows ranges (Website decision 2026-08-18, HQ §4: the price is named in the Fahrplan-Durchsprache).
- **28 server for every build:** the site FAQ already says „Cloud-Lösung oder selbstgehostet“; HQ delivery split = n8n Cloud for non-sensitive builds. No overclaim found.
- **40 Preise page:** same as 24. Referenzen page → Ajdin.
- **41 Claude-Gehirn hidden:** gift by decision, no ask, linked only from `/leistungen/claude` and LinkedIn (HQ §2.2).
- **44 thin Ratgeber:** content strategy; fewer/deeper niche pieces is a fair direction but no change without Ajdin.

## Ajdin (a real point, needs his call or input)

1. **2 Merge KI-Beratung and Prozess-Audit** (both free, both a talk, both end in a roadmap). Recommendation: keep both pages but make KI-Beratung the Erstgespräch and the Audit its step 2 more explicitly, or fold KI-Beratung into the audit page. Costs the nine-services decision one item.
2. **3 Category placement:** KI-Server under „Automatisieren“, KI-Betriebssystem under „Betreiben“, the free audit under „Befähigen“. Cheap to move in `leistungenPages.ts` (`group`), but it changes the hub spec.
3. **6 Guarantee above the fold** on the homepage (plus ownership and the price range). Strongest proof point, currently step 6 on `/leistungen`. Needs a hero/Problem-section decision.
4. **7 Bus factor:** a sentence on illness/holiday/stop („Alles gehört dir, läuft ohne mich weiter“ exists in the Angebot since 2026-10-14) for the site FAQ. Needs Ajdin's actual answer on Vertretung.
5. **16 „Über 160 Stunden im Konzern“:** name the industry/size or get permission. The employer is not recorded in HQ (memory: UiPath background, employer unrecorded).
6. **19 Personal LinkedIn profile:** footer and Über mich link only the company page. Needs his profile URL (then `site.ts` `sameAs` + footer + personLd).
7. **20 „Zertifizierte Anbieter“ unspecified** in the FAQ data answer: name them (Hetzner ISO 27001, AWS) or drop the word.
8. **22 Price contradiction inside HQ:** site FAQ says Betreuung 350 bis 1.000 €/Mo, HQ §4 lists tiers 219 · 420 · 1.019 · VIP. HQ says „the site range is the source of truth“ but the tiers disagree. Decide which number is public.
9. **30/31 Data-protection page:** AVV, TOMs, sub-processor list, Berufsgeheimnisträger (§ 203 StGB). The AVV draft exists in `Clients/_kit/referenz-bau/` but is not lawyer-checked (HQ §7). Either publish nothing until checked, or remove „Praxis oder Kanzlei“ from the Prozess-Check (HQ says Praxen + Kanzleien are out by decision for the Landkarten and the Outreach Engine; the check still offers them).
10. **36 „Erstgespräch buchen“** leads to a consent click. Options: relabel („Termin wählen“) or link straight to `cal.com/ajdin-dzafic-vrelo/30min` (external, loses the `?src=` notes prefill).
11. **37 Phone number:** none on the site. Business decision (reachability vs. protecting his time).
12. **39 Newsletter in the nav:** swap the nav slot for Referenzen or Preise.
13. **40 Referenzen page:** real page vs. the current anchor on `/leistungen`. Only worth it once names are released (14/15/18).
14. **9 (sub-point) Merak explained before used** on the homepage.
15. **43 polish:** hide `tags` chips on Ratgeber cards (two vocabularies side by side confuse).
16. **44 Ratgeber depth:** fewer, deeper niche pieces (Makler, Hausmeister) vs. the current 18.
17. **21 „bulk publishing“ look:** four articles share 2026-10-01. Nothing to change now; future articles spread out.

## Decided by Ajdin on 2026-11-04 (applied on the branch)

- **22** Betreuung = the HQ tiers 219 · 420 · 1.019 in the FAQ (VIP stays verbal).
- **6** Guarantee + ownership as two more cards in the homepage `Proof` („Sorgfältig gebaut. Verlässlich im Betrieb.“).
- **16** „Logistik eines Automobilkonzerns“ on Über mich (heading + Ripples beat), employer still unnamed.
- **7** FAQ „Was ist, wenn du mal nicht erreichbar bist?“: the system doesn't hang on him, holiday/illness covered in one answer, no more detail by decision.
- **19** Founder profile `linkedinProfileUrl` in the footer, `personLd.sameAs`, `founder.sameAs`.
- **30/31** „Praxis oder Kanzlei“ removed from the Prozess-Check (no AVV/TOM page for now).
- **37** No phone number. Decision, not an omission.

## Leistungen restructure (review #1, #2, #3) — option 1 built on 2026-11-04 (hub spec §11); KI-Betriebssystem under Bauen as the roof, a „KI“ door rejected

Original proposal, kept for the record:

Today: nine subpages under three groups (Automatisieren: Prozessautomatisierung · KI-Automatisierung · KI-Server · KI-Betriebssystem? / Befähigen: Claude · KI-Schulung · KI-Beratung · Prozess-Audit / Betreiben: Betreuung), all under one route `/leistungen/[slug]`, copy in `leistungenPages.ts`, nine inline SVG Grafiken, `CHECK_SRC` slug per page, Ratgeber `leistung:` ties, `LeistungenMenu` dropdown, sitemap + Service JSON-LD.

**Target: four doors, each one question the owner actually asks.**

| Door (new hub tile) | Absorbs | Keeps as sub-page? |
|---|---|---|
| **Prozess-Audit** (kostenlos: „Wo lohnt es sich bei mir?“) | KI-Beratung (both free, both a talk, both end in a roadmap) | `/leistungen/ki-beratung` → 308 to the audit page; its Erstgespräch CTA becomes the audit page's first step. |
| **Automatisierung** („Was baust du mir?“) | Prozessautomatisierung + KI-Automatisierung (+ KI-Betriebssystem as the roof) | Keep all three URLs (they rank and carry the Vergleich table and the Grafiken); the hub tile links them as three depths: ohne KI · mit KI · das ganze Haus. |
| **KI im Team** („Wie nutzen meine Leute KI?“) | Claude für Unternehmen + KI-Schulung | Keep both URLs. |
| **Betrieb** („Läuft das auch ohne dich?“) | Betreuung + KI-Server (infrastructure belongs to running, not building) | Keep both URLs. |

Three ways to get there, cheapest first:

1. **Regroup only (half a day, SEO-safe).** Change `group` on the nine entries to the four doors, rebuild `ServiceGroups` on the hub as four tiles with their sub-links, same for `LeistungenMenu`. Redirect `/leistungen/ki-beratung` → `/leistungen/prozess-audit` (308, like the parked routes) and fold its two unique sentences into the audit page. Nothing else moves. Fixes the „nine services“ impression and the category mismatch (#3) in one pass. Recommended first step.
2. **Four real pages (two to three days).** Merge the copy into four long subpages, 308 the other five slugs, re-tie Ratgeber `leistung:` and `CHECK_SRC`, retire five Grafiken. Cleaner, but loses five ranking URLs and the per-service depth the 2026-10-01 decision was made for.
3. **Keep nine, rename the hub headline** to say „vier Wege“ with the nine as bullets. Cosmetic; not recommended.

Touch list for option 1: `leistungenPages.ts` (`group` + `LeistungGroup` type), `ServiceGroups.tsx` + test, `LeistungenMenu.tsx` + `nav.test.ts`, `next.config.ts` redirect + `parkedRoutes.test.ts` row, `leistungenPages.test.ts` note/group pins, the hub spec note, sitemap drops `ki-beratung`.

## How to continue

- Branch `fix/review-2026-11-04` is built, tested, type-checked and linted; `npm start` was running on :3000 for a look. Merge to `main` = deploy (Ajdin's call, see memory „ask before pushing“).
- The „Ajdin“ list above is the agenda for the next website session; each item is one decision, most are one-line edits afterwards.
