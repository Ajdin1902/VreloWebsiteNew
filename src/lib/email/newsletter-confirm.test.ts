// src/lib/email/newsletter-confirm.test.ts
import { describe, it, expect } from "vitest";
import { buildConfirmEmail } from "./newsletter-confirm";

describe("buildConfirmEmail", () => {
  const url = "https://vrelo-website.vercel.app/newsletter/bestaetigt?token=abc.def";

  it("has a German subject and includes the confirm URL in both html and text", () => {
    const e = buildConfirmEmail({ confirmUrl: url });
    expect(e.subject).toMatch(/bestätige/i);
    expect(e.text).toContain(url);
    expect(e.html).toContain(`href="${url}"`);
    expect(e.text).toMatch(/ignorier/i); // "ignore if you didn't sign up"
  });

  it("includes a greeting, a sign-off, and the brand one-liner", () => {
    const e = buildConfirmEmail({ confirmUrl: url });
    const oneLiner = "Aus einem Tropfen fließt ein Fluss, aus einer Idee deine Zeit zurück.";
    expect(e.text).toMatch(/^Hallo,/);
    expect(e.text).toMatch(/Bis bald/);
    expect(e.text).toMatch(/Ajdin von Vrelo/);
    expect(e.text).toContain(oneLiner);
    expect(e.html).toMatch(/Bis bald/);
    expect(e.html).toContain(oneLiner);
  });
});
