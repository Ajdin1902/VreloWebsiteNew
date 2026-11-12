// src/lib/regensburg.ts
// Copy for the local page /automatisierung-regensburg (SEO pass 2026-11-12, Ajdin
// approved; stop-slop applied). One honest page, never a template doorway (HQ §7).
// Visits are promised for Regensburg only (Ajdin 2026-11-12). MDZ appears only as
// „der Betrieb meines Vaters“ (UWG §5, same as /referenzen).
import { leistungHref } from "@/lib/leistungenPages";

export const REGENSBURG_PATH = "/automatisierung-regensburg";

export type RegensburgBlock = {
  heading: string;
  text: string;
  links?: { label: string; href: string }[];
};

export const REGENSBURG = {
  meta: {
    title: "Automatisierung in Regensburg und der Oberpfalz",
    description:
      "Ich automatisiere wiederkehrende Aufgaben für Betriebe in Regensburg und der Oberpfalz. Erst prüfe ich deine Abläufe, dann baue ich.",
  },
  hero: {
    eyebrow: "Regensburg und Oberpfalz",
    title: "Automatisierung aus Regensburg.",
    line: "Ich schaue mir deine Abläufe an und baue, was dich jeden Tag Zeit kostet.",
  },
  bloecke: [
    {
      heading: "Ein Ansprechpartner in deiner Nähe",
      text: "Mein Büro liegt in der Dietrich-Bonhoeffer-Straße in Regensburg. Bist du in Regensburg, komme ich gern zu dir in den Betrieb. Das erste Gespräch dauert 30 Minuten und kostet nichts.",
    },
    {
      heading: "Was ich baue",
      text: "Zuerst prüfe ich, wo bei dir die Zeit hingeht. Dann automatisiere ich die Aufgabe, die dich am meisten kostet, zum Beispiel Rechnungen oder Angebote. Das System läuft auf deinem eigenen Server und gehört dir.",
      links: [
        { label: "Prozess-Audit", href: leistungHref("prozess-audit") },
        { label: "Prozessautomatisierung", href: leistungHref("prozessautomatisierung") },
        { label: "KI-Automatisierung", href: leistungHref("ki-automatisierung") },
      ],
    },
    {
      heading: "Schon gebaut in Regensburg",
      text: "Zwei Betriebe aus Regensburg arbeiten schon mit meinen Systemen. Einer davon ist der Betrieb meines Vaters.",
      links: [{ label: "Zu den Referenzen", href: "/referenzen" }],
    },
  ] satisfies RegensburgBlock[],
  cta: {
    heading: "Wo verlierst du jeden Tag Zeit?",
    lead: "Fang mit der kostenlosen Vorlage für deine Branche an. Danach reden wir 30 Minuten, in Regensburg gern auch bei dir vor Ort.",
  },
  footerLabel: "Automatisierung in Regensburg",
};
