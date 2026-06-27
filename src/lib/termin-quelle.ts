// Public, price-free copy for the "Die Termin-Quelle" flagship offer block on
// /leistungen. Source of truth for the offer itself (incl. price, guarantee,
// rationale): ../../Knowledge/Offers/Termin-Quelle.md (HQ). This page sells the
// outcome and routes to a conversation; price is revealed in the Angebot.
export type TerminQuelleAngebot = {
  label: string;
  name: string;
  promise: string;
  body: string;
  flow: string[];
  outcome: string;
  foundingNote: string;
  cta: { label: string; href: string };
  leadCheck: { prompt: string; label: string; href: string };
};

export const terminQuelle: TerminQuelleAngebot = {
  label: "Mein Angebot",
  name: "Die Termin-Quelle",
  promise: "Aus jeder Anfrage wird ein Termin – von selbst, während du arbeitest.",
  body: "Eine Anfrage kommt herein – und bleibt im Tagesgeschäft liegen, bis der Wettbewerber schneller war. Die Termin-Quelle schließt diese Lücke: Jede Anfrage bekommt in unter fünf Minuten eine persönliche Antwort und wird zum Termin – maßgeschneidert auf deinen Betrieb, sauber protokolliert. Nichts, das du lernen oder warten musst.",
  flow: ["Antwort < 5 Minuten", "Qualifizieren", "Termin buchen", "Nachfassen", "Protokoll"],
  outcome:
    "Du gewinnst mehr Termine aus den Anfragen, die du ohnehin schon hast – und einen ruhigen Kopf, weil keine Anfrage mehr verloren geht.",
  foundingNote: "Meine ersten drei Kunden bekommen eine zusätzliche Zusage – frag mich einfach danach.",
  cta: { label: "Lass uns deine Termin-Quelle bauen", href: "/kontakt" },
  leadCheck: {
    prompt: "Neugierig, was bei dir drin ist?",
    label: "Mach den 2-Minuten-Check",
    href: "/lead-check",
  },
};
