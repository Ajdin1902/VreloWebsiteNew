// Public copy for the two offer sections added to /leistungen on 2026-09-02:
// "Wenn du mit mir baust" (the delivery stack, rendered as scroll-driven cards)
// and "Woran es bei den meisten scheitert" (obstacle -> named solution -> link).
// Sourced from the founder's problem/solution worksheet; offer truth lives in
// Knowledge/marketing/prozess-check-funnel.md. Components hold no German.
//
// Copy rules (guarded in leistungen-weg.test.ts): German quotes, no
// Gedankenstrich, never a Vrelo price. The single currency figure allowed is
// the client's OWN server cost, "rund 30 Euro" (HQ rule: the public number is
// always "rund 30", matching /makler and the FAQ).

import { CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";
import { faqHref } from "@/lib/faq";

export type BauPhase = {
  id: string;
  title: string;
  text: string;
};

export type WennDuBaust = {
  heading: string;
  phases: BauPhase[];
};

// Chronological: the 2-week first result (guarantee, 2026-11-11) follows the
// build, the Feinschliff closes the sequence 14 days after the Übergabe.
export const wennDuBaust: WennDuBaust = {
  heading: "Wenn du mit mir baust",
  phases: [
    {
      id: "server",
      title: "Server einrichten",
      text: "Ich richte dir deinen eigenen Server ein, auf deinen Namen. Dir gehört alles: die Maschine, die Zugänge, die Daten. Das bleibt so, auch wenn du mich irgendwann nicht mehr brauchst.",
    },
    {
      id: "sicherheit",
      title: "Datensicherheit nach deiner Lage",
      text: "Deine Konten, deine Zugänge. Gehostet in der EU, wo es auf deine Daten ankommt. Ich nutze nur die nötigen Zugriffe und dokumentiere, was wohin fließt.",
    },
    {
      id: "bauen",
      title: "Bauen und verbinden",
      text: "Ich programmiere deinen Prozess und verbinde deine Systeme damit: Mail, Kalender, Buchhaltung, was bei dir eben läuft.",
    },
    {
      id: "ergebnis",
      title: "Erstes Ergebnis in 2 Wochen",
      text: "Zwei Wochen nach dem Onboarding läuft der erste Punkt aus deiner Anforderungsliste. Weil jedem Bau der kostenlose Prozess-Audit vorausgeht, kann ich dir das zusagen: Läuft er nicht, bekommst du alles zurück, was du bis dahin gezahlt hast.",
    },
    {
      id: "test",
      title: "Test auf deinen echten Daten",
      text: "Das System läuft zuerst an deinen echten Fällen, nicht an Beispieldaten. Du nimmst erst ab, wenn es sauber durchläuft.",
    },
    {
      id: "uebergabe",
      title: "Übergabe mit Doku",
      text: "Du bekommst eine vollständige Dokumentation, auch für deine Mitarbeiter, dazu die Punkte, auf die du künftig achten solltest. In klarer Sprache, ohne Fachchinesisch.",
    },
    {
      id: "feinschliff",
      title: "Der Feinschliff",
      text: "14 Tage nach der Übergabe beobachte ich dein System und justiere nach, ohne dass du dich darum kümmerst.",
    },
  ],
};

export type Einwand = {
  einwand: string;
  loesungName: string;
  satz: string;
  link: { href: string; label: string };
};

export type WoranEsScheitert = {
  heading: string;
  rows: Einwand[];
};

export const woranEsScheitert: WoranEsScheitert = {
  heading: "Woran es bei den meisten scheitert",
  rows: [
    {
      einwand: "„Ich weiß nicht, wo ich anfangen soll.“",
      loesungName: "Der Prozess-Check",
      satz: "Drei Minuten, ein paar Fragen. Du siehst, wo deine Stunden hingehen und womit du anfängst.",
      link: { href: checkHref(CHECK_SRC.leistungenEinwand), label: "Zum Prozess-Check" },
    },
    {
      einwand: "„Ich weiß nicht, was sich bei mir lohnt.“",
      loesungName: "Der Fahrplan",
      satz: "Der kostenlose Prozess-Audit endet mit einem Fahrplan: was sich automatisieren lässt, in welcher Reihenfolge. Er gehört dir.",
      link: { href: "/leistungen/prozess-audit", label: "Zum kostenlosen Audit" },
    },
    {
      einwand: "„Dafür fehlt mir das IT-Wissen.“",
      loesungName: "Alles aus einer Hand",
      satz: "Du brauchst keins. Ich baue, verbinde und dokumentiere; du konzentrierst dich auf deinen Betrieb.",
      link: { href: faqHref("Wie läuft ein Projekt mit dir ab?"), label: "Wie die Zusammenarbeit läuft" },
    },
    {
      einwand: "„Was kostet mich das laufend?“",
      loesungName: "Dein eigener Server",
      satz: "Er läuft auf deinen Namen und kostet dich rund 30 Euro im Monat. Was sonst anfallen kann, steht im FAQ.",
      link: { href: faqHref("Fallen laufende Kosten an?"), label: "Alle laufenden Kosten" },
    },
    {
      einwand: "„Läuft das stabil, wenn niemand hinschaut?“",
      loesungName: "Dokumentiert und überwacht",
      satz: "Jedes System kommt sauber dokumentiert. In der Testphase schauen wir genau hin; danach entscheidest du, ob ich es weiter betreue.",
      link: { href: faqHref("Was passiert nach dem Projekt?"), label: "Was nach dem Projekt passiert" },
    },
    {
      einwand: "„Ersetzt das mich oder meine Mitarbeiter?“",
      loesungName: "Entlastet statt ersetzt",
      satz: "Das System übernimmt das Immergleiche. Alles, was dein Urteil braucht, bleibt bei dir und deinem Team.",
      link: { href: faqHref("Ersetzt die Automatisierung mich oder meine Mitarbeiter?"), label: "Mehr dazu im FAQ" },
    },
  ],
};
