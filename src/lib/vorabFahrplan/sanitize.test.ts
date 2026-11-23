import { describe, expect, it } from "vitest";
import { sanitizeVisitorText } from "./sanitize";

const s = (x: string, max = 500) => sanitizeVisitorText(x, max);

describe("sanitizeVisitorText", () => {
  it("turns Gedankenstriche into comma or colon, ranges into bis", () => {
    expect(s("Outlook — das kennst du")).toBe("Outlook, das kennst du");
    expect(s("Outlook – das kennst du")).toBe("Outlook, das kennst du");
    expect(s("Ein Ziel—weniger Tippen")).toBe("Ein Ziel: weniger Tippen");
    expect(s("9–17 Uhr")).toBe("9 bis 17 Uhr");
    expect(s("Lexoffice - das Programm")).toBe("Lexoffice, das Programm");
    expect(s("x")).not.toMatch(/[–—]/);
  });
  it("converts ASCII quote pairs and drops a lone one", () => {
    expect(s('Die Regel "Anfrage" greift')).toBe("Die Regel „Anfrage“ greift");
    expect(s('„halb" korrekt')).toBe("„halb“ korrekt");
    expect(s("“englisch” zitiert")).toBe("„englisch“ zitiert");
    expect(s('Ein " allein')).toBe("Ein allein");
    expect(s("„schon richtig“ bleibt")).toBe("„schon richtig“ bleibt");
  });
  it("removes the comma before und", () => {
    expect(s("Mails, und Termine")).toBe("Mails und Termine");
  });
  it("removes prices and links", () => {
    const out = s("Der Tarif kostet ab 9,90 € im Monat, siehe https://lexoffice.de/preise oder lexoffice.de.");
    expect(out).not.toMatch(/€|\d|https?|lexoffice\.de/);
    expect(out).toBe("Der Tarif kostet im Monat, siehe oder.");
    expect(s("Für 12 EUR oder 1.299,00 Euro, auch € 5")).not.toMatch(/\d|€|EUR|Euro/);
    expect(s("www.x.de und müller.de")).toBe("und");
    expect(s("geht auch über foo.xyz")).toBe("geht auch über");
  });
  it("removes banned words, whole word only", () => {
    expect(s("Damit kannst du skalieren und sparen")).toBe("Damit kannst du und sparen");
    expect(s("Ein Game-Changer, ehrlich")).toBe("Ein, ehrlich");
    expect(s("Eine revolutionäre KI-Magie")).toBe("Eine");
    expect(s("Skalierung bleibt")).toBe("Skalierung bleibt");
  });
  it("keeps German words after a period without a space", () => {
    expect(s("ggf.später")).toBe("ggf.später");
  });
  it("collapses whitespace and cuts at a word boundary", () => {
    expect(s("  a   b \n c ")).toBe("a b c");
    expect(s("Eins zwei drei vier", 12)).toBe("Eins zwei");
    expect(s("Eins zwei, drei", 10)).toBe("Eins zwei");
    expect(s("Abcdefghijkl", 5)).toBe("Abcde");
    expect(s("Die Regel „Anfrage neu“", 18)).toBe("Die Regel");
  });
});
