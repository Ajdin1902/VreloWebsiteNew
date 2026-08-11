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
  guarantee: string;
  cta: { label: string; href: string };
};

export const prozessAudit: ProzessAudit = {
  label: "Nicht sicher, wo du anfangen sollst?",
  heading: "Der Prozess-Audit – ich finde die eine Aufgabe, die dich am meisten kostet.",
  body: "Du merkst, dass Zeit und Anfragen durchrutschen – aber nicht, wo genau. Im Prozess-Audit schaue ich mir deine Abläufe genau an und du bekommst ein fertiges Handbuch: ein Diagramm, wie dein Prozess danach läuft, den genauen Fahrplan für die Automatisierung und die Rechnung dahinter – was die Aufgabe dich heute kostet und was sie dir zurückgibt, ausgerechnet. Am Ende hast du schwarz auf weiß, was dir Automatisierung bringt. Wenn du danach baust, ist der Audit für dich kostenlos.",
  deliverableLabel: "Das bekommst du – schwarz auf weiß",
  deliverables: [
    "Deine Abläufe, Schritt für Schritt kartiert",
    "Ein Diagramm, wie dein Prozess nach der Automatisierung läuft",
    "Der genaue Fahrplan: welche Automatisierung zuerst, in welchen Schritten",
    "Die Rechnung dahinter: was die Aufgabe heute kostet und was sie dir zurückgibt – ausgerechnet",
    "Ein klares Ziel und der Zeitrahmen, bis es steht",
  ],
  guarantee: "Zeigt dir der Fahrplan keine konkrete, lohnende Automatisierung, bekommst du dein Geld zurück.",
  cta: { label: "Kostenloses Erstgespräch", href: "/kontakt" },
};
