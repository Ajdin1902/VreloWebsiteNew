# Newsletter go-live runbook

**What it does:** flips the `/newsletter` page from the „Der Newsletter ist bald verfügbar.“ placeholder to the live double-opt-in form. No code change — the page is fully built and gated on env vars only ([src/lib/newsletter.ts](../src/lib/newsletter.ts) → `isNewsletterConfigured()` needs all four of `RESEND_API_KEY`, `CONTACT_FROM`, `NEWSLETTER_SECRET`, `NEWSLETTER_SEGMENT_ID`).

**Going live on the current domain first.** It works on `vrelo-website.vercel.app` today — `NEXT_PUBLIC_SITE_URL` can stay unset, because the confirm-link base falls back to the stable alias `https://vrelo-website.vercel.app` ([src/lib/site.ts](../src/lib/site.ts)). At the later `vrelo-ki.de` cutover you only set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de`, **keep the same `NEWSLETTER_SECRET`**, and subscribers + pending opt-in links carry over (see *Domain swap* below).

**Already in place** (from the Kontakt go-live): `RESEND_API_KEY`, `CONTACT_FROM` (`Vrelo <kontakt@vrelo-ki.de>`), and the Resend-verified sending domain `vrelo-ki.de`. The newsletter reuses all of these. The sending address is `@vrelo-ki.de` regardless of where the site is hosted, so no extra DNS is needed.

> **Resend model note.** Resend migrated **Audiences → Segments** (contacts are now independent and live in zero/one/many segments). Our code adds confirmed contacts to a **segment** via `contacts.create({ segments: [{ id }] })`. So the value you need is a **Segment ID**, not an audience id.

---

## Steps

### 1. Generate the signing secret
This signs the HMAC opt-in token. Run locally and copy the output:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

That ~43-char string is `NEWSLETTER_SECRET`. **Never commit it** — paste it straight into Vercel in step 3.

### 2. Get the Resend Segment ID
Resend → **Audiences** (the contacts/segments area). Your account already has a default segment („General“) — there is usually no "create audience" button anymore (creating extra segments is a paid feature; not needed). Open the segment and copy its **ID**, the UUID shown in the URL:

```
https://resend.com/audience?segmentId=<this-uuid>
```

That UUID is `NEWSLETTER_SEGMENT_ID`. The segment **is** the subscriber list — confirmed emails are added to it; there is no database on our side.

### 3. Set the two env vars in Vercel
Project `ajdin42-7733s-projects/vrelo-website` → Settings → Environment Variables, **Production** scope:

| Name | Value |
|---|---|
| `NEWSLETTER_SECRET` | the string from step 1 |
| `NEWSLETTER_SEGMENT_ID` | the segment UUID from step 2 |

> **Server-only — do NOT prefix either with `NEXT_PUBLIC_`.** That would ship the HMAC secret to the browser and let anyone forge a confirmed-subscription link.

Leave `NEXT_PUBLIC_SITE_URL` unset for now (confirm links use `vrelo-website.vercel.app`).

### 4. Redeploy
Trigger a redeploy (push to `main`, or redeploy the latest). Once both env vars are live, `/newsletter` renders the form automatically — no further action.

### 5. Test end-to-end
1. Open https://vrelo-website.vercel.app/newsletter, enter a real address, tick consent, submit.
2. Expect the inline „Fast geschafft – schau in dein Postfach und bestätige deine Anmeldung.“
3. Receive „Bitte bestätige deine Newsletter-Anmeldung“ (from `kontakt@vrelo-ki.de`) → click „Anmeldung bestätigen“.
4. Land on `/newsletter/bestaetigt` with the success confirmation.
5. Verify the contact now appears in the Resend segment.

---

## Domain swap (later, at the vrelo-ki.de cutover)
Set `NEXT_PUBLIC_SITE_URL=https://vrelo-ki.de` in Vercel and redeploy. That's the only change — confirm links are built from it at send-time, so all new opt-in mails point at the live domain. **Keep `NEWSLETTER_SECRET` identical** so outstanding unconfirmed links stay valid (they also expire after 24h, `TOKEN_TTL_MS`). Subscribers live in the Resend segment and are untouched by the domain change. If you 308-redirect the old `vercel.app` URL to the apex, even stragglers' old links still confirm (the `?token=` query is preserved).

## Operational notes
- **Keep `NEWSLETTER_SECRET` stable.** Rotating it invalidates every outstanding unconfirmed opt-in link.
- **Spam guards are built in:** a honeypot (`website` field) + a time-trap (`renderedAt`); no extra config.
- **Sending issues is not built.** Phase 4b only *collects + confirms* subscribers. To send an actual newsletter, compose a Resend **Broadcast** targeting the segment (Resend adds the managed unsubscribe link). Automating Broadcasts would be a future phase.

## Rollback
Unset (or clear) either env var and redeploy → `isNewsletterConfigured()` returns false → the page reverts to the „bald verfügbar“ placeholder. Subscribers already in the segment are unaffected.
