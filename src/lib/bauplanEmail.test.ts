import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  BAUPLAN_PDF_PATH,
  ELEKTRO_BAUPLAN_PDF_PATH,
  bauplanAttachmentName,
  bauplanPdfPath,
  evaluateBauplanRequest,
} from "./bauplanEmail";
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

describe("BAUPLAN_PDF_PATH", () => {
  it("points at the rendered PDF under public/", () => {
    expect(existsSync(join(process.cwd(), "public", BAUPLAN_PDF_PATH))).toBe(true);
  });
});

describe("Elektro variant", () => {
  const d = evaluateBauplanRequest({ ...base, source: "el07" }, 10_000, PDF, "elektro");
  if (d.action !== "send") throw new Error(d.action);
  it("uses the Elektro subjects and copy", () => {
    expect(d.readerEmail.subject).toBe("Dein Bauplan für Elektrobetriebe");
    expect(d.readerEmail.text).toContain("der Bauplan hängt als PDF an dieser Mail.");
    expect(d.readerEmail.text).toContain(
      "Fang mit der Stufe an, die dich heute am meisten Zeit kostet. Zu jeder Stufe steht drin, wie du vorgehst.",
    );
    expect(d.readerEmail.text).toContain(PDF);
    expect(d.internalEmail.subject).toBe("Elektro-Bauplan angefordert: a@b.de");
    expect(d.internalEmail.text).toContain("Quelle: el07");
    expect(d.internalEmail.text).toContain("Bauplan: Elektrobetriebe");
  });
  it("keeps the reader mail clean", () => {
    expect(findCopyIssues(d.readerEmail.text)).toEqual([]);
    expect(d.readerEmail.text).not.toMatch(/Erstgespräch|Prozess-Check|buchen|€|Wochen/i);
  });
  it("leaves the Agentur mail as it was", () => {
    const a = evaluateBauplanRequest(base, 10_000, PDF);
    if (a.action !== "send") throw new Error(a.action);
    expect(a.readerEmail.subject).toBe("Dein Bauplan für Agenturen");
    expect(a.internalEmail.subject).toBe("Bauplan angefordert: a@b.de");
  });
  it("names the attachment and PDF per variant, and the Elektro file exists", () => {
    expect(bauplanAttachmentName("elektro")).toBe("Vrelo-Bauplan-Elektrobetriebe.pdf");
    expect(bauplanAttachmentName("agentur")).toBe("Vrelo-Bauplan-Agenturen.pdf");
    expect(bauplanPdfPath("agentur")).toBe(BAUPLAN_PDF_PATH);
    expect(bauplanPdfPath("elektro")).toBe(ELEKTRO_BAUPLAN_PDF_PATH);
    expect(existsSync(join(process.cwd(), "public", ELEKTRO_BAUPLAN_PDF_PATH))).toBe(true);
  });
});
