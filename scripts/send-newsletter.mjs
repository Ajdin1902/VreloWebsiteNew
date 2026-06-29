// scripts/send-newsletter.mjs
// Author issues in content/newsletter/<slug>.md, then:
//   npm run newsletter -- --preview <slug>            # writes .preview/newsletter-<slug>.html
//   npm run newsletter -- --test you@example.de <slug> # one test email to you
//   npm run newsletter -- --send <slug>                # broadcast to the segment
//   npm run newsletter -- --send <slug> --at 2026-07-01T08:00:00Z  # schedule
// Secrets load from .env.local via the npm script (--env-file-if-exists).
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getIssueBySlug } from "./newsletter/issue.mjs";
import { buildIssueEmail } from "./newsletter/email.mjs";
import { parseSendArgs, assertSendable, hasActiveBroadcast } from "./newsletter/args.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** @returns {never} */
function fail(msg) {
  console.error(msg);
  process.exit(1);
}

let args;
try {
  args = parseSendArgs(process.argv.slice(2));
} catch (e) {
  fail(String(e.message));
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://vrelo-ki.de";

let issue, mail;
try {
  issue = getIssueBySlug(args.slug, { dir: resolve(root, "content/newsletter") });
  mail = buildIssueEmail(issue, { siteUrl });
} catch (e) {
  fail(String(e.message));
}

// Resend substitutes the {{{RESEND_UNSUBSCRIBE_URL}}} merge tag per-recipient
// only on a real broadcast (--send). Preview/test go through plain send (no
// broadcast engine), so the raw tag would show through — swap it for a real
// link so the footer renders cleanly while checking. The broadcast path keeps
// the literal tag untouched (Resend needs it for one-click unsubscribe).
function fillTestUnsub(m) {
  const url = `${siteUrl}/newsletter`;
  return {
    ...m,
    html: m.html.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", url),
    text: m.text.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", url),
  };
}

if (args.mode === "preview") {
  const preview = fillTestUnsub(mail);
  const out = resolve(root, ".preview", `newsletter-${issue.slug}.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, preview.html, "utf8");
  console.log(`Preview written: ${out}\nSubject: ${preview.subject}`);
  process.exit(0);
}

const apiKey = process.env.RESEND_API_KEY;
// The newsletter sends from its own address (NEWSLETTER_FROM); replies + bounces
// land there (replyTo = from below). Falls back to CONTACT_FROM if unset.
const from = process.env.NEWSLETTER_FROM || process.env.CONTACT_FROM;
if (!apiKey || !from) fail("Missing RESEND_API_KEY or NEWSLETTER_FROM/CONTACT_FROM. Set them in .env.local.");

const { Resend } = await import("resend");
const resend = new Resend(apiKey);

if (args.mode === "test") {
  const test = fillTestUnsub(mail);
  const { data, error } = await resend.emails.send({
    from,
    to: args.testEmail,
    subject: test.subject,
    html: test.html,
    text: test.text,
  });
  if (error) fail(`Test send failed: ${JSON.stringify(error)}`);
  console.log(`Test sent to ${args.testEmail} (id ${data?.id}).`);
  process.exit(0);
}

// args.mode === "send"
assertSendable(issue);
const segmentId = process.env.NEWSLETTER_SEGMENT_ID;
if (!segmentId) fail("Missing NEWSLETTER_SEGMENT_ID. Set it in .env.local.");

const { data: existing, error: listErr } = await resend.broadcasts.list();
if (listErr) fail(`Could not check existing broadcasts: ${JSON.stringify(listErr)}`);
if (hasActiveBroadcast(existing?.data ?? [], issue.slug)) {
  fail(`A broadcast named "${issue.slug}" is already sent or scheduled. Refusing to send it again. Rename the issue, or delete that broadcast in Resend, to override.`);
}

const { data: created, error: createErr } = await resend.broadcasts.create({
  segmentId,
  from,
  replyTo: from,
  subject: mail.subject,
  name: issue.slug,
  previewText: issue.previewText || undefined,
  html: mail.html,
  text: mail.text,
});
if (createErr || !created) fail(`Broadcast create failed: ${JSON.stringify(createErr)}`);

const { error: sendErr } = await resend.broadcasts.send(
  created.id,
  args.scheduledAt ? { scheduledAt: args.scheduledAt } : undefined,
);
if (sendErr) fail(`Broadcast send failed (draft ${created.id} created): ${JSON.stringify(sendErr)}`);

console.log(`Broadcast ${created.id} ${args.scheduledAt ? `scheduled for ${args.scheduledAt}` : "sent"}.`);
