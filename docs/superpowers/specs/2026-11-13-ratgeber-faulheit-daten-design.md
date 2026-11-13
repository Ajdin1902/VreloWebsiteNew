# Ratgeber: „Zahle ich meine Faulheit mit meinen Daten?“ (short design)

Date: 2026-11-13 · Size: small (one MDX article + cover prompt) · Skill: `ratgeber-article`

## Intent
A Meinung piece built from Ajdin's script on personal data and AI. The question: is the time AI saves me worth handing over my data? Ends on a position, not an open question:
**„Meine eigenen Daten kann ich verschenken. Die meiner Kunden gehören mir nicht.“**
It sits in front of `wo-laeuft-deine-ki` (the fix: EU region, AVV, three questions) and links to it instead of retelling it.

## Goals / non-goals / anti-goals
- Goal: the reader (Inhaber) leaves knowing the line between his own data and his customers' data, with sources he can check.
- Non-goal: a how-to for the EU route (that is `wo-laeuft-deine-ki`); a full GDPR guide.
- Anti-goals: fear-mongering, conspiracy tone taken seriously, any unverified claim, a joke at the wife's expense, a CTA ending.

## Decided (Ajdin, 2026-11-13)
- Title: „Zahle ich meine Faulheit mit meinen Daten?“ · slug `faulheit-mit-daten-zahlen` · kategorie Meinung · standard length (~900 to 1100 words), shorter if it holds.
- Running image: **„meine Frau“**. Setup in the hook („Claude weiß mehr über mich als meine Frau“, then the Kosinski study as proof), one bridge, last-line callback. The wife is the yardstick, never the punchline: jokes hit the AI and Ajdin.
- Receipts example is a **temptation, not a done deed** („Ich stand kurz davor, …“ / „Ich wäre versucht…“). It is the Steuererklärung, not the Steuerbescheid.
- Honest admission: Ajdin's own training setting is **off**; „ob das jemand kontrolliert, weiß ich nicht“.
- Position at the end as above, as the one `>` pull-quote (the turn).

## Approaches considered
- A · Schuhkarton (receipts as running image): carried the position best; not chosen.
- **B · Meine Frau: chosen** by Ajdin. Funnier, more personal; constraint: the wife stays the yardstick.
- C · Döner/conspiracy: dropped, does not lead to the customer-data point.

## Facts the body may use (verified 2026-11-13, link inline)
| Point | Source |
|---|---|
| 300 Facebook likes beat the spouse at judging personality; 10 beat a colleague (2015, likes, Big Five) | Youyou/Kosinski/Stillwell, PNAS 2015, https://pmc.ncbi.nlm.nih.gov/articles/PMC4313801 |
| CLOUD Act 2018: US providers must hand over data regardless of storage location | 18 U.S.C. § 2713 |
| Microsoft France legal director under oath, French Senate, 10.06.2025: „Nein, das kann ich nicht garantieren.“ | https://theregister.com/2025/07/25/microsoft_admits_it_cannot_guarantee |
| Anthropic consumer terms, effective 28.09.2025: training on by default unless opted out; 5 years retention instead of 30 days | https://anthropic.com/news/updates-to-our-consumer-terms |
| ~4,500 shared ChatGPT chats indexed by Google, feature pulled Aug 2025 | https://www.engadget.com/ai/openai-is-removing-chatgpt-conversations-from-google-194735704.html |
| Claude Personal Finance (beta 05.11.2026, US only): read-only, cannot move money | https://the-decoder.com/anthropic-adds-bank-account-access-to-claude-so-users-can-track-their-spending/ |
| Replit agent deleted a production DB during a code freeze, July 2025, said it „panicked“ | https://dc.fortune.com/2025/07/23/ai-coding-tool-replit-wiped-database-called-it-a-catastrophic-failure |
| Google pays Reddit ~$60M/year for training data (2024, reported, not officially confirmed) | https://the-decoder.com/reddit-signs-60-million-annual-training-data-deal-with-google/ |
| Privacy paradox: privacy-minded students gave away friends' e-mails for free pizza | Athey/Catalini/Tucker, NBER 2017, https://www.nber.org/papers/w23488.pdf |
| Samsung staff pasted source code + meeting recordings into ChatGPT, 2023 | https://www.theregister.com/2023/05/02/samsung_generative_ai_ban/ |
| Bedrock: prompts not used for training, not shared with model providers | https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html |
| 60 % of companies that skipped AI name Datenschutz (Destatis 2025) | `Knowledge/marketing/ki-studien.md` |

Script claims corrected: „Audits in den USA gibt es nicht“ → audits check the provider's security, not what an authority may demand. „Machen was sie wollen“ → they do what their terms allow, and terms change. „Firmen kaufen andere nur wegen der Daten“ → Reddit deal. Bank-account anecdote → the good version is a hard read-only limit, the bad one a polite „bitte nicht“ (Replit).
Not used: NYT/OpenAI preservation order (current status unverified), PCLOB (sources conflict), NSA (cut for length).

## Constraints (hard rules)
- Name no competitor: **no Langdock**. **No Azure / Microsoft Foundry** as a recommendation (Microsoft only appears as the Senate example). Bedrock may be named.
- AI data location: always „innerhalb der EU“, never „Frankfurt“/„Deutschland“. Say honestly that the CLOUD Act also reaches AWS: the EU route lowers the risk, it does not remove it.
- No Vrelo price. API cost only qualitatively (pay per use, can cost more than a subscription), link `welches-ki-modell` (the article that covers pay-per-use cost; `wieso-ist-ki-jetzt-revolutionaer` has none).
- Voice/typography: `references/voice-and-structure.md` self-check (no Gedankenstrich, „…“ quotes, no comma before „und“, ≤ 1 water metaphor, generic masculine, one pull-quote, no CTA close). Then `copy-editing` and `stop-slop`.
- `draft: true`. The cover WebP must exist before commit (covers test).

## Left to the builder
Section headings, the exact Klammer-Pointen, which single failure example sits next to the training admission, the cover motif (Meinung allows an absurd staged scene, but **no people in generated imagery** per Website CLAUDE.md: objects/robots only, e.g. a robot reading a diary; KI-Bild label in the image if photoreal), the last line's wording.
