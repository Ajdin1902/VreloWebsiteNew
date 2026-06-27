---
name: sending-newsletter
description: Use when writing, previewing, testing, or sending a Vrelo email newsletter issue – a new content/newsletter/*.md issue, the `npm run newsletter` preview/test/send workflow, or broadcasting „Die Quelle“ via Resend.
---

# Sending a Newsletter Issue

## Overview
Author one weekly Vrelo newsletter issue as a Markdown file, then ship it: preview, test-send to yourself, flip it off draft, broadcast to the Resend segment. The editorial rules (goal, voice, the four sections, cadence) live in the playbook; this skill is the operational runbook for the send pipeline under `scripts/newsletter/`.

Client copy is German; the brand voice is calm over hype. Nothing broadcasts by accident: every issue is `draft: true` until you deliberately flip it.

## Read first
- **Editorial playbook (voice + the four sections + examples):** `Knowledge/marketing/newsletter.md`. Required before writing copy.
- **Build notes + gotchas:** `Website/CLAUDE.md` -> „Newsletter (send)“.
- **An existing issue to mirror:** `content/newsletter/2026-06-30-der-kunde-um-22-uhr.md`.

## One-time prerequisites (before the first real send)
- **Resend:** create the Audience + a Segment; note the segment id.
- **Env** (in `.env.local` and Vercel): `RESEND_API_KEY`, `CONTACT_FROM` (e.g. `Vrelo <kontakt@vrelo-ki.de>`), `NEWSLETTER_SEGMENT_ID`, `NEWSLETTER_SECRET`. Set `NEXT_PUBLIC_SITE_URL` to the live site.
- **Node >= 22.9** (the `npm run newsletter` script uses `--env-file-if-exists`).
- **Site must be deployed** at the public URL: the email's logo and meme are absolute URLs (`<siteUrl>/logo/...`, `<siteUrl>/images/newsletter/...`). If the site is not live, those images are broken in real inboxes.

## Author the issue
1. Create `content/newsletter/<YYYY-MM-DD>-<slug>.md` with frontmatter:
   ```yaml
   ---
   subject: "calm + concrete; name something the body actually delivers"
   previewText: "one line shown as the inbox preview"
   date: "YYYY-MM-DD"
   draft: true
   ---
   ```
2. Body = the four fixed sections from the playbook, each a `## ` heading then its text:
   `## Kurz aus der KI-Welt`, `## Der Tipp der Woche`, `## So nutzen wir es`, `## Meme der Woche`. Open with a 1-2 sentence intro; close with the reply-driven CTA and a „Bis zum nächsten Mal“ sign-off.
   - `## Der Tipp der Woche` auto-renders as the warm sonnenlicht callout card; no extra markup.
   - The meme is an image line: `![<alt>](/images/newsletter/<file>.png)`. Put the PNG in `public/images/newsletter/`.
3. **German typography (verify the bytes).** German quotes are „…“ (U+201E open / U+201C close); the Gedankenstrich is the spaced en-dash „ – “ (U+2013), never an em-dash. The Write/Edit tools silently downgrade the closing quote and the en-dash, so author the `.md` via a small `node`/`fs` script (or verify right after) instead of trusting Edit. Check:
   ```bash
   node -e 'const s=require("fs").readFileSync("content/newsletter/<slug>.md","utf8");console.log({open:(s.match(/„/g)||[]).length,close:(s.match(/“/g)||[]).length,emdash:(s.match(/—/g)||[]).length})'
   ```
   `open` must equal `close`; `emdash` must be `0`.

## Ship it
Run from `Website/`:
1. **Preview** (no secrets needed): `npm run newsletter -- --preview <slug>` -> open `.preview/newsletter-<slug>.html` in a browser. Check layout, the callout, the typography. (Images load only if `NEXT_PUBLIC_SITE_URL` points somewhere that serves them.)
2. **Test-send to yourself:** `npm run newsletter -- --test you@example.de <slug>` -> open it in a real inbox (ideally Gmail + Apple Mail + Outlook). Confirm the logo and meme render and the layout holds.
3. **Flip the gate:** change frontmatter `draft: true` -> `draft: false`.
4. **Broadcast:** `npm run newsletter -- --send <slug>` (add `--at 2026-07-01T08:00:00Z` to schedule; ISO 8601 or Resend relative time like „in 2 days“).

## Gotchas
- **`--send` is single-shot per slug.** It refuses a `draft: true` issue, and refuses a slug already sent/scheduled (it checks `broadcasts.list()`), so you cannot double-email. To re-send on purpose, rename the issue or delete the old broadcast in Resend.
- **Replies go to `CONTACT_FROM`.** The CTA invites replies, so that inbox must be monitored.
- **Images are absolute URLs.** The logo (`/logo/vrelo-lockup-navy.png`) and the meme must be live on the deployed site, or they break in inboxes. A test-send is the real check.
- **Unsubscribe** is the literal `{{{RESEND_UNSUBSCRIBE_URL}}}` token: Resend fills it on broadcast; it stays literal in preview/test (expected).
- Logic is plain `.mjs` under `scripts/newsletter/` (bare `node` cannot import TS or the `@/` alias). Tests: `npx vitest run scripts/newsletter/`.

## Reference
- Orchestrator: `scripts/send-newsletter.mjs`; modules: `scripts/newsletter/{issue,markdown,email,args}.mjs`.
- Command: `package.json` -> `"newsletter"`.
