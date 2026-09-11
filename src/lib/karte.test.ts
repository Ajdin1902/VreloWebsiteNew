import { describe, it, expect } from "vitest";
import { KARTE, buildVcard } from "./karte";

describe("buildVcard", () => {
  it("produces a vCard with the contact fields", () => {
    const v = buildVcard();
    expect(v).toContain("BEGIN:VCARD");
    expect(v).toContain("VERSION:3.0");
    expect(v).toContain("FN:Ajdin Dzafic");
    expect(v).toContain("N:Dzafic;Ajdin;;;");
    expect(v).toContain("ORG:Vrelo");
    expect(v).toContain("TITLE:Automatisierung für Betriebe");
    expect(v).toContain(`EMAIL;TYPE=INTERNET:${KARTE.email}`);
    expect(v).toContain(`TEL;TYPE=CELL:${KARTE.phone}`);
    expect(v).toContain("URL:https://vrelo-ki.de");
    expect(v.trimEnd().endsWith("END:VCARD")).toBe(true);
  });

  it("omits PHOTO with no arg and includes it when given", () => {
    expect(buildVcard()).not.toContain("PHOTO");
    expect(buildVcard("ZmFrZQ==")).toContain("PHOTO;ENCODING=b;TYPE=JPEG:ZmFrZQ==");
  });

  it("uses CRLF line endings (vCard spec)", () => {
    expect(buildVcard()).toContain("\r\n");
  });
});
