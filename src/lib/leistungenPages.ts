// src/lib/leistungenPages.ts
//
// The nine Leistungen subpages (spec 2026-10-01; Prozess-Audit added 2026-10-15). Every German string for
// /leistungen/<slug> lives here; the route and the block components hold none.
// One entry = one page: a new service is a new entry, never a new component.
// Rules for this copy: docs/superpowers/specs/2026-10-01-leistungen-hub-design.md §2, §4, §7.
import { CHECK_SRC, type CheckSrc } from "@/lib/prozessCheckCta";

export type LeistungSlug =
  | "prozessautomatisierung"
  | "ki-automatisierung"
  | "ki-server"
  | "claude"
  | "ki-schulung"
  | "ki-beratung"
  | "prozess-audit"
  | "ki-betriebssystem"
  | "betreuung";

export type LeistungGroup = "automatisieren" | "befaehigen" | "betreiben";

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
  /** Either a three-step run (before → steps → after) or a real clip on its own. */
  example:
    | { heading: string; before: string; steps: [string, string, string]; after: string }
    | { heading: string; video: { src: string; poster: string } };
  /** Renders the existing ProzessAudit card after the example (Prozess-Audit only). */
  auditCard?: boolean;
  /** Renders the Prozess- vs. KI-Automatisierung comparison after the example. */
  vergleich?: boolean;
  note?: { heading: string; body: string; link: { label: string; href: string } };
  cta: { kind: "check" | "kontakt"; src: CheckSrc; heading: string; lead: string };
  /** Ratgeber slugs for the „Mehr dazu“ line, 1 to 3. */
  related: string[];
};

export const leistungGroups: { id: LeistungGroup; label: string }[] = [
  { id: "automatisieren", label: "Automatisieren" },
  { id: "befaehigen", label: "Befähigen" },
  { id: "betreiben", label: "Betreiben" },
];

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
  columns: [{ slug: LeistungSlug; title: string }, { slug: LeistungSlug; title: string }];
  rows: { label: string; cells: [string, string] }[];
  close: string;
};

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

const PRACTICE_BODY =
  "Ich arbeite selbst jeden Tag mit Claude: für Code, Texte, Recherche und meine eigenen Automatisierungen. In meinen früheren Positionen und bei Kunden habe ich Claude eingeführt und in bestehende Abläufe eingebunden. Was du bekommst, habe ich selbst im Einsatz.";

export const leistungenPages: LeistungPage[] = [
  {
    slug: "prozessautomatisierung",
    group: "automatisieren",
    navLabel: "Prozessautomatisierung",
    title: "Prozessautomatisierung",
    subline:
      "Was in deinem Betrieb jeden Tag gleich abläuft, läuft ab jetzt von allein.",
    metaDescription:
      "Prozessautomatisierung für Betriebe und Unternehmen: Anfragen, Termine, Angebote, Rechnungen und Dateneingabe laufen von selbst. Maßgeschneidert und dokumentiert.",
    kurz: "Wiederkehrende Abläufe wie Anfragen, Termine, Rechnungen und Dateneingabe laufen von selbst.",
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
    proof: {
      kind: "case",
      heading: "Aus der Praxis",
      body: "Eine Marketingagentur steuert ihre Projekte mit einer Prozess-Engine, die ich gebaut habe: Jede Projektphase legt ihre Aufgaben, Fristen und Zuständigkeiten selbst an. Niemand muss mehr nachhalten, welcher Schritt als Nächstes kommt.",
      objection:
        "Deine Leute behalten ihre Arbeit. Das System nimmt ihnen das Abtippen ab, damit sie Zeit für die Aufgaben haben, für die du sie eingestellt hast.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Du tippst jede Anfrage ab, leitest sie weiter und hakst von Hand nach.",
      steps: [
        "Eine Anfrage kommt per Formular oder E-Mail rein.",
        "Das System legt den Kontakt an, bestätigt den Eingang und informiert den Zuständigen.",
        "Bleibt die Anfrage liegen, kommt nach zwei Tagen eine Erinnerung.",
      ],
      after: "Jede Anfrage liegt sofort beim Zuständigen. Du tippst nichts mehr doppelt.",
    },
    vergleich: true,
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungProzessautomatisierung,
      heading: "Welche Aufgabe kostet dich am meisten?",
      lead: "Der Prozess-Check zeigt dir in drei Minuten, wo deine Stunden hingehen und womit du anfängst.",
    },
    related: ["was-ist-prozessautomatisierung", "taeglich-stunden-zurueckgewinnen", "aus-jeder-anfrage-ein-termin"],
  },
  {
    slug: "ki-automatisierung",
    group: "automatisieren",
    navLabel: "KI-Automatisierung & Assistenten",
    title: "KI-Automatisierung & Assistenten",
    subline:
      "Die KI liest Belege, sortiert E-Mails und nimmt Aufgaben per Sprachnachricht an.",
    metaDescription:
      "KI-Automatisierung und KI-Assistenten: Rechnungen und Dokumente auslesen, E-Mails vorsortieren, Aufgaben per Sprachnachricht erledigen. Auf Wunsch innerhalb der EU.",
    kurz: "Die KI liest Belege, sortiert E-Mails und erledigt als Assistent Aufgaben per Sprachnachricht.",
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
    proof: {
      kind: "studies",
      heading: "Was die Zahlen sagen",
      figures: kiStudien,
      caseLine:
        "Aus der Praxis: Ein Hausmeisterservice gibt seinem Assistenten Aufgaben per Sprachnachricht, von Terminen über E-Mails bis zu Notizen. Der Assistent bereitet vor, der Inhaber gibt frei.",
      objection: "Die KI liest und sortiert, entscheiden tust du. Was sie vorbereitet, gibst du frei, bevor es rausgeht.",
    },
    example: {
      heading: "So sieht das aus",
      video: { src: "/video/ki-assistent.mp4", poster: "/video/ki-assistent.webp" },
    },
    vergleich: true,
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungKiAutomatisierung,
      heading: "Wo würde dir eine KI am meisten abnehmen?",
      lead: "Der Prozess-Check zeigt dir in drei Minuten, welche Aufgaben bei dir die meiste Zeit kosten. Danach reden wir, wenn du willst.",
    },
    related: ["was-ist-ein-ki-agent", "was-ki-im-betrieb-wirklich-kann", "unterlagen-einsammeln-ohne-nachfassen"],
  },
  {
    slug: "ki-server",
    group: "automatisieren",
    navLabel: "KI-Server",
    title: "KI-Server",
    subline:
      "KI für sensible Daten: auf deinem eigenen Server, gerechnet innerhalb der EU.",
    metaDescription:
      "KI-Server für sensible Daten: eigener Server auf deinen Namen, KI-Modelle innerhalb der EU, kein Training mit deinen Daten. Eingerichtet und dokumentiert.",
    kurz: "KI für sensible Daten: auf einem Server, der dir gehört, mit Modellen innerhalb der EU.",
    heroImage: "/images/bg-karst-quelle.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Kundendaten im fremden Chatfenster",
        "Unklar, wo deine Daten landen",
        "Mitarbeiter mit privaten KI-Konten",
        "Abhängig vom Dienstleister",
      ],
      close: "Mit dem richtigen Aufbau nutzt du KI und deine Daten bleiben bei dir.",
    },
    proof: {
      kind: "case",
      heading: "So setze ich das auf",
      body: "Jeder KI-Server läuft in einem Konto auf deinen Namen: Du zahlst ihn direkt und besitzt die Daten vom ersten Tag an. Das KI-Modell rechnet innerhalb der EU, der Anbieter speichert deine Anfragen nicht und trainiert nicht damit. Das Betriebssystem aktualisiert sich selbst, die Software läuft auf geprüften Versionen.",
      objection:
        "Ich richte ihn ein, sichere ihn ab und dokumentiere alles. Endet unsere Zusammenarbeit, läuft er sicher weiter.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Du prüfst sensible Dokumente von Hand, weil sie in keine fremde KI dürfen.",
      steps: [
        "Ein Kunde lädt seine Unterlagen über eine Seite hoch, die zu deinem Betrieb gehört.",
        "Die KI auf deinem Server prüft, ob alles vollständig und lesbar ist.",
        "Die Unterlagen liegen sortiert in deinem Ordner, Fehlendes wird beim Kunden nachgefragt.",
      ],
      after: "Die KI prüft für dich. Die Daten bleiben bei dir, innerhalb der EU.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiServer,
      heading: "Lass uns über deine Daten reden.",
      lead: "Im Erstgespräch klären wir, welche Daten du verarbeiten willst und welcher Aufbau dafür passt.",
    },
    related: ["was-ist-ein-ki-server", "wo-laeuft-deine-ki", "selbst-bauen-oder-bauen-lassen"],
  },
  {
    slug: "claude",
    group: "befaehigen",
    navLabel: "Claude für Unternehmen",
    title: "Claude für Unternehmen",
    subline:
      "Claude, der KI-Assistent von Anthropic, eingerichtet für dein Team und eure Daten.",
    metaDescription:
      "Claude für Unternehmen einrichten: Team-Zugang, Projekte mit eurem Firmenwissen, eigene Vorlagen, Anbindung an eure Werkzeuge und klare Regeln für eure Daten.",
    kurz: "Claude für dein Team eingerichtet, mit euren Vorlagen, eurem Wissen und klaren Datenregeln.",
    heroImage: "/images/bg-abendwellen.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Jeder nutzt KI anders",
        "Claude kennt euren Betrieb nicht",
        "Dieselben Erklärungen, jeden Tag",
        "Keine Regel für eure Daten",
      ],
      close: "Das Werkzeug habt ihr. Es fehlt die Einrichtung für euren Betrieb.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: PRACTICE_BODY,
      points: [
        { title: "Selbst im Einsatz.", body: "Mein eigener Betrieb läuft mit Claude: Texte, Recherche, Code und die Automatisierungen, die ich bei mir nutze." },
        { title: "Ein Ansprechpartner.", body: "Du redest mit dem, der einrichtet. Kein Team, keine Tickets." },
        { title: "Mein zweites Gehirn.", body: "Claude ist in meinen Betrieb eingebunden und kennt Kunden, Entscheidungen und Abläufe. Je mehr ich damit arbeite, desto besser wird jeder Schritt." },
      ],
      objection:
        "Dein Team lernt dafür keine Technik. Es arbeitet mit Claude wie mit einem Kollegen, die Einrichtung übernehme ich.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Jedes Angebot beginnt mit einer leeren Seite.",
      steps: [
        "Ich lege ein Claude-Projekt mit euren Leistungen, Preisen und Musterangeboten an.",
        "Dein Mitarbeiter beschreibt in zwei Sätzen, was der Kunde braucht.",
        "Claude schreibt den Entwurf in eurem Ton, dein Mitarbeiter prüft und schickt ihn ab.",
      ],
      after: "Jedes Angebot beginnt mit einem guten Entwurf in eurem Ton.",
    },
    note: {
      heading: "Zum Ausprobieren",
      body: "Wie ich Claude selbst nutze, kannst du nachbauen: Ein Text legt in einem Ordner ein Gehirn für deinen Betrieb an. Kostenlos, ohne Anmeldung.",
      link: { label: "Zum Claude-Gehirn", href: "/claude-gehirn" },
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungClaude,
      heading: "Lass uns Claude bei euch einrichten.",
      lead: "Im Erstgespräch schauen wir, wofür ihr Claude nutzen wollt und was dafür eingerichtet werden muss.",
    },
    related: ["claude-oder-chatgpt", "claude-im-alltag-nutzen", "was-ki-im-betrieb-wirklich-kann"],
  },
  {
    slug: "ki-schulung",
    group: "befaehigen",
    navLabel: "KI-Schulung",
    title: "KI-Schulung",
    subline:
      "Dein Team lernt den KI-Assistenten Claude von Anthropic, an euren eigenen Aufgaben.",
    metaDescription:
      "KI-Schulung für Teams: Claude im Arbeitsalltag nutzen, eigene Vorlagen bauen, wiederkehrende Aufgaben automatisieren. Praxisnah an euren eigenen Abläufen.",
    kurz: "Dein Team lernt Claude und erste Automatisierungen an euren eigenen Aufgaben.",
    heroImage: "/images/fliessen.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Die Hälfte traut sich nicht",
        "Allgemeine Fragen, enttäuschende Antworten",
        "Unklar, welche Daten rein dürfen",
        "Kurse ohne Bezug zu eurer Arbeit",
      ],
      close: "KI hilft erst, wenn dein Team weiß, wo sie in die eigene Arbeit passt.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: PRACTICE_BODY,
      points: [
        { title: "An euren Aufgaben.", body: "Wir arbeiten mit euren echten Texten, Abläufen und Dokumenten. Was dein Team lernt, nutzt es am nächsten Tag." },
        { title: "Claude und Automatisierung.", body: "Zwei Themen, gründlich: Claude im Alltag und der Schritt zur ersten eigenen Automatisierung." },
        { title: "Format nach Absprache.", body: "Vor Ort oder online, für ein kleines Team oder eine Abteilung. Wir legen es im Gespräch fest." },
      ],
      objection:
        "Dein Team bleibt. Die KI nimmt ihm das Immergleiche ab und ihr entscheidet, wofür ihr die gewonnene Zeit nutzt.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Jeder fasst Kundengespräche von Hand zusammen und schreibt jede Nachfass-Mail selbst.",
      steps: [
        "Wir nehmen eine echte Aufgabe aus eurem Alltag.",
        "Dein Team baut sich dafür eine Vorlage in Claude, mit euren Regeln und eurem Ton.",
        "Ab dem nächsten Tag nutzt jeder diese Vorlage und ihr seht, welche Aufgabe als Nächstes dran ist.",
      ],
      after: "Dein Team arbeitet mit Vorlagen, die es in der Schulung selbst gebaut hat.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiSchulung,
      heading: "Lass uns eure Schulung planen.",
      lead: "Im Erstgespräch klären wir, wer teilnimmt, welche Aufgaben ihr mitbringt und welches Format passt.",
    },
    related: ["claude-im-alltag-nutzen", "claude-oder-chatgpt", "was-ki-im-betrieb-wirklich-kann"],
  },
  {
    slug: "ki-beratung",
    group: "befaehigen",
    navLabel: "KI-Beratung",
    title: "KI-Beratung",
    subline:
      "Kostenloses Erstgespräch: Wir finden heraus, wo KI dir Zeit spart.",
    metaDescription:
      "KI-Beratung für Unternehmen: Im kostenlosen Erstgespräch und Prozess-Audit finden wir heraus, wo KI und Automatisierung sich bei dir lohnen. Mit Fahrplan, wenn es passt.",
    kurz: "Kostenloses Erstgespräch: wo sich KI bei dir lohnt. Wenn ja, folgt ein Prozess-Audit mit Fahrplan.",
    heroImage: "/images/bg-horizont.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Alle sagen KI, keiner sagt wo",
        "Ausprobiert, nichts ist geblieben",
        "Agentur-Angebote, schwer zu prüfen",
        "Lohnt sich das für deine Größe?",
      ],
      close: "Im Gespräch klären wir, was sich bei dir lohnt und was nicht.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: "Ich arbeite selbst jeden Tag mit KI und baue die Automatisierungen, die ich empfehle. In meinen früheren Positionen und bei Kunden habe ich KI eingeführt und in bestehende Abläufe eingebunden. Ich empfehle dir nur, was ich selbst bauen und betreiben würde.",
      points: [
        { title: "Im Team erprobt.", body: "In meiner früheren Stelle habe ich mit KI gearbeitet und für unsere Programmierprojekte ein KI-Gehirn eingeführt. Das Team nutzt es bis heute." },
        { title: "Erst schauen, was du schon hast.", body: "Viele Programme können mehr, als genutzt wird. Bevor ich etwas baue, prüfe ich, ob dein Werkzeug es schon kann." },
        { title: "Der Fahrplan gehört dir.", body: "Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen." },
      ],
      objection:
        "Mit KI auskennen musst du dich nicht. Du erzählst mir, was dich Zeit kostet. Ich suche die passende Technik dazu.",
    },
    example: {
      heading: "So läuft die Beratung",
      before: "Viele Ideen, kein klarer erster Schritt.",
      steps: [
        "Im kostenlosen Erstgespräch erzählst du mir, was dich jeden Tag Zeit kostet.",
        "Lohnt es sich, schaue ich mir im Prozess-Audit deine Abläufe genauer an.",
        "Wenn sich etwas lohnt, bekommst du ein bis zwei Werktage später einen Fahrplan: was sich automatisieren lässt, was es bringt und in welcher Reihenfolge.",
      ],
      after: "Du weißt, womit du anfängst. Ob und mit wem du es umsetzt, entscheidest du selbst.",
    },
    note: {
      heading: "Prozess-Audit",
      body: "Lohnt sich nach dem Erstgespräch ein genauerer Blick, folgt der Prozess-Audit. Auch er kostet dich nichts.",
      link: { label: "Zum Prozess-Audit", href: "/leistungen/prozess-audit" },
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiBeratung,
      heading: "Lass uns herausfinden, wo es sich lohnt.",
      lead: "Das Erstgespräch dauert 30 Minuten und kostet nichts. Danach weißt du, ob sich ein genauerer Blick lohnt.",
    },
    related: ["selbst-bauen-oder-bauen-lassen", "was-ist-prozessautomatisierung", "was-ist-ein-ki-agent"],
  },
  {
    slug: "prozess-audit",
    group: "befaehigen",
    navLabel: "Prozess-Audit",
    title: "Prozess-Audit",
    subline:
      "Kostenlos: Wir finden die Aufgabe, die du zuerst loswerden solltest.",
    metaDescription:
      "Kostenloser Prozess-Audit für Betriebe und Unternehmen: Ich gehe deine Abläufe mit dir durch. Lohnt sich etwas, bekommst du einen Fahrplan, der dir gehört.",
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
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: "Im Audit schaue ich mir an, wie deine Arbeit heute läuft: wo du Daten von Hand überträgst und welche Aufgabe dich die meiste Zeit kostet. Ich empfehle dir nur, was ich selbst bauen und betreiben würde.",
      points: [
        { title: "Erst das, was du schon hast.", body: "Dein Programm kann oft mehr, als du nutzt. Kann es die Aufgabe schon, zeige ich dir die Einstellung. Dann brauchst du keinen Bau." },
        { title: "Du bereitest nichts vor.", body: "Ich bringe die Fragen mit. Du erzählst mir, wie dein Tag läuft." },
        { title: "Der Fahrplan gehört dir.", body: "Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen." },
      ],
      objection:
        "Lohnt sich bei dir gerade nichts, sage ich dir das im Gespräch. Dann schicke ich dir auch kein Angebot.",
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
    note: {
      heading: "Förderung",
      body: "Sitzt dein Betrieb in Bayern und hat weniger als 50 Mitarbeiter, kann der Digitalbonus Bayern einen Teil der Kosten übernehmen, oft bis zur Hälfte. Wichtig: Der Antrag muss gestellt sein, bevor du jemanden beauftragst. Ob er bei dir passt, klären wir im Gespräch.",
      link: { label: "Zum Förderprogramm", href: "https://www.digitalbonus.bayern/foerderprogramm/" },
    },
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungProzessAudit,
      heading: "Fang mit drei Minuten an.",
      lead: "Der Prozess-Check zeigt dir, wo deine Stunden hingehen. Deine Antworten nehme ich ins Gespräch mit.",
    },
    related: ["selbst-bauen-oder-bauen-lassen", "taeglich-stunden-zurueckgewinnen", "was-ist-prozessautomatisierung"],
  },
  {
    slug: "ki-betriebssystem",
    group: "betreiben",
    navLabel: "KI-Betriebssystem",
    title: "KI-Betriebssystem",
    subline:
      "Eine Stelle, an der alles über deinen Betrieb stimmt. Darauf arbeitet deine KI.",
    metaDescription:
      "KI-Betriebssystem: E-Mails, Kunden, Fristen und Belege landen mit Quelle an einer Stelle, in deinen eigenen Programmen. Darauf bauen KI und Automatisierungen auf.",
    kurz: "Alles über deinen Betrieb an einer Stelle, damit jede KI und jede Automatisierung darauf aufbaut.",
    heroImage: "/images/bg-bausteine-b.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Kundendaten in fünf Programmen",
        "Welche Liste stimmt eigentlich?",
        "Das Wissen steckt in einem Kopf",
        "Jede KI fängt bei null an",
      ],
      close: "Eine KI hilft erst, wenn alles über deinen Betrieb an einer Stelle stimmt.",
    },
    proof: {
      kind: "practice",
      heading: "So läuft das bei mir",
      body: "Bei mir fängt es beim Postfach an: Mein Assistent liest jede neue E-Mail, sortiert sie ein und trägt den Absender mit Quelle in mein System ein. Im Posteingang bleibt nur, was mich braucht.",
      points: [
        { title: "Erst erfassen.", body: "Ich nehme Informationen dort auf, wo sie ankommen. In den meisten Betrieben ist das das Postfach." },
        { title: "Jede Angabe mit Quelle.", body: "Was die KI einträgt, steht mit dem Satz aus der E-Mail drin. Bis ich bestätige, steht es als KI-Eintrag drin." },
        { title: "Die KI ist der kleinste Teil.", body: "Beim ersten Durchlauf durch 174 E-Mails haben feste Regeln und bekannte Kontakte 96 einsortiert, die KI 66. Acht blieben für mich zur Prüfung." },
      ],
      objection:
        "Deine Daten bleiben bei dir: in deinen Programmen, auf deinen Konten. Ich baue das System, es gehört dir.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Zu jeder Kundenanfrage suchst du die Vorgeschichte in Postfach, Excel und Notizen.",
      steps: [
        "Die E-Mail landet im richtigen Ordner, der Kunde mit Quelle in deinem System.",
        "Fristen, Aufgaben und Belege daraus stehen dort, wo du sie suchst.",
        "Du fragst deinen Assistenten „Was ist bei Huber offen?“ und er antwortet aus derselben Stelle.",
      ],
      after: "Alles über deinen Betrieb an einer Stelle. Jede neue Automatisierung baut darauf auf.",
    },
    note: {
      heading: "Zum Ausprobieren",
      body: "Die kleine Version kannst du selbst anlegen: Ein Text baut in Claude ein Gehirn für deinen Betrieb auf. Kostenlos, ohne Anmeldung.",
      link: { label: "Zum Claude-Gehirn", href: "/claude-gehirn" },
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiBetriebssystem,
      heading: "Wo fängt dein KI-Betriebssystem an?",
      lead: "Im Erstgespräch schauen wir, wo bei dir die meisten Informationen ankommen. Dort fangen wir an, mit einer Aufgabe.",
    },
    related: ["durcheinander-oder-saubere-quelle", "was-ki-im-betrieb-wirklich-kann", "was-ist-ein-ki-agent"],
  },
  {
    slug: "betreuung",
    group: "betreiben",
    navLabel: "Betreuung & Wartung",
    title: "Betreuung & Wartung",
    subline:
      "Ich halte deine Automatisierungen am Laufen. Du merkst nur, dass alles läuft.",
    metaDescription:
      "Betreuung und Wartung für Automatisierungen und KI-Systeme: Überwachung mit Alarm, Fehlerbehebung, kleine Änderungen. Monatlich kündbar, für Systeme, die ich gebaut habe.",
    kurz: "Überwachung mit echtem Alarm, Fehlerbehebung und kleine Änderungen, monatlich kündbar.",
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
    proof: {
      kind: "case",
      heading: "So betreue ich",
      body: "Ich warte deine Automatisierungen und halte sie aktuell. Mit meinem Monitoring-System greife ich ein, bevor aus einem Fehler ein Problem wird. Dazu gehört ein monatlicher Bericht. Nutzt dein System KI, bringe ich auch die KI-Modelle und Prompts auf den neuesten Stand.",
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
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungBetreuung,
      heading: "Erst bauen, dann betreuen.",
      lead: "Betreuung gibt es für Systeme, die ich gebaut habe. Der Prozess-Check zeigt dir, womit du anfängst.",
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
