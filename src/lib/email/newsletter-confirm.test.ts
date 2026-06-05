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
});
