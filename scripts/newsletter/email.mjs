// scripts/newsletter/email.mjs
// Wrap a rendered issue body in the branded Papier email shell: a gletscher
// header band with the navy lockup logo (+ amber rule), the body on Papier, and
// one section ("Der Tipp der Woche") highlighted in a warm sonnenlicht callout.
import { renderBlocks, toPlainText, escapeHtml } from "./markdown.mjs";

const UNSUB = "{{{RESEND_UNSUBSCRIBE_URL}}}";
// The one section rendered as a warm callout card. Matches the fixed 4-section
// format in Knowledge/marketing/newsletter.md.
const CALLOUT_HEADING = "Der Tipp der Woche";

// Split the body into the intro (before the first heading) + one chunk per
// "## " section, each chunk keeping its heading line. Lets us tint one section.
function splitSections(body) {
  const out = [];
  let cur = { heading: null, lines: [] };
  for (const line of body.split("\n")) {
    if (line.startsWith("## ")) {
      out.push(cur);
      cur = { heading: line.slice(3).trim(), lines: [line] };
    } else {
      cur.lines.push(line);
    }
  }
  out.push(cur);
  return out
    .map((s) => ({ heading: s.heading, text: s.lines.join("\n").trim() }))
    .filter((s) => s.text);
}

function renderBody(body, { siteUrl }) {
  return splitSections(body)
    .map((s) => {
      const html = renderBlocks(s.text, { siteUrl });
      if (s.heading === CALLOUT_HEADING) {
        // Drop the heading's top margin – the card padding owns the top spacing.
        const tight = html.replace("margin:26px 0 8px", "margin:0 0 8px");
        return `<div style="background:#f4e4c1;border-radius:10px;padding:18px 22px;margin:22px 0">${tight}</div>`;
      }
      return html;
    })
    .join("\n");
}

export function buildIssueEmail(issue, { siteUrl }) {
  const bodyHtml = renderBody(issue.body, { siteUrl });
  const preheader = issue.previewText
    ? `<span style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(issue.previewText)}</span>`
    : "";

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b">
    ${preheader}
    <div style="max-width:560px;margin:0 auto">
      <div style="background:#dce7eb;text-align:center;padding:24px;border-bottom:3px solid #d4a24c">
        <img src="${siteUrl}/logo/vrelo-lockup-navy.png" alt="Vrelo" width="150" style="display:inline-block;width:150px;max-width:60%;height:auto" />
      </div>
      <div style="padding-top:20px">
        ${bodyHtml}
      </div>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:28px 0 16px" />
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:0">Du bekommst diese Mail, weil du dich beim <em style="font-style:italic">Vrelo</em>-Newsletter angemeldet hast. <a href="${UNSUB}" style="color:#1b5063">Abmelden</a>.</p>
    </div>
  </body>
</html>`;

  const text = `${toPlainText(issue.body)}\n\nDu bekommst diese Mail, weil du dich beim Vrelo-Newsletter angemeldet hast.\nAbmelden: ${UNSUB}`;

  return { subject: issue.subject, html, text };
}
