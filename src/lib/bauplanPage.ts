// src/lib/bauplanPage.ts
// Copy for the unlisted /bauplan/[code] page. Source: spec §4 (2026-10-27-agentur-bauplan-design.md).
// Plain words „Vrelo“ / „Merak“ here; the renderer sets the italics.
export type Station = { name: string; beispiele: string; heute: string; imBauplan: string; bleibtBeiDir: string };

export const bauplanPage: {
  kicker: string;
  title: string;
  schmerz: { heading: string; punkte: string[]; schluss: string };
  schritte: { heading: string; items: { wort: string; satz: string }[] };
  herkunft: string;
  fundament: { heading: string; body: string };
  stationen: { heading: string; items: Station[]; tools: string };
  merak: { heading: string; punkte: string[] };
  pdfInhalt: { heading: string; punkte: string[]; ergebnis: string };
  pdf: { heading: string; label: string; button: string; pending: string; hinweis: string; success: string };
} = {
  kicker: "Bauplan für Agenturen",
  title: "Deine Agentur lebt von deinen Kunden. Das Drumherum frisst die Zeit dafür.",
  schmerz: {
    heading: "Hier geht deine Zeit hin",
    punkte: [
      "Angebot raus, keiner fasst nach.",
      "Onboarding-Antworten von Hand ins Board.",
      "Jedes Skript fängt bei null an.",
      "Das Board stimmt nur, wenn jemand dran denkt.",
      "Status ständig von Hand dokumentieren.",
      "Neuer Kunde: Nein sagen oder einstellen.",
    ],
    schluss: "Nichts davon bezahlt dein Kunde.",
  },
  schritte: {
    heading: "Der Weg raus",
    items: [
      { wort: "Beschreiben.", satz: "Jede Station: Input, Output, wer." },
      { wort: "Automatisieren.", satz: "Das Drumherum läuft von allein." },
      { wort: "Laufen lassen.", satz: "Dokumentiert. Nichts geht verloren." },
    ],
  },
  herkunft: "Entstanden bei einer Videoagentur in Regensburg, konzipiert für jede Agentur.",
  fundament: {
    heading: "Das Fundament bleibt bei dir: dein Kunde",
    body: "Erstgespräch, Briefing, kreative Arbeit, Feedback. Alles andere ist Drumherum.",
  },
  stationen: {
    heading: "Der Weg eines Kunden",
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
      "Zufriedene Kunden. Jeder Schritt kommt pünktlich.",
      "Dein Team dreht, gestaltet, schreibt.",
      "Mehr Kunden, ohne dass es eng wird.",
      "Du siehst, wo jedes Projekt steht.",
      "Nichts geht verloren. Alles dokumentiert.",
      "Alles läuft ruhig.",
    ],
  },
  pdfInhalt: {
    heading: "Das steckt drin",
    punkte: [
      "Vier Prinzipien, drei Beispiele: Videodreh, Website, Kampagne.",
      "Bögen zum Ausfüllen: Input, Output, wer, was.",
      "Deine Programme und wie sie zusammenhängen.",
      "Der Prüfschritt vor jedem Entwurf.",
      "Der ganze Weg auf einer Seite.",
      "8 Seiten zum Ausdrucken.",
    ],
    ergebnis: "Am Ende: eine dokumentierte Quelle deiner Abläufe. Eine ruhige Stunde und ein Stift reichen.",
  },
  pdf: {
    heading: "Hol dir den Bauplan als PDF. Kostenlos.",
    label: "Deine E-Mail-Adresse",
    button: "Bauplan zuschicken",
    pending: "Wird gesendet …",
    hinweis: "Du bekommst nur diese eine Mail.",
    success: "Ist unterwegs. Schau auch im Spam-Ordner nach.",
  },
};
