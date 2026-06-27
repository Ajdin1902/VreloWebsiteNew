// scripts/newsletter/email.mjs
// Wrap a rendered issue body in the branded Papier/petrol email shell.
import { renderBlocks, toPlainText } from "./markdown.mjs";

const UNSUB = "{{{RESEND_UNSUBSCRIBE_URL}}}";

export function buildIssueEmail(issue, { siteUrl }) {
  const bodyHtml = renderBlocks(issue.body, { siteUrl });
  const preheader = issue.previewText
    ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0">${issue.previewText}</span>`
    : "";

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b">
    ${preheader}
    <div style="max-width:560px;margin:0 auto">
      <p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:20px;color:#0a2538;margin:0 0 22px">Vrelo</p>
      ${bodyHtml}
      <hr style="border:none;border-top:1px solid #e3dccc;margin:28px 0 16px" />
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:0">Du bekommst diese Mail, weil du dich beim <em style="font-style:italic">Vrelo</em>-Newsletter angemeldet hast. <a href="${UNSUB}" style="color:#1b5063">Abmelden</a>.</p>
    </div>
  </body>
</html>`;

  const text = `${toPlainText(issue.body)}\n\nDu bekommst diese Mail, weil du dich beim Vrelo-Newsletter angemeldet hast.\nAbmelden: ${UNSUB}`;

  return { subject: issue.subject, html, text };
}
