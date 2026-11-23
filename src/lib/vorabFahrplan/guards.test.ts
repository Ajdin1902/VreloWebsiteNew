import { describe, expect, it } from "vitest";
import { PROGRAMM_CHIPS } from "@/lib/prozessCheck";
import {
  capText,
  normalizePhone,
  normalizeWebsite,
  parseProgramme,
  safeFilenamePart,
  stripContacts,
} from "./guards";

describe("guards", () => {
  it("stripContacts removes phone, mail, www", () => {
    const out = stripContacts("Ruf an 0941 123456 oder info@x.de, www.x.de");
    expect(out).toBe("Ruf an oder ,");
    expect(out).not.toMatch(/\d{3,}|@|www/);
    expect(stripContacts("siehe mueller.de/kontakt jetzt")).toBe("siehe jetzt");
    expect(stripContacts("https://a.de/x ok")).toBe("ok");
  });
  it("parseProgramme caps, dedups, cuts", () => {
    expect(parseProgramme([], "a".repeat(200))).toEqual(["a".repeat(40)]);
    expect(parseProgramme(PROGRAMM_CHIPS.slice(0, 6), "x, y, z, q")).toHaveLength(8);
    expect(parseProgramme([], "Lexoffice, lexoffice")).toEqual(["Lexoffice"]);
    expect(parseProgramme(["nicht-in-liste"], "")).toEqual([]);
  });
  it("stripContacts removes phones with mixed separators", () => {
    for (const x of ["Tel. (0941) 123456", "+49 (941) 12-34 56", "0941 / 123456"]) {
      expect(stripContacts(x)).not.toMatch(/\d/);
    }
  });
  it("parseProgramme strips URLs and phones before splitting on /", () => {
    const r = parseProgramme([], "https://x.de/a, mueller.de/kontakt, 0941/123456, Tel 0941 12 34 56");
    for (const n of r) expect(n).not.toMatch(/\d{4,}|\.de|https/);
  });
  it("normalizePhone", () => {
    expect(normalizePhone("+49 (941) 12-34 56")).toBe("+49941123456");
    expect(normalizePhone("123")).toBeNull();
    expect(normalizePhone("1".repeat(21))).toBeNull();
  });
  it("normalizeWebsite", () => {
    expect(normalizeWebsite("mueller-bau.de")).toBe("https://mueller-bau.de/");
    expect(normalizeWebsite("http://127.0.0.1")).toBeNull();
    expect(normalizeWebsite("localhost")).toBeNull();
    expect(normalizeWebsite("http://[::1]/")).toBeNull();
  });
  it("capText / safeFilenamePart", () => {
    expect(capText("abcdef", 3)).toBe("abc");
    expect(safeFilenamePart("Müller & Söhne / GmbH")).toBe("Mueller-Soehne-GmbH");
    expect(safeFilenamePart("???")).toBe("Betrieb");
  });
});
