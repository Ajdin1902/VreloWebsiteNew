// src/lib/leistungenPages.ts
//
// The four Leistungen subpages (spec 2026-10-01; four doors 2026-11-04; cut from eight to four on
// 2026-11-11, spec docs/superpowers/specs/2026-11-11-leistungen-vorlagen-garantie-design.md: the four
// former KI pages live on as anchored sections of KI-Automatisierung). Every German string for
// /leistungen/<slug> lives here; the route and the block components hold none.
// One entry = one page: a new service is a new entry, never a new component.
// Rules for this copy: docs/superpowers/specs/2026-10-01-leistungen-hub-design.md §2, §4, §7.
import { CHECK_SRC, type CheckSrc } from "@/lib/prozessCheckCta";

// Digitalbonus Bayern (HQ: Knowledge/marketing/digitalbonus-bayern.md). Shown on the
// audit page (the application must precede the order) and on both build pages.
const FOERDERUNG_NOTE = {
  heading: "Förderung",
  body: "Sitzt dein Betrieb in Bayern und hat weniger als 50 Mitarbeiter, kann der Digitalbonus Bayern einen Teil der Kosten übernehmen, oft bis zur Hälfte. Wichtig: Der Antrag muss gestellt sein, bevor du jemanden beauftragst. Ob er bei dir passt, klären wir im Gespräch.",
  link: { label: "Zum Förderprogramm", href: "https://www.digitalbonus.bayern/foerderprogramm/" },
};

export type LeistungSlug = "prozess-audit" | "prozessautomatisierung" | "ki-automatisierung" | "betreuung";

/** One drawing per page, in src/components/leistungen/grafiken/. */
export type LeistungGrafik = "ki-fluss" | "betriebssystem-becken" | "prozess-fliessband" | "ki-server-rahmen" | "prozess-audit-balken" | "betreuung-zeitlinie" | "claude-projekt" | "schulung-vorlagen";

// Three doors since 2026-11-11 (Befähigen folded into KI-Automatisierung): the question an owner asks.
export type LeistungGroup = "pruefen" | "bauen" | "betreiben";

export type StudyFigure = { figure: string; claim: string; source: string; year: number; url: string };

export type Proof = (
  | { kind: "studies"; heading: string; figures: StudyFigure[]; caseLine?: string }
  | { kind: "case"; heading: string; body: string }
  | { kind: "practice"; heading: string; body: string; points: { title: string; body: string }[] }
) & { objection: string };

export type LeistungPage = {
  slug: LeistungSlug;
  group: LeistungGroup;
  navLabel: string;
  title: string;
  /** One short sentence (≤ 90 chars) that defines the service; shown in the hero. */
  subline: string;
  metaDescription: string;
  /** One sentence for the hub card. */
  kurz: string;
  heroImage: string;
  pain: { heading: string; moments: string[]; close: string };
  proof: Proof;
  /** The sub-services as overview cards (2026-11-11); `href` jumps to a section or a page. */
  angebote?: { heading: string; karten: AngebotKarte[] };
  /** Named scenes from real cases with their confirmed result (2026-11-11). */
  szenen?: { id?: string; heading: string; items: Szene[] };
  /** Either a three-step run (before → steps → after) or a real clip on its own. */
  example?:
    | { heading: string; before: string; steps: [string, string, string]; after: string }
    | { heading: string; video: { src: string; poster: string } };
  /** The former KI subpages as anchored sections (KI-Automatisierung only). */
  abschnitte?: Abschnitt[];
  /** The ownership line with the link to Wartung (build pages). */
  eigentum?: true;
  /** Renders the Wartung tiers from src/lib/wartung.ts (Betreuung only). */
  wartung?: true;
  /** Renders the existing ProzessAudit card after the example (Prozess-Audit only). */
  auditCard?: boolean;
  /** A two-column comparison after the example (automation pages, Claude). */
  vergleich?: Vergleich;
  /** A graphic to remember the service by, right after the proof block (Ajdin
   *  2026-10-20). `kind` picks the drawing; `alt` is what a screen reader hears. */
  grafik?: { kind: LeistungGrafik; heading: string; alt: string };
  note?: { heading: string; body: string; link: { label: string; href: string } };
  cta: { kind: "vorlagen" | "kontakt"; src: CheckSrc; heading: string; lead: string };
  /** Ratgeber slugs for the „Mehr dazu“ line, 1 to 3. */
  related: string[];
};

export type AngebotKarte = { title: string; kurz: string; href?: string };
export type Szene = { kunde: string; titel: string; vorher: string; nachher: string; ergebnis?: string };
export type AbschnittId = "ki-betriebssystem" | "claude" | "ki-server" | "ki-schulung";
export type Abschnitt = {
  id: AbschnittId;
  title: string;
  lead: string;
  absaetze: string[];
  grafik?: LeistungPage["grafik"];
  vergleich?: Vergleich;
  note?: LeistungPage["note"];
};

export const leistungGroups: { id: LeistungGroup; label: string }[] = [
  { id: "pruefen", label: "Prüfen" },
  { id: "bauen", label: "Bauen" },
  { id: "betreiben", label: "Betreiben" },
];

// Ajdin 2026-11-11: every build is the client's; Wartung is an option, never a duty.
export const EIGENTUM = {
  text: "Einmal gebaut, gehört es dir. Keine monatliche Pflicht: Wartung nur, wenn du sie willst.",
  link: { label: "Zu Betreuung & Wartung", href: "/leistungen/betreuung" },
};

// Verified study figures (Knowledge/marketing/ki-studien.md, checked 2026-10-01 on the source pages).
export const kiStudien: StudyFigure[] = [
  {
    figure: "26 %",
    claim: "der Unternehmen in Deutschland nutzten 2025 künstliche Intelligenz. Bei Betrieben mit 10 bis 49 Beschäftigten waren es 23 %.",
    source: "Statistisches Bundesamt",
    year: 2025,
    url: "https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/IKT-in-Unternehmen-IKT-Branche/Tabellen/ikti-unternehmen-kuenstliche-intelligenz.html",
  },
  {
    figure: "3 Stunden",
    claim: "pro Woche oder mehr spart jeder zweite, der KI im Beruf nutzt. Das ist der Median aus elf Ländern des Euroraums, rund 7,7 % der Arbeitszeit.",
    source: "Europäische Zentralbank",
    year: 2026,
    url: "https://www.ecb.europa.eu/press/blog/date/2026/html/ecb.blog20260826~e1c1a89999.en.html",
  },
  {
    figure: "72 %",
    claim: "der Unternehmen, die über KI nachgedacht, sie aber nicht eingesetzt haben, nennen fehlendes Wissen als Grund.",
    source: "Statistisches Bundesamt",
    year: 2025,
    url: "https://www.destatis.de/DE/Themen/Branchen-Unternehmen/Unternehmen/IKT-in-Unternehmen-IKT-Branche/Tabellen/ikti-gegen-nutzung-kuenstliche-intelligenz.html",
  },
];

// The difference between the two automation pages, shown on both (Ajdin
// 2026-10-20). One cell per column and row, each read as a single point.
export type Vergleich = {
  heading: string;
  /** The one sentence to remember, shown under the table. */
  faustregel: string;
  /** A column with a slug links to that page; the current page's column, or one marked warm, is highlighted. */
  columns: [VergleichColumn, VergleichColumn];
  rows: { label: string; cells: [string, string] }[];
  close: string;
};
type VergleichColumn = { title: string; slug?: LeistungSlug; warm?: true };

export const automatisierungVergleich: Vergleich = {
  heading: "Prozessautomatisierung oder KI? Was ist der Unterschied?",
  faustregel:
    "Kommt die Information jedes Mal gleich an, reicht eine Prozessautomatisierung. Kommt sie jedes Mal anders an, braucht es KI.",
  columns: [
    { slug: "prozessautomatisierung", title: "Prozessautomatisierung" },
    { slug: "ki-automatisierung", title: "KI-Automatisierung" },
  ],
  rows: [
    {
      label: "Arbeitet mit",
      cells: [
        "Festen Regeln: Kommt eine Anfrage rein, folgt immer derselbe Schritt.",
        "Inhalten: Die KI liest Texte und Sprachnachrichten und erkennt, worum es geht.",
      ],
    },
    {
      label: "Passt zu",
      cells: [
        "Abläufen mit sauberen Daten, etwa aus Formularen und Kalendern.",
        "Unordentlichen Eingängen wie E-Mails und Rechnungen als PDF.",
      ],
    },
    {
      label: "Ergebnis",
      cells: [
        "Gleich bei jedem Durchlauf und Schritt für Schritt nachvollziehbar.",
        "Ein Vorschlag, den du prüfst und freigibst, bevor er rausgeht.",
      ],
    },
    {
      label: "Beispiel",
      cells: [
        "Eine Anfrage landet im System und der Zuständige bekommt Bescheid.",
        "Die KI liest eine Rechnung und trägt Lieferant, Betrag und Datum in die Buchhaltung ein.",
      ],
    },
    {
      label: "Technik",
      cells: [
        "Läuft in deinen Programmen, ohne KI-Anbieter.",
        "Läuft mit einem KI-Modell, auf Wunsch innerhalb der EU.",
      ],
    },
  ],
  close:
    "Oft arbeiten beide zusammen: Die KI liest die Rechnung, die Automatisierung legt sie ab. Im Gespräch klären wir, was deine Aufgabe braucht.",
};

// Ajdin 2026-11-10: Claude also runs without Anthropic in the data path, via
// Claude Desktop on Amazon Bedrock or Google Cloud in an EU region (checked
// 2026-11-10: claude.com/docs/third-party/claude-desktop/overview). Never
// Microsoft Foundry (Global or US only) and never "Deutschland"/"Frankfurt":
// no Claude route pins a German region, the honest word is "innerhalb der EU".
export const claudeVergleich: Vergleich = {
  heading: "Direkt bei Anthropic oder über eine EU-Cloud?",
  faustregel: "Gehen Kunden- oder Personaldaten durch Claude, nimm den Weg über die EU-Cloud.",
  columns: [{ title: "Claude direkt" }, { title: "Claude über eine EU-Cloud", warm: true }],
  rows: [
    {
      label: "Das Modell rechnet",
      cells: [
        "Bei Anthropic, einem US-Anbieter. Gespeichert wird in den USA.",
        "Innerhalb der EU, bei Amazon Web Services oder Google Cloud.",
      ],
    },
    {
      label: "Gespräche liegen",
      cells: [
        "Im Konto bei Anthropic, auf jedem Gerät abrufbar.",
        "Auf dem Rechner deines Mitarbeiters. Anthropic bekommt sie nicht.",
      ],
    },
    {
      label: "Vertrag",
      cells: [
        "Mit Anthropic, über den Team-Plan.",
        "Mit Amazon oder Google, in einem Konto auf deinen Namen.",
      ],
    },
    {
      label: "Funktionen",
      cells: [
        "Neue Funktionen kommen hier zuerst an.",
        "Dieselbe Claude-App mit Chat und Arbeit in euren Ordnern. Neues kommt etwas später.",
      ],
    },
    {
      label: "Passt zu",
      cells: [
        "Texten, Recherche und Entwürfen ohne Kunden- oder Personaldaten.",
        "Arbeit mit Kunden- und Personaldaten, die in der EU bleiben sollen.",
      ],
    },
  ],
  close:
    "Den EU-Weg richte ich in einem Konto auf deinen Namen ein: Du zahlst direkt und die Daten gehören dir. Welcher Weg zu euch passt, klären wir im Erstgespräch.",
};

export const leistungenPages: LeistungPage[] = [
  {
    slug: "prozess-audit",
    group: "pruefen",
    navLabel: "Prozess-Audit",
    title: "Prozess-Audit",
    subline:
      "Kostenlos: Wir finden die Aufgabe, die du zuerst loswerden solltest.",
    metaDescription:
      "Kostenloser Prozess-Audit und KI-Beratung für Betriebe und Unternehmen: Ich gehe deine Abläufe mit dir durch. Lohnt sich etwas, bekommst du deinen Fahrplan.",
    kurz: "Kostenlos: Ich gehe deine Abläufe mit dir durch. Lohnt sich etwas, bekommst du einen Fahrplan.",
    heroImage: "/images/bg-proof.webp",
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
    angebote: {
      heading: "Alles davon ist kostenlos",
      karten: [
        { title: "Prozess-Check", kurz: "Drei Minuten. Du siehst sofort, wo deine Stunden hingehen.", href: "/prozess-check?src=leistung-prozess-audit" },
        { title: "Gespräch", kurz: "30 Minuten gehen wir zusammen durch deine Abläufe." },
        { title: "Audit", kurz: "Ich schaue mir die Aufgaben genauer an, die dich am meisten Zeit kosten." },
        { title: "Fahrplan", kurz: "Lohnt sich etwas, bekommst du ihn ein bis zwei Werktage später." },
      ],
    },
    grafik: {
      kind: "prozess-audit-balken",
      heading: "Wir fangen dort an, wo die meiste Zeit verloren geht.",
      alt: "Fünf Aufgaben als Balken, sortiert nach Zeitaufwand: Anfragen beantworten, Rechnungen übertragen, Termine abstimmen, Angebote schreiben und Nachfassen. Bei der Aufgabe mit dem längsten Balken fangen wir an. Der Audit läuft in drei Schritten: 30 Minuten Gespräch, genauer Blick und ein Fahrplan, wenn es sich lohnt.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: "Im Audit schaue ich mir an, wie deine Arbeit heute läuft: wo du Daten von Hand überträgst und welche Aufgabe dich die meiste Zeit kostet. Ich empfehle dir nur, was ich selbst bauen und betreiben würde. Mit KI auskennen musst du dich nicht: Du erzählst mir, was dich Zeit kostet, ich suche die passende Technik dazu.",
      points: [
        { title: "Erst das, was du schon hast.", body: "Dein Programm kann oft mehr, als du nutzt. Kann es die Aufgabe schon, zeige ich dir die Einstellung. Dann brauchst du keinen Bau." },
        { title: "Du bereitest nichts vor.", body: "Ich bringe die Fragen mit. Du erzählst mir, wie dein Tag läuft." },
        { title: "Der Fahrplan gehört dir.", body: "Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen." },
      ],
      objection:
        "Lohnt sich bei dir gerade nichts, sage ich dir das im Gespräch. Dann schicke ich dir auch kein Angebot.",
    },
    // No numbers until the first real audit (spec §6a): the scene shows what the document holds.
    szenen: {
      heading: "So sieht ein Fahrplan aus",
      items: [
        {
          kunde: "Beispiel",
          titel: "Was in deinem Fahrplan steht",
          vorher: "Viele Aufgaben, unklar, wo du anfängst.",
          nachher: "Eine Aufgabe zuerst, der erste Schritt und die Reihenfolge danach.",
        },
      ],
    },
    example: {
      heading: "So läuft der Audit",
      before: "Du verlierst jeden Tag Zeit, weißt aber nicht, wo du anfangen sollst.",
      steps: [
        "Im kostenlosen Gespräch gehen wir 30 Minuten lang deine Abläufe durch.",
        "Danach schaue ich mir die Aufgaben genauer an, die dich am meisten Zeit kosten.",
        "Lohnt sich etwas, bekommst du ein bis zwei Werktage später deinen Fahrplan. In einem kurzen Gespräch gehen wir ihn zusammen durch.",
      ],
      after: "Du weißt, womit du anfängst. Ob und mit wem du es umsetzt, entscheidest du.",
    },
    auditCard: true,
    note: FOERDERUNG_NOTE,
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungProzessAudit,
      heading: "Fang mit einer Vorlage an.",
      lead: "Nimm dir den Bauplan für deine Branche. Danach gehen wir deine Abläufe zusammen durch, kostenlos.",
    },
    related: ["selbst-bauen-oder-bauen-lassen", "taeglich-stunden-zurueckgewinnen", "was-ist-prozessautomatisierung"],
  },
  {
    slug: "prozessautomatisierung",
    group: "bauen",
    navLabel: "Prozessautomatisierung",
    title: "Prozessautomatisierung",
    subline:
      "Was in deinem Betrieb jeden Tag gleich abläuft, läuft ab jetzt von allein.",
    metaDescription:
      "Prozessautomatisierung für Betriebe und Unternehmen: Rechnungen, Angebote, Kunden-Onboarding und Datenübernahme laufen von selbst. Maßgeschneidert und dokumentiert.",
    kurz: "Wiederkehrende Abläufe wie Rechnungen, Angebote, Onboarding und Dateneingabe laufen von selbst.",
    heroImage: "/images/bg-steps.webp",
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
    angebote: {
      heading: "Was ich automatisiere",
      karten: [
        { title: "Rechnungen und Belege", kurz: "Aus einem Eintrag wird die Rechnung, Belege landen im richtigen Ordner." },
        { title: "Angebot bis Auftrag", kurz: "Aus der Anfrage wird ein Angebot, aus der Zusage ein Auftrag, ohne dass du etwas abtippst." },
        { title: "Kunden-Onboarding", kurz: "Ist ein Kunde gewonnen, laufen Begrüßung, Ordner und Aufgaben von selbst an." },
        { title: "Datenübernahme zwischen Programmen", kurz: "Was in einem Programm steht, steht auch im nächsten. Du tippst nichts doppelt." },
      ],
    },
    grafik: {
      kind: "prozess-fliessband",
      heading: "Einmal festgelegt, läuft es jedes Mal gleich.",
      alt: "Eine Anfrage kommt jedes Mal im gleichen Formular an. Eine feste Regel legt den Kontakt an, bestätigt den Eingang und informiert den Zuständigen. Bleibt die Anfrage liegen, kommt nach zwei Tagen eine Erinnerung.",
    },
    proof: {
      kind: "case",
      heading: "So baue ich",
      body: "Ich baue jeden Ablauf in deinen eigenen Programmen und dokumentiere jeden Schritt.",
      objection:
        "Deine Leute behalten ihre Arbeit. Das System nimmt ihnen das Abtippen ab, damit sie Zeit für die Aufgaben haben, für die du sie eingestellt hast.",
    },
    szenen: {
      heading: "So läuft das bei meinen Kunden",
      items: [
        {
          kunde: "MDZ Hausmeisterservice, der Betrieb meines Vaters",
          titel: "Aus einem Eintrag wird eine Rechnung",
          vorher: "Jede Rechnung von Hand in Word geschrieben, nummeriert und abgelegt.",
          nachher: "Ein Eintrag in Notion, die nummerierte Rechnung liegt als Word und PDF im Kundenordner.",
        },
        {
          kunde: "Velp, Marketingagentur in Regensburg",
          titel: "Jede Projektphase legt ihre Aufgaben selbst an",
          vorher: "Aufgaben, Fristen und Zuständige für jedes Projekt von Hand angelegt.",
          nachher: "Jede Phase legt ihre Aufgaben, Fristen und Zuständigkeiten selbst an.",
          ergebnis: "Rund 5 Stunden pro Kunde gespart",
        },
      ],
    },
    vergleich: automatisierungVergleich,
    eigentum: true,
    note: FOERDERUNG_NOTE,
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungProzessautomatisierung,
      heading: "Welche Aufgabe kostet dich am meisten?",
      lead: "Der Bauplan für deine Branche zeigt dir, wo ein Auftrag Zeit frisst und womit du anfängst.",
    },
    related: ["was-ist-prozessautomatisierung", "taeglich-stunden-zurueckgewinnen", "aus-jeder-anfrage-ein-termin"],
  },
  {
    slug: "ki-automatisierung",
    group: "bauen",
    navLabel: "KI-Automatisierung",
    title: "KI-Automatisierung",
    subline:
      "Die KI liest, sortiert und bereitet vor. Du gibst frei, bevor etwas rausgeht.",
    metaDescription:
      "KI-Automatisierung für Betriebe und Unternehmen: KI-Assistenten, KI-Betriebssystem, Claude für Unternehmen, KI-Server und KI-Schulung. Auf Wunsch innerhalb der EU.",
    kurz: "KI-Assistenten, KI-Betriebssystem, Claude, KI-Server und Schulung: die KI bereitet vor, du gibst frei.",
    heroImage: "/images/bg-lichtschacht.webp",
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
    angebote: {
      heading: "Was KI bei dir übernimmt",
      karten: [
        { title: "KI-Assistenten", kurz: "Die KI liest Belege, sortiert E-Mails und erledigt Aufgaben per Sprachnachricht.", href: "#ki-assistenten" },
        { title: "KI-Betriebssystem", kurz: "Alles über deinen Betrieb an einer Stelle, damit jede KI darauf aufbaut.", href: "#ki-betriebssystem" },
        { title: "Claude für Unternehmen", kurz: "Claude für dein Team eingerichtet, mit euren Vorlagen. Auf Wunsch innerhalb der EU.", href: "#claude" },
        { title: "KI-Server", kurz: "KI für sensible Daten: auf einem Server, der dir gehört, mit Modellen innerhalb der EU.", href: "#ki-server" },
        { title: "KI-Schulung", kurz: "Dein Team lernt Claude und erste Automatisierungen an euren eigenen Aufgaben.", href: "#ki-schulung" },
      ],
    },
    grafik: {
      kind: "ki-fluss",
      heading: "Unordentlich rein, geordnet raus.",
      alt: "E-Mail, Rechnung und Sprachnachricht kommen jedes Mal anders an. Die KI liest sie und ordnet sie in gleiche Karten mit Feldern wie Absender, Lieferant, Betrag und Datum. Du gibst frei, bevor etwas weitergeht.",
    },
    proof: {
      kind: "studies",
      heading: "Was die Zahlen sagen",
      figures: kiStudien,
      objection: "Die KI liest und sortiert, entscheiden tust du. Was sie vorbereitet, gibst du frei, bevor es rausgeht.",
    },
    szenen: {
      id: "ki-assistenten",
      heading: "So läuft das im Alltag",
      items: [
        {
          kunde: "MDZ Hausmeisterservice, der Betrieb meines Vaters",
          titel: "Aufgaben per Sprachnachricht",
          vorher: "Unterwegs gedacht, abends vergessen.",
          nachher: "Eine Sprachnachricht auf Telegram, der Assistent legt Termin, E-Mail oder Notiz an. Der Inhaber gibt frei.",
          ergebnis: "Rund 2 Stunden am Tag gespart",
        },
        {
          kunde: "Mein eigenes Postfach",
          titel: "Die KI ist der kleinste Teil",
          vorher: "Jede E-Mail selbst lesen und einsortieren.",
          nachher: "Beim ersten Durchlauf durch 174 E-Mails haben feste Regeln und bekannte Kontakte 96 einsortiert, die KI 66. Acht blieben für mich zur Prüfung.",
        },
      ],
    },
    example: {
      heading: "So sieht das aus",
      video: { src: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" },
    },
    abschnitte: [
      {
        id: "ki-betriebssystem",
        title: "KI-Betriebssystem",
        lead: "Eine Stelle, an der alles über deinen Betrieb stimmt. Darauf arbeitet deine KI.",
        absaetze: [
          "Kundendaten in fünf Programmen, das Wissen in einem Kopf: Eine KI hilft erst, wenn alles über deinen Betrieb an einer Stelle stimmt.",
          "Ich nehme Informationen dort auf, wo sie ankommen, meist im Postfach. Was die KI einträgt, steht mit dem Satz aus der E-Mail drin. Bis du bestätigst, bleibt es ein KI-Eintrag.",
          "Deine Daten bleiben in deinen Programmen und auf deinen Konten. Jede neue Automatisierung baut auf dieser Stelle auf.",
        ],
        grafik: {
          kind: "betriebssystem-becken",
          heading: "Alles fließt an eine Stelle.",
          alt: "Postfach, Chat, CRM, Formulare und Termine fließen mit ihrer Quelle an eine Stelle. Darauf bauen Automatisierungen, Fristen und Aufgaben und ein Assistent auf, der dir zum Beispiel sagt, was bei einem Kunden offen ist.",
        },
        note: {
          heading: "Zum Ausprobieren",
          body: "Die kleine Version kannst du selbst anlegen: Ein Text baut in Claude ein Gehirn für deinen Betrieb auf. Kostenlos, ohne Anmeldung.",
          link: { label: "Zum Claude-Gehirn", href: "/claude-gehirn" },
        },
      },
      {
        id: "claude",
        title: "Claude für Unternehmen",
        lead: "Claude, der KI-Assistent von Anthropic, für dein Team. Auf Wunsch innerhalb der EU.",
        absaetze: [
          "Jeder im Team nutzt KI anders und Claude kennt euren Betrieb nicht. Ich lege ein Claude-Projekt mit euren Leistungen, Preisen und Vorlagen an. So beginnt jeder Entwurf in eurem Ton.",
          "Ich arbeite selbst jeden Tag mit Claude: für Code, Texte, Recherche und meine eigenen Automatisierungen. Was du bekommst, habe ich selbst im Einsatz.",
          "Gehen Kunden- oder Personaldaten durch Claude, richte ich den Weg über eine EU-Cloud ein, in einem Konto auf deinen Namen. Dann rechnet das Modell innerhalb der EU.",
        ],
        grafik: {
          kind: "claude-projekt",
          heading: "Einmal eingerichtet, für das ganze Team.",
          alt: "Vier Karten mit eurem Wissen: Leistungen, Preise, Vorlagen und Regeln für Daten. Sie fließen in ein gemeinsames Projekt. Daraus entstehen Angebot, E-Mail und Zusammenfassung, alle in eurem Ton.",
        },
        vergleich: claudeVergleich,
        note: {
          heading: "Zum Ausprobieren",
          body: "Wie ich Claude selbst nutze, kannst du nachbauen: Ein Text legt in einem Ordner ein Gehirn für deinen Betrieb an. Kostenlos, ohne Anmeldung.",
          link: { label: "Zum Claude-Gehirn", href: "/claude-gehirn" },
        },
      },
      {
        id: "ki-server",
        title: "KI-Server",
        lead: "KI für sensible Daten: auf deinem eigenen Server, gerechnet innerhalb der EU.",
        absaetze: [
          "Kundendaten gehören in kein fremdes Chatfenster. Ein KI-Server läuft in einem Konto auf deinen Namen: Du zahlst ihn direkt und besitzt die Daten vom ersten Tag an.",
          "Das KI-Modell rechnet innerhalb der EU, der Anbieter speichert deine Anfragen nicht und trainiert nicht damit. Lädt ein Kunde seine Unterlagen hoch, prüft die KI sie und legt sie sortiert in deinen Ordner.",
          "Ich richte ihn ein, sichere ihn ab und dokumentiere alles. Endet unsere Zusammenarbeit, läuft er sicher weiter.",
        ],
        grafik: {
          kind: "ki-server-rahmen",
          heading: "Die KI kommt zu deinen Daten.",
          alt: "Dein Server läuft auf deinen Namen und rechnet innerhalb der EU. Unterlagen werden hochgeladen, die KI prüft sie und legt sie in deinen Ordner. Nur die Nachfrage nach fehlenden Unterlagen geht hinaus, an deinen eigenen Kunden.",
        },
      },
      {
        id: "ki-schulung",
        title: "KI-Schulung",
        lead: "Dein Team lernt den KI-Assistenten Claude von Anthropic, an euren eigenen Aufgaben.",
        absaetze: [
          "Wir nehmen echte Aufgaben aus eurem Alltag. Dein Team baut sich dafür Vorlagen in Claude, mit euren Regeln und eurem Ton. Ab dem nächsten Tag nutzt jeder sie.",
          "Zwei Themen, gründlich: Claude im Alltag und der Schritt zur ersten eigenen Automatisierung. Vor Ort oder online, das Format legen wir im Gespräch fest.",
        ],
        grafik: {
          kind: "schulung-vorlagen",
          heading: "Jede Aufgabe wird zu einer Vorlage.",
          alt: "Vorher und nachher: Vorher liegen lose Dokumente durcheinander. Nachher wird aus einer echten Aufgabe eures Teams in der Schulung eine Vorlage gebaut, die am nächsten Tag im Einsatz ist. Dann kommt die nächste Aufgabe dran.",
        },
        note: {
          heading: "Gut zu wissen",
          body: "Seit Februar 2025 verlangt die KI-Verordnung der EU (Artikel 4), dass Betriebe, die KI einsetzen, ihre Mitarbeiter dafür ausreichend schulen. Eine Schulung an euren eigenen Aufgaben erfüllt genau das und bringt dir zugleich den Nutzen.",
          link: { label: "Zum Gesetzestext", href: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de" },
        },
      },
    ],
    vergleich: automatisierungVergleich,
    eigentum: true,
    note: FOERDERUNG_NOTE,
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungKiAutomatisierung,
      heading: "Wo würde dir eine KI am meisten abnehmen?",
      lead: "Fang mit dem Bauplan für deine Branche an. Danach reden wir, wenn du willst.",
    },
    related: ["was-ist-ein-ki-agent", "claude-oder-chatgpt", "was-ist-ein-ki-server"],
  },
  {
    slug: "betreuung",
    group: "betreiben",
    navLabel: "Betreuung & Wartung",
    title: "Betreuung & Wartung",
    subline:
      "Ich halte deine Automatisierungen am Laufen. Du merkst nur, dass alles läuft.",
    metaDescription:
      "Betreuung und Wartung für Automatisierungen und KI-Systeme: drei Stufen, Überwachung mit Alarm, Fehlerbehebung, Anpassungen. Monatlich kündbar.",
    kurz: "Drei Stufen, je nachdem, wie viel Zeit du von mir brauchst. Monatlich kündbar.",
    heroImage: "/images/bg-werkzeuge.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Fehler fallen erst Wochen später auf",
        "Schnittstelle geändert, Verbindung tot",
        "Wer es gebaut hat, ist weg",
        "Läuft der Server sicher?",
      ],
      close: "Eine Automatisierung spart Zeit, solange jemand prüft, dass sie läuft.",
    },
    grafik: {
      kind: "betreuung-zeitlinie",
      heading: "Ich merke es zuerst.",
      alt: "Eine Zeitlinie: Dein System läuft, dann bricht eine Verbindung ab. Der Alarm kommt bei mir an, ich behebe den Fehler und die liegengebliebenen Vorgänge laufen nach. Zum Arbeitsbeginn läuft alles wieder.",
    },
    proof: {
      kind: "case",
      heading: "So betreue ich",
      body: "Ich warte deine Automatisierungen und halte sie aktuell. Mit meinem Monitoring-System greife ich ein, bevor aus einem Fehler ein Problem wird. Ab der Stufe Standard baue ich dein System außerdem weiter aus.",
      objection:
        "Die Betreuung ist monatlich kündbar. Kündigst du, läuft dein System sicher weiter, nur ohne Anpassungen.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Einen Fehler bemerkst du erst, wenn sich ein Kunde beschwert.",
      steps: [
        "Eine Verbindung zu einem Programm bricht nachts ab.",
        "Der Alarm kommt bei mir an und ich sehe, welcher Schritt fehlgeschlagen ist.",
        "Ich behebe den Fehler und lasse die liegengebliebenen Vorgänge nachlaufen.",
      ],
      after: "Der Fehler ist behoben, bevor dein Kunde ihn bemerkt.",
    },
    wartung: true,
    cta: {
      kind: "vorlagen",
      src: CHECK_SRC.leistungBetreuung,
      heading: "Erst bauen, dann betreuen.",
      lead: "Betreuung gibt es für Systeme, die ich gebaut habe. Fang mit einer kostenlosen Vorlage an.",
    },
    related: ["wo-laeuft-deine-ki", "selbst-bauen-oder-bauen-lassen"],
  },
];

export function getLeistungPage(slug: string): LeistungPage | undefined {
  return leistungenPages.find((p) => p.slug === slug);
}

export function leistungHref(slug: LeistungSlug): string {
  return `/leistungen/${slug}`;
}
