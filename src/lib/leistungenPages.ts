// src/lib/leistungenPages.ts
//
// Copy for the four Leistungen pages and the hub. Slim redesign (Ajdin
// 2026-11-11): every page is Hero → Kennst du das? → Lösung in three steps →
// proof (MDZ, Velp) → Warum ich → CTA, nothing else. Components hold no
// German; guards in leistungenPages.test.ts.
import { KI_AGENTEN, KI_AGENTEN_PATH } from "@/lib/kiAgenten";
import { CHECK_SRC, type CheckSrc } from "@/lib/prozessCheckCta";
import { GARANTIE } from "@/lib/garantie";
import { faqHref } from "@/lib/faq";
import { WARTUNG_KUENDIGUNG, WARTUNG_TITEL } from "@/lib/wartung";

export type LeistungSlug = "prozess-audit" | "prozessautomatisierung" | "ki-automatisierung" | "betreuung";
export type LeistungGroup = "pruefen" | "bauen" | "betreiben";

export type Schritt = { title: string; text: string };
export type Szene = { kunde: string; titel: string; vorher: string; nachher: string; ergebnis?: string };
export type WarumPunkt = { title: string; body: string; link?: { label: string; href: string } };

// The four former KI pages (and the assistant scene) live on as one card each;
// their old URLs 308 to these anchors (next.config.ts).
// River order (Ajdin 2026-11-12): from the client's data down to the team.
export const KI_KARTEN_IDS = ["ki-betriebssystem", "ki-server", "claude", "ki-assistenten", "ki-schulung"] as const;
export type KiKarte = { id: (typeof KI_KARTEN_IDS)[number]; title: string; kurz: string; link?: { href: string; label: string } };

export type Pain = { heading: string; moments: string[]; close: string };
// Betreuung shows the Wartung comparison table (wartung.ts) instead of steps.
export type Loesung = {
  heading: string;
  schritte?: [Schritt, Schritt, Schritt];
  kartenHeading?: string;
  /** One line under the heading: the services can be booked on their own. */
  kartenHinweis?: string;
  karten?: KiKarte[];
  tabelle?: "wartung";
};
export type Szenen = { heading: string; items: Szene[] };
export type LeistungCta = { kind: "vorlagen" | "kontakt"; src: CheckSrc; heading: string; lead: string };

export type LeistungPage = {
  slug: LeistungSlug;
  group: LeistungGroup;
  navLabel: string;
  title: string;
  /** The <title> in Google: the search term, not the H1 (SEO pass 2026-11-12). */
  metaTitle: string;
  /** The one line on the hero image. */
  subline: string;
  metaDescription: string;
  /** One line for the hub's door cards. */
  kurz: string;
  heroImage: string;
  /** The Kennst-du-das block; Betreuung has none (Ajdin 2026-11-12). */
  pain?: Pain;
  loesung: Loesung;
  szenen: Szenen;
  warum: WarumPunkt[];
  cta: LeistungCta;
};

export const leistungGroups: { id: LeistungGroup; label: string }[] = [
  { id: "pruefen", label: "Prüfen" },
  { id: "bauen", label: "Bauen" },
  { id: "betreiben", label: "Betreiben" },
];

// Proof: confirmed numbers only (MDZ 2 h/day assistant + 4 h/month bookkeeping,
// Velp 5 h per client). MDZ without the family tie here; /referenzen carries it.
const MDZ_RECHNUNG: Szene = {
  kunde: "MDZ Hausmeisterservice",
  titel: "Aus einem Eintrag wird eine Rechnung",
  vorher: "Jede Rechnung von Hand in Word geschrieben, nummeriert und abgelegt.",
  nachher: "Ein Eintrag in Notion, die nummerierte Rechnung liegt als Word und PDF im Kundenordner.",
  ergebnis: "Rund 4 Stunden Buchhaltung im Monat gespart",
};
const MDZ_ASSISTENT: Szene = {
  kunde: "MDZ Hausmeisterservice",
  titel: "Aufgaben per Sprachnachricht",
  vorher: "Unterwegs gedacht, abends vergessen.",
  nachher: "Eine Sprachnachricht auf Telegram, der Assistent legt Termin, E-Mail oder Notiz an. Der Inhaber gibt frei.",
  ergebnis: "Rund 2 Stunden am Tag gespart",
};
const VELP_PHASEN: Szene = {
  kunde: "Velp, Marketingagentur in Regensburg",
  titel: "Jede Projektphase legt ihre Aufgaben selbst an",
  vorher: "Aufgaben, Fristen und Zuständige für jedes Projekt von Hand angelegt.",
  nachher: "Jede Phase legt ihre Aufgaben, Fristen und Zuständigkeiten selbst an.",
  ergebnis: "Rund 5 Stunden pro Kunde gespart",
};
// Velp's engine runs without KI, so the KI page proves with my own inbox instead.
const POSTFACH: Szene = {
  kunde: "Mein eigenes Postfach",
  titel: "Die KI ist der kleinste Teil",
  vorher: "Jede E-Mail selbst lesen und einsortieren.",
  nachher: "Beim ersten Durchlauf durch 174 E-Mails haben feste Regeln und bekannte Kontakte 96 einsortiert, die KI 66. Acht blieben für mich zur Prüfung.",
};
const BEI_KUNDEN: Szenen = { heading: "So läuft das bei meinen Kunden", items: [MDZ_RECHNUNG, VELP_PHASEN] };

// Warum ich (Ajdin 2026-11-11): one person, the guarantee, it belongs to you.
const ANSPRECHPARTNER: WarumPunkt = {
  title: "Ein Ansprechpartner.",
  body: "Du redest immer mit mir. Kein Team, keine Tickets, keine Warteschleife.",
};
const GARANTIE_PUNKT: WarumPunkt = {
  title: GARANTIE.titel,
  body: GARANTIE.text,
  link: { label: GARANTIE.faqLink, href: faqHref(GARANTIE.faqFrage) },
};
// "Pay once": no licence to Vrelo. Running costs of the client's own server stay
// his (FAQ), so the line never claims there are none.
const EINMAL_ZAHLEN: WarumPunkt = {
  title: "Einmal zahlen, alles gehört dir.",
  body: "Du zahlst den Bau einmal. Danach gehören dir Server, Konten, Daten und Doku. Keine Lizenz an mich.",
};
const WARUM_BAU: WarumPunkt[] = [ANSPRECHPARTNER, GARANTIE_PUNKT, EINMAL_ZAHLEN];

export const leistungenPages: LeistungPage[] = [
  {
    slug: "prozess-audit",
    group: "pruefen",
    navLabel: "Prozess-Audit",
    title: "Prozess-Audit",
    metaTitle: "Prozess-Audit: Abläufe kostenlos prüfen lassen",
    subline: "Kostenlos: Wir finden die Aufgabe, die du zuerst loswerden solltest.",
    metaDescription:
      "Kostenloser Prozess-Audit und KI-Beratung für Betriebe und Unternehmen: Ich gehe deine Abläufe mit dir durch und du bekommst deinen Fahrplan.",
    kurz: "Kostenlos: Ich gehe deine Abläufe mit dir durch und du bekommst deinen Fahrplan.",
    heroImage: "/images/leistung-prozess-audit.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Viele Baustellen, kein erster Schritt",
        "Software gekauft, halb eingerichtet",
        "Unklar, was sich bei dir lohnt",
        "Keine Zeit, das selbst zu sortieren",
      ],
      close: "Bevor ich etwas baue, klären wir, wo es dir Zeit spart.",
    },
    loesung: {
      heading: "So läuft der Audit. Alles kostenlos.",
      schritte: [
        { title: "Vorlage ansehen", text: "Der Bauplan für deine Branche zeigt dir, wo die Zeit hingeht. Kostenlos." },
        { title: "30 Minuten Gespräch", text: "Wir gehen deine Abläufe zusammen durch. Du bereitest nichts vor." },
        { title: "Dein Fahrplan", text: "Ein bis zwei Werktage später bekommst du deinen Fahrplan." },
      ],
    },
    szenen: BEI_KUNDEN,
    warum: [
      ANSPRECHPARTNER,
      GARANTIE_PUNKT,
      {
        title: "Der Fahrplan gehört dir.",
        body: "Dein Fahrplan gehört dir. Du setzt ihn selbst um, lässt ihn umsetzen oder baust mit mir.",
      },
    ],
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungProzessAudit,
      heading: "Fang mit einer Vorlage an.",
      lead: "Nimm dir den Bauplan für deine Branche. Danach gehen wir deine Abläufe zusammen durch, kostenlos.",
    },
  },
  {
    slug: "prozessautomatisierung",
    group: "bauen",
    navLabel: "Prozessautomatisierung",
    title: "Prozessautomatisierung",
    metaTitle: "Prozessautomatisierung für Betriebe und Unternehmen",
    subline: "Was in deinem Betrieb jeden Tag gleich abläuft, läuft ab jetzt von allein.",
    metaDescription:
      "Prozessautomatisierung für Betriebe und Unternehmen: Rechnungen, Angebote, Kunden-Onboarding und Datenübernahme laufen von selbst. Maßgeschneidert und dokumentiert.",
    kurz: "Wiederkehrende Abläufe wie Rechnungen, Angebote, Onboarding und Dateneingabe laufen von selbst.",
    heroImage: "/images/leistung-prozessautomatisierung.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Anfragen von Hand abtippen",
        "Dieselben Daten in drei Programmen",
        "Nachfassen bleibt liegen",
        "Aufgaben auf Zetteln",
      ],
      close: "Jeder Handgriff kostet Minuten. Zusammen sind es Stunden pro Woche.",
    },
    loesung: {
      heading: "So löse ich das",
      schritte: [
        { title: "Die Aufgabe festlegen", text: "Im kostenlosen Audit finden wir den Ablauf, der dich am meisten Zeit kostet." },
        { title: "In deinen Programmen bauen", text: "Rechnungen, Angebote, Onboarding oder Datenübernahme: Eine feste Regel erledigt es jedes Mal gleich." },
        { title: "An echten Fällen testen", text: "Du nimmst erst ab, wenn es mit deinen echten Daten sauber läuft." },
      ],
    },
    szenen: BEI_KUNDEN,
    warum: WARUM_BAU,
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungProzessautomatisierung,
      heading: "Welche Aufgabe kostet dich am meisten?",
      lead: "Der Bauplan für deine Branche zeigt dir, wo ein Auftrag Zeit frisst und womit du anfängst.",
    },
  },
  {
    slug: "ki-automatisierung",
    group: "bauen",
    navLabel: "KI-Automatisierung",
    title: "KI-Automatisierung",
    metaTitle: "KI-Automatisierung für Betriebe und Unternehmen",
    subline: "Die KI liest, sortiert und bereitet vor. Du gibst frei, bevor etwas rausgeht.",
    metaDescription:
      "KI-Automatisierung für Betriebe und Unternehmen: KI-Assistenten, KI-Betriebssystem, Claude für Unternehmen, KI-Server und KI-Schulung. Auf Wunsch innerhalb der EU.",
    kurz: "KI-Assistenten, KI-Betriebssystem, Claude, KI-Server und Schulung: die KI bereitet vor, du gibst frei.",
    heroImage: "/images/leistung-ki-automatisierung.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Rechnungen von Hand übertragen",
        "Das Wichtige geht im Postfach unter",
        "Unterwegs gedacht, abends vergessen",
        "Unterlagen kommen unvollständig",
      ],
      close: "Das braucht Aufmerksamkeit, aber kein Urteil. Das übernimmt die KI.",
    },
    loesung: {
      heading: "So löse ich das",
      schritte: [
        { title: "Die KI liest mit", text: "E-Mails, Belege und Sprachnachrichten, egal wie sie ankommen." },
        { title: "Sie bereitet vor", text: "Sie sortiert, trägt ein und schreibt Entwürfe in deinen Programmen." },
        { title: "Du gibst frei", text: "Nichts geht raus, bevor du es bestätigst." },
      ],
      kartenHeading: "Was dazugehört",
      kartenHinweis: "Jede Leistung bekommst du auch einzeln, ganz unabhängig von den anderen.",
      karten: [
        { id: "ki-betriebssystem", title: "KI-Betriebssystem", kurz: "Alles über deinen Betrieb an einer Stelle, damit jede KI darauf aufbaut." },
        { id: "ki-server", title: "KI-Server", kurz: "KI für sensible Daten auf einem Server, der dir gehört. Das Modell rechnet innerhalb der EU." },
        { id: "claude", title: "Claude für Unternehmen", kurz: "Claude, der KI-Assistent von Anthropic, eingerichtet für dein Team. Auf Wunsch über eine EU-Cloud." },
        {
          id: "ki-assistenten",
          title: "KI-Assistenten",
          kurz: "Die KI liest Belege, sortiert E-Mails und erledigt Aufgaben per Sprachnachricht.",
          // Ajdin 2026-11-11: the agent examples live on their own page.
          link: { href: KI_AGENTEN_PATH, label: "Beispiele für jede Abteilung" },
        },
        { id: "ki-schulung", title: "KI-Schulung", kurz: "Dein Team lernt Claude an euren eigenen Aufgaben." },
      ],
    },
    szenen: { heading: "So läuft das im Alltag", items: [MDZ_ASSISTENT, POSTFACH] },
    warum: WARUM_BAU,
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungKiAutomatisierung,
      heading: "Wo würde dir eine KI am meisten abnehmen?",
      lead: "Fang mit dem Bauplan für deine Branche an. Danach reden wir, wenn du willst.",
    },
  },
  {
    slug: "betreuung",
    group: "betreiben",
    navLabel: "Betreuung & Wartung",
    title: "Betreuung & Wartung",
    metaTitle: "Betreuung und Wartung für Automatisierungen",
    subline: "Ich halte deine Automatisierungen am Laufen. Du merkst nur, dass alles läuft.",
    metaDescription:
      "Betreuung und Wartung für Automatisierungen und KI-Systeme: vier Stufen, von Updates bis zur festen Zusammenarbeit. Ab dem 3. Monat monatlich kündbar.",
    kurz: `Vier Stufen, je nachdem, wie viel Zeit du von mir brauchst. ${WARTUNG_KUENDIGUNG}`,
    heroImage: "/images/leistung-betreuung.webp",
    loesung: { heading: WARTUNG_TITEL, tabelle: "wartung" },
    szenen: { heading: "Das betreue ich heute", items: [MDZ_ASSISTENT, VELP_PHASEN] },
    warum: [
      ANSPRECHPARTNER,
      { title: WARTUNG_KUENDIGUNG, body: "Drei Monate Mindestlaufzeit, danach bleibst du nur, solange es dir etwas bringt." },
      { title: "Alles gehört dir.", body: "Kündigst du, läuft dein System weiter, nur ohne Updates und Anpassungen von mir. Server, Konten, Daten und Doku bleiben bei dir." },
    ],
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungBetreuung,
      heading: "Erst bauen, dann betreuen.",
      lead: "Betreuung gibt es für Systeme, die ich gebaut habe. Fang mit einer kostenlosen Vorlage an.",
    },
  },
];

// The hub (/leistungen): same order, ServiceGroups (the three doors) is its Lösung, no Kennst-du-das.
export const leistungenHub: Pick<LeistungPage, "szenen" | "warum" | "cta"> = {
  szenen: BEI_KUNDEN,
  warum: WARUM_BAU,
  cta: {
    kind: "vorlagen",
    src: CHECK_SRC.leistungenClose,
    heading: "Dein erster Schritt: eine kostenlose Vorlage.",
    lead: "Der Bauplan für deine Branche zeigt dir, wo die Zeit hingeht. Danach reden wir, wenn du willst.",
  },
};

export function getLeistungPage(slug: string): LeistungPage | undefined {
  return leistungenPages.find((p) => p.slug === slug);
}

export function leistungHref(slug: LeistungSlug): string {
  return `/leistungen/${slug}`;
}

/** What a door lists in the menu and on the hub: its service pages, plus (Bauen)
 *  the KI-Agenten examples page, linked since Ajdin 2026-11-11. */
export type LeistungEintrag = { href: string; label: string; kurz: string };

export function leistungEintraege(group: LeistungGroup): LeistungEintrag[] {
  const pages = leistungenPages
    .filter((p) => p.group === group)
    .map((p) => ({ href: leistungHref(p.slug), label: p.navLabel, kurz: p.kurz }));
  return group === "bauen" ? [...pages, { href: KI_AGENTEN_PATH, label: KI_AGENTEN.title, kurz: KI_AGENTEN.line }] : pages;
}
