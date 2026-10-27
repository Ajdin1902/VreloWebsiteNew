import { describe, it, expect } from "vitest";
import { evaluateBauplanRequest } from "./bauplanEmail";
import { findCopyIssues } from "./ratgeberCopy";
const base = { email: "a@b.de", honeypot: "", renderedAt: 0 };
const PDF = "https://vrelo-ki.de/bauplan/x.pdf";

describe("evaluateBauplanRequest", () => {
  it("drops honeypot", () => { expect(evaluateBauplanRequest({ ...base, honeypot: "x" }, 10_000, PDF).action).toBe("drop"); });
  it("rejects too fast", () => { expect(evaluateBauplanRequest({ ...base, renderedAt: 9_000 }, 10_000, PDF).action).toBe("reject"); });
  it("invalidates a bad address", () => { expect(evaluateBauplanRequest({ ...base, email: "nope" }, 10_000, PDF).action).toBe("invalid"); });
  it("builds both mails with the PDF link and the source", () => {
    const d = evaluateBauplanRequest({ ...base, source: "ag01" }, 10_000, PDF);
    if (d.action !== "send") throw new Error(d.action);
    expect(d.readerEmail.to).toBe("a@b.de");
    expect(d.readerEmail.subject).toBe("Dein Bauplan für Agenturen");
    expect(d.readerEmail.text).toContain(PDF);
    expect(d.readerEmail.pdfUrl).toBe(PDF);
    expect(d.internalEmail.subject).toBe("Bauplan angefordert: a@b.de");
    expect(d.internalEmail.replyTo).toBe("a@b.de");
    expect(d.internalEmail.text).toContain("Quelle: ag01");
  });
  it("keeps the reader mail free of asks and dashes", () => {
    const d = evaluateBauplanRequest(base, 10_000, PDF);
    if (d.action !== "send") throw new Error(d.action);
    expect(findCopyIssues(d.readerEmail.text)).toEqual([]);
    expect(d.readerEmail.text).not.toMatch(/Erstgespräch|Prozess-Check|buchen/i);
  });
});
