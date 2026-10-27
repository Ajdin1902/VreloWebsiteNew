// src/lib/bauplanPage.ts
// Copy for the unlisted /bauplan/[code] page. Source: spec §4 (2026-10-27-agentur-bauplan-design.md).
// Plain words „Vrelo“ / „Merak“ here; the renderer sets the italics.
export type Station = { name: string; beispiele: string; heute: string; imBauplan: string; bleibtBeiDir: string };

export const bauplanPage: {
  kicker: string;
  title: string;
  lead: string;
  herkunft: string;
  fundament: { heading: string; body: string };
  stationen: { heading: string; items: Station[]; tools: string };
  merak: { heading: string; punkte: string[] };
  pdf: { heading: string; text: string; label: string; button: string; pending: string; hinweis: string; success: string };
} = {
  kicker: "Bauplan für Agenturen",
  title: "Deine Agentur lebt von der Beziehung zu deinen Kunden. Dieser Bauplan nimmt dir das Drumherum ab.",
  lead: "Ob Shooting, Website oder Kampagne: Hier steht, welche Handgriffe zwischen Zusage und Abschluss von allein laufen können und welche bei dir bleiben.",
  herkunft:
    "Entstanden ist dieser Bauplan bei meiner Arbeit mit einer Videoagentur in Regensburg. Ich habe ihn so konzipiert, dass er für jede Agentur passt.",
  fundament: {
    heading: "Das Fundament: dein Kunde",
    body: "Verstehen, was der Kunde will. Erstgespräch, Briefing, die kreative Arbeit, das Feedback-Gespräch. Das bleibt bei dir und deinem Team. Alles darunter dient diesem einen Ziel.",
  },
  stationen: {
    heading: "Der Weg eines Kunden, Station für Station",
    items: [
      {
        name: "Angebot",
        beispiele: "Shooting-Paket · Website-Relaunch · Kampagne",
        heute: "von Hand geschrieben, Nachfassen nach Gefühl",
        imBauplan: "aus den Deal-Daten gebaut, du gibst mit einem Klick frei, Erinnerung nach 5 und 12 Tagen",
        bleibtBeiDir: "der Preis, das Gespräch, die Freigabe",
      },
      {
        name: "Onboarding",
        beispiele: "Drehort und Zielgruppe · Seitenstruktur und Logos · Zielgruppe und Budget",
        heute: "Willkommensmail von Hand, Antworten abgetippt",
        imBauplan: "Fragebogen geht nach dem Ja raus, Antworten landen im Kundenordner und auf der Projektkarte",
        bleibtBeiDir: "das Onboarding-Gespräch",
      },
      {
        name: "Skripte",
        beispiele: "Reel-Skript · Imagefilm · Erklärvideo",
        heute: "leere Seite",
        imBauplan: "Entwurf aus den Onboarding-Antworten, im Stil deiner Agentur",
        bleibtBeiDir: "die Idee, der Feinschliff, die Entscheidung",
      },
      {
        name: "Texte",
        beispiele: "Captions · Ad-Copy · Website-Texte",
        heute: "jedes Mal neu",
        imBauplan: "Entwürfe im Stil deiner Agentur",
        bleibtBeiDir: "dein Team entscheidet, was rausgeht",
      },
      {
        name: "Projektdoku",
        beispiele: "Dreh → Schnitt → Feedback · Design → Entwicklung → Launch · Setup → Laufzeit → Report",
        heute: "Board von Hand nachziehen, Fristen im Kopf",
        imBauplan: "jede Phase legt ihre Aufgaben mit Frist an, die Karte rückt weiter, wenn alles erledigt ist",
        bleibtBeiDir: "das Feedback-Gespräch, die Abnahme",
      },
    ],
    tools: "Läuft in den Programmen, die du schon hast.",
  },
  merak: {
    heading: "So fühlt es sich an: der Merak-Effekt",
    punkte: [
      "Deine Kunden sind zufrieden. Das Angebot kommt schnell, jeder Schritt kommt pünktlich.",
      "Dein Team macht die Arbeit, die Spaß macht: drehen, gestalten, schreiben.",
      "Du nimmst mehr Kunden an, ohne dass es im Büro eng wird.",
      "Du siehst jederzeit, wo jedes Projekt steht.",
      "Nichts geht verloren. Jeder Schritt ist dokumentiert.",
      "Alles läuft ruhig.",
    ],
  },
  pdf: {
    heading: "Den Bauplan als PDF",
    text: "Mit den Prinzipien für die Umsetzung in deiner Agentur und Platz für deine eigenen Phasen. Ich schicke ihn dir per Mail.",
    label: "Deine E-Mail-Adresse",
    button: "PDF zuschicken",
    pending: "Wird gesendet …",
    hinweis: "Du bekommst nur diese eine Mail.",
    success: "Ist unterwegs. Schau auch im Spam-Ordner nach.",
  },
};
