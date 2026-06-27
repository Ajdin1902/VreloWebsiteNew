// scripts/newsletter/email.test.mjs
import { describe, it, expect } from "vitest";
import { buildIssueEmail } from "./email.mjs";

const issue = {
  slug: "2026-06-30-der-kunde",
  subject: "Der Kunde, der um 22 Uhr schrieb",
  previewText: "Eine Beobachtung, ein Tipp, ein Meme.",
  date: "2026-06-30",
  draft: false,
  body: `Intro mit Vrelo.

## Kurz aus der KI-Welt
Text.

![Meme](/images/newsletter/m.png)`,
};

describe("buildIssueEmail", () => {
  const mail = buildIssueEmail(issue, { siteUrl: "https://vrelo-ki.de" });

  it("uses the issue subject", () => {
    expect(mail.subject).toBe("Der Kunde, der um 22 Uhr schrieb");
  });
  it("renders sections as headings", () => {
    expect(mail.html).toMatch(/<h2[^>]*>Kurz aus der KI-Welt<\/h2>/);
  });
  it("includes the Resend unsubscribe token", () => {
    expect(mail.html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  });
  it("absolutizes the meme image", () => {
    expect(mail.html).toContain("https://vrelo-ki.de/images/newsletter/m.png");
  });
  it("includes a hidden preheader with previewText", () => {
    expect(mail.html).toContain("Eine Beobachtung, ein Tipp, ein Meme.");
  });
  it("produces a plain-text alternative without markdown", () => {
    expect(mail.text).toContain("Kurz aus der KI-Welt");
    expect(mail.text).not.toContain("##");
    expect(mail.text).toContain("Abmelden");
  });
  it("italicizes the brand word in the body", () => {
    expect(mail.html).toMatch(/<em[^>]*>Vrelo<\/em>/);
  });
  it("escapes special characters in the preheader", () => {
    const m = buildIssueEmail({ ...issue, previewText: "Tipps & Tricks" }, { siteUrl: "https://vrelo-ki.de" });
    expect(m.html).toContain("Tipps &amp; Tricks");
  });
  it("omits the preheader span when previewText is empty", () => {
    const m = buildIssueEmail({ ...issue, previewText: "" }, { siteUrl: "https://vrelo-ki.de" });
    expect(m.html).not.toContain("display:none");
  });
  it("shows the navy lockup logo in the header", () => {
    expect(mail.html).toContain("https://vrelo-ki.de/logo/vrelo-lockup-navy.png");
  });
  it("does not tint a section when there is no Tipp der Woche", () => {
    expect(mail.html).not.toContain("#f4e4c1"); // base issue has no Tipp section
  });
  it("wraps the Tipp der Woche section in a warm sonnenlicht callout", () => {
    const m = buildIssueEmail(
      { ...issue, body: "## Der Tipp der Woche\nMach das heute." },
      { siteUrl: "https://vrelo-ki.de" },
    );
    expect(m.html).toContain("background:#f4e4c1");
    expect(m.html).toMatch(/background:#f4e4c1[\s\S]*?<h2[^>]*>Der Tipp der Woche<\/h2>/);
  });
});
