// Public, price-free copy for the "Der Prozess-Audit" on-ramp block on
// /leistungen. The paid audit (€499, fully credited) and the handbook structure
// live in HQ: docs/superpowers/specs/2026-08-11-prozess-audit-design.md. This
// block sells the outcome and routes to the free Erstgespräch; the price is
// named only in that call. No mechanism (Claude/n8n) — that is how Vrelo builds.
export type ProzessAudit = {
  label: string;
  heading: string;
  body: string;
  deliverableLabel: string;
  deliverables: string[];
  keepNote: string;
  guarantee: string;
  cta: { label: string; href: string };
};

export const prozessAudit: ProzessAudit = {
  label: "Nicht sicher, wo du anfangen sollst?",
  heading: "Der Prozess-Audit – ich finde die eine Aufgabe, die dich am meisten kostet.",
  body: "Du merkst, dass Zeit und Anfragen durchrutschen – aber nicht, wo genau. Im Prozess-Audit schaue ich mir deine Abläufe an und du bekommst ein fertiges Handbuch: schwarz auf weiß, wo du am meisten verlierst und wie dein Tag ohne diese Aufgabe aussieht. Wenn du danach baust, ist der Audit für dich kostenlos.",
  deliverableLabel: "Das bekommst du",
  deliverables: [
    "Deine Abläufe, Schritt für Schritt kartiert",
    "Ein Diagramm, wie dein Prozess nach der Automatisierung läuft",
    "Der genaue Fahrplan: welche Automatisierung zuerst, in welchen Schritten",
    "Die Rechnung dahinter: was die Aufgabe heute kostet und was sie dir zurückgibt – ausgerechnet",
    "Ein klares Ziel und der Zeitrahmen, bis es steht",
  ],
  keepNote: "Dein Fahrplan gehört dir – ob du danach mit mir baust oder nicht.",
  guarantee: "Zeigt dir der Fahrplan keine konkrete, lohnende Automatisierung, bekommst du dein Geld zurück.",
  cta: { label: "Kostenloses Erstgespräch", href: "/kontakt" },
};
