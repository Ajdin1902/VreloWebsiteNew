// src/lib/leistungenPages.ts
//
// The seven Leistungen subpages (spec 2026-10-01). Every German string for
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
  /** One plain sentence that defines the service; shown as the hero lead. */
  subline: string;
  metaDescription: string;
  /** One sentence for the hub card. */
  kurz: string;
  heroImage: string;
  pain: { heading: string; moments: string[]; close: string };
  proof: Proof;
  example: {
    heading: string;
    before: string;
    steps: [string, string, string];
    after: string;
    video?: { src: string; poster: string; caption: string };
  };
  /** Renders the existing ProzessAudit card after the example (KI-Beratung only). */
  auditCard?: boolean;
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
    claim: "pro Woche spart, wer KI im Beruf nutzt, im Mittel. Das sind rund 7,7 % der Arbeitszeit, gemessen in elf Ländern des Euroraums.",
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

const PRACTICE_BODY =
  "Ich arbeite selbst jeden Tag mit Claude: für Code, Texte, Recherche und meine eigenen Automatisierungen. In meinen früheren Positionen und bei Kunden habe ich Claude eingeführt und in bestehende Abläufe eingebunden. Was du bekommst, habe ich selbst im Einsatz.";

export const leistungenPages: LeistungPage[] = [
  {
    slug: "prozessautomatisierung",
    group: "automatisieren",
    navLabel: "Prozessautomatisierung",
    title: "Prozessautomatisierung",
    subline:
      "Alles, was in deinem Betrieb jeden Tag gleich abläuft, baue ich so, dass es von allein läuft. Du machst die Arbeit, die dein Urteil braucht.",
    metaDescription:
      "Prozessautomatisierung für Betriebe und Unternehmen: Anfragen, Termine, Angebote, Rechnungen und Dateneingabe laufen von selbst. Maßgeschneidert und dokumentiert.",
    kurz: "Wiederkehrende Abläufe wie Anfragen, Termine, Rechnungen und Dateneingabe laufen von selbst.",
    heroImage: "/images/bg-steps.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Eine Anfrage kommt per E-Mail, jemand tippt sie ab und leitet sie weiter.",
        "Dieselben Kundendaten stehen in drei Programmen, und keins ist aktuell.",
        "Rechnungen gehen raus, aber das Nachfassen bleibt liegen.",
        "Aufgaben leben auf Zetteln und in Köpfen statt an einem Ort.",
      ],
      close: "Jeder Handgriff dauert ein paar Minuten. Zusammen kosten sie dich Stunden pro Woche.",
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
      before: "Vorher: Jede Anfrage wird von Hand abgetippt, weitergeleitet und nachverfolgt.",
      steps: [
        "Eine Anfrage kommt per Formular oder E-Mail rein.",
        "Das System legt den Kontakt an, bestätigt den Eingang und informiert den Zuständigen.",
        "Bleibt die Anfrage liegen, kommt nach zwei Tagen eine Erinnerung.",
      ],
      after: "Nachher: Anfragen landen sofort beim Zuständigen, und du tippst nichts mehr doppelt.",
    },
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungProzessautomatisierung,
      heading: "Welche Aufgabe kostet dich am meisten?",
      lead: "Der Prozess-Check zeigt dir in drei Minuten, wo deine Stunden hingehen und womit du anfängst.",
    },
    related: ["taeglich-stunden-zurueckgewinnen", "aus-jeder-anfrage-ein-termin", "durcheinander-oder-saubere-quelle"],
  },
  {
    slug: "ki-automatisierung",
    group: "automatisieren",
    navLabel: "KI-Automatisierung & Assistenten",
    title: "KI-Automatisierung & Assistenten",
    subline:
      "Belege lesen, E-Mails vorsortieren, Antworten vorbereiten: Das übernimmt die KI für dich. Dazu ein Assistent, dem du unterwegs per Sprachnachricht Aufgaben gibst.",
    metaDescription:
      "KI-Automatisierung und KI-Assistenten: Rechnungen und Dokumente auslesen, E-Mails vorsortieren, Aufgaben per Sprachnachricht erledigen. Auf Wunsch innerhalb der EU.",
    kurz: "Die KI liest Belege, sortiert E-Mails und erledigt als Assistent Aufgaben per Sprachnachricht.",
    heroImage: "/images/bg-lichtschacht.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Rechnungen kommen als PDF, und jemand überträgt Lieferant, Betrag und Datum von Hand.",
        "Das Postfach ist voll, und das Wichtige steckt irgendwo zwischen Newslettern.",
        "Unterwegs fällt dir eine Aufgabe ein, und abends weißt du nicht mehr, welche.",
        "Unterlagen von Kunden kommen unvollständig, und das Nachfragen dauert Tage.",
      ],
      close: "Diese Arbeit braucht Aufmerksamkeit, aber kein Urteil. Solche Arbeit übernimmt eine KI zuverlässig.",
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
      before: "Vorher: Jede Eingangsrechnung wird geöffnet, gelesen und von Hand übertragen.",
      steps: [
        "Die Rechnung kommt per E-Mail.",
        "Die KI liest Lieferant, Betrag, Datum und Rechnungsnummer aus.",
        "Die Daten liegen in deiner Buchhaltung, das PDF im richtigen Ordner.",
      ],
      after: "Nachher: Du schaust nur noch auf das, was die KI als unklar markiert hat.",
      video: {
        src: "/video/ki-assistent.mp4",
        poster: "/video/ki-assistent.webp",
        caption: "Ein echter Lauf mit Testdaten: Der Assistent bekommt eine kurze Nachricht und legt Termin, Aufgabe und Rechnung an.",
      },
    },
    cta: {
      kind: "check",
      src: CHECK_SRC.leistungKiAutomatisierung,
      heading: "Wo würde dir eine KI am meisten abnehmen?",
      lead: "Der Prozess-Check zeigt dir in drei Minuten, welche Aufgaben bei dir die meiste Zeit kosten. Danach reden wir, wenn du willst.",
    },
    related: ["was-ki-im-betrieb-wirklich-kann", "unterlagen-einsammeln-ohne-nachfassen", "claude-im-alltag-nutzen"],
  },
  {
    slug: "ki-server",
    group: "automatisieren",
    navLabel: "KI-Server",
    title: "KI-Server",
    subline:
      "KI für sensible Daten: auf einem Server, der dir gehört, mit einem KI-Modell, das innerhalb der EU rechnet.",
    metaDescription:
      "KI-Server für sensible Daten: eigener Server auf deinen Namen, KI-Modelle innerhalb der EU, kein Training mit deinen Daten. Eingerichtet und dokumentiert.",
    kurz: "KI für sensible Daten: auf einem Server, der dir gehört, mit Modellen innerhalb der EU.",
    heroImage: "/images/bg-karst-quelle.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Du würdest KI gern nutzen, aber Kundendaten gehören nicht in ein beliebiges Chatfenster.",
        "Niemand kann dir sagen, wo deine Daten verarbeitet werden.",
        "Deine Mitarbeiter nutzen längst private KI-Konten, und keiner weiß, was dort landet.",
        "Ein Dienstleister würde alles bei sich betreiben, und du wärst von ihm abhängig.",
      ],
      close: "Mit dem richtigen Aufbau nutzt du KI und behältst deine Daten trotzdem bei dir.",
    },
    proof: {
      kind: "case",
      heading: "So setze ich das auf",
      body: "Jeder KI-Server läuft in einem Konto auf deinen Namen: Du zahlst ihn direkt und besitzt die Daten vom ersten Tag an. Das KI-Modell rechnet innerhalb der EU, der Anbieter speichert deine Anfragen nicht und trainiert nicht damit. Das Betriebssystem aktualisiert sich selbst, die Software läuft auf geprüften Versionen.",
      objection:
        "Den Server musst du nicht verstehen. Ich richte ihn ein, sichere ihn ab und dokumentiere alles. Endet unsere Zusammenarbeit, läuft er sicher weiter.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Sensible Dokumente werden von Hand geprüft, weil sie in keine fremde KI dürfen.",
      steps: [
        "Ein Kunde lädt seine Unterlagen über eine Seite hoch, die zu deinem Betrieb gehört.",
        "Die KI auf deinem Server prüft, ob alles vollständig und lesbar ist.",
        "Die Unterlagen liegen sortiert in deinem Ordner, Fehlendes wird beim Kunden nachgefragt.",
      ],
      after: "Nachher: Die KI arbeitet für dich, und die Daten bleiben bei dir und innerhalb der EU.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiServer,
      heading: "Lass uns über deine Daten reden.",
      lead: "Im Erstgespräch klären wir, welche Daten du verarbeiten willst und welcher Aufbau dafür passt.",
    },
    related: ["wo-laeuft-deine-ki", "selbst-bauen-oder-bauen-lassen"],
  },
  {
    slug: "claude",
    group: "befaehigen",
    navLabel: "Claude für Unternehmen",
    title: "Claude für Unternehmen",
    subline:
      "Claude ist der KI-Assistent von Anthropic. Ich richte ihn für dein Team ein, mit euren Vorlagen, eurem Wissen und klaren Regeln für eure Daten, damit er vom ersten Tag an eure Arbeit kennt.",
    metaDescription:
      "Claude für Unternehmen einrichten: Team-Zugang, Projekte mit eurem Firmenwissen, eigene Vorlagen, Anbindung an eure Werkzeuge und klare Regeln für eure Daten.",
    kurz: "Claude für dein Team eingerichtet, mit euren Vorlagen, eurem Wissen und klaren Datenregeln.",
    heroImage: "/images/bg-abendwellen.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Jeder im Team nutzt KI anders, und keiner weiß, was die anderen tun.",
        "Claude gibt allgemeine Antworten, weil er nichts über euren Betrieb weiß.",
        "Dieselben Texte, Angebote und Zusammenfassungen werden jeden Tag neu erklärt.",
        "Niemand hat festgelegt, welche Daten in die KI dürfen und welche nicht.",
      ],
      close: "Das Werkzeug habt ihr schon. Euch fehlt die Einrichtung, die es auf euren Betrieb zuschneidet.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: PRACTICE_BODY,
      points: [
        { title: "Selbst im Einsatz.", body: "Mein eigener Betrieb läuft mit Claude: Texte, Recherche, Code und die Automatisierungen, die ich für Kunden baue." },
        { title: "Ein Ansprechpartner.", body: "Du redest mit dem, der einrichtet. Kein Team, keine Tickets." },
        { title: "Ehrlich, wenn es nicht passt.", body: "Passt ChatGPT oder ein anderes Werkzeug besser zu euch, sage ich dir das." },
      ],
      objection:
        "Dein Team lernt dafür keine Technik. Es arbeitet mit Claude wie mit einem Kollegen, die Einrichtung übernehme ich.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Jeder schreibt seine Angebote selbst und fängt jedes Mal bei null an.",
      steps: [
        "Ich lege ein Claude-Projekt mit euren Leistungen, Preisen und Musterangeboten an.",
        "Dein Mitarbeiter beschreibt in zwei Sätzen, was der Kunde braucht.",
        "Claude schreibt den Entwurf in eurem Ton, dein Mitarbeiter prüft und schickt ihn ab.",
      ],
      after: "Nachher: Jeder fängt bei einem guten Entwurf an statt bei einer leeren Seite.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungClaude,
      heading: "Lass uns Claude bei euch einrichten.",
      lead: "Im Erstgespräch schauen wir, wofür ihr Claude nutzen wollt und was dafür eingerichtet werden muss.",
    },
    related: ["claude-im-alltag-nutzen", "was-ki-im-betrieb-wirklich-kann"],
  },
  {
    slug: "ki-schulung",
    group: "befaehigen",
    navLabel: "KI-Schulung",
    title: "KI-Schulung",
    subline:
      "Dein Team lernt, Claude und einfache Automatisierungen im Arbeitsalltag sicher zu nutzen. An euren eigenen Aufgaben, nicht an Beispielen aus dem Lehrbuch.",
    metaDescription:
      "KI-Schulung für Teams: Claude im Arbeitsalltag nutzen, eigene Vorlagen bauen, wiederkehrende Aufgaben automatisieren. Praxisnah an euren eigenen Abläufen.",
    kurz: "Dein Team lernt Claude und erste Automatisierungen an euren eigenen Aufgaben.",
    heroImage: "/images/fliessen.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Die Hälfte des Teams probiert KI aus, die andere Hälfte traut sich nicht.",
        "Wer es nutzt, tippt eine Frage ein und ist von der allgemeinen Antwort enttäuscht.",
        "Niemand weiß, welche Daten in die KI dürfen.",
        "Online-Kurse erklären Werkzeuge, aber nicht eure Arbeit.",
      ],
      close: "KI bringt erst etwas, wenn dein Team weiß, wie sie zu den eigenen Aufgaben passt.",
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
        "Dein Team bleibt. Die KI nimmt ihm das Immergleiche ab, und ihr entscheidet, wofür ihr die gewonnene Zeit nutzt.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Jeder fasst Kundengespräche von Hand zusammen und schreibt die Nachfass-Mail selbst.",
      steps: [
        "Wir nehmen eine echte Aufgabe aus eurem Alltag.",
        "Dein Team baut sich dafür eine Vorlage in Claude, mit euren Regeln und eurem Ton.",
        "Ab dem nächsten Tag nutzt jeder diese Vorlage, und ihr seht, welche Aufgabe als Nächstes dran ist.",
      ],
      after: "Nachher: Dein Team geht mit Werkzeugen aus der Schulung, die es selbst gebaut hat.",
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiSchulung,
      heading: "Lass uns eure Schulung planen.",
      lead: "Im Erstgespräch klären wir, wer teilnimmt, welche Aufgaben ihr mitbringt und welches Format passt.",
    },
    related: ["claude-im-alltag-nutzen", "was-ki-im-betrieb-wirklich-kann"],
  },
  {
    slug: "ki-beratung",
    group: "befaehigen",
    navLabel: "KI-Beratung",
    title: "KI-Beratung",
    subline:
      "Du musst nicht wissen, was mit KI möglich ist. Das ist mein Job. Du weißt, was dich jeden Tag Zeit kostet, und das reicht für den Anfang.",
    metaDescription:
      "KI-Beratung für Unternehmen: Im kostenlosen Erstgespräch und Prozess-Audit finden wir heraus, wo KI und Automatisierung sich bei dir lohnen. Mit Fahrplan, wenn es passt.",
    kurz: "Kostenloses Erstgespräch und Prozess-Audit: wo sich KI bei dir lohnt, mit Fahrplan.",
    heroImage: "/images/bg-horizont.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Überall heißt es, man müsse jetzt KI einsetzen, aber nicht, wo.",
        "Du hast ein paar Werkzeuge ausprobiert, und nichts ist geblieben.",
        "Angebote von Agenturen klingen groß, teuer und schwer zu prüfen.",
        "Du weißt nicht, ob sich das für einen Betrieb deiner Größe überhaupt rechnet.",
      ],
      close: "Im Gespräch klären wir, wo KI dir Zeit spart und wo sie dir nichts bringt.",
    },
    proof: {
      kind: "practice",
      heading: "Warum ich",
      body: "Ich arbeite selbst jeden Tag mit KI und baue die Automatisierungen, die ich empfehle. In meinen früheren Positionen und bei Kunden habe ich KI eingeführt und in bestehende Abläufe eingebunden. Ich empfehle dir nur, was ich selbst bauen und betreiben würde.",
      points: [
        { title: "Ehrlich, wenn es sich nicht rechnet.", body: "Lohnt sich eine Automatisierung bei dir nicht, sage ich dir das. Auch wenn das heißt, dass ich nichts baue." },
        { title: "Erst schauen, was du schon hast.", body: "Viele Programme können mehr, als genutzt wird. Bevor ich etwas baue, prüfe ich, ob dein Werkzeug es schon kann." },
        { title: "Der Fahrplan gehört dir.", body: "Du kannst ihn selbst umsetzen, umsetzen lassen oder mit mir bauen." },
      ],
      objection:
        "Mit KI auskennen musst du dich nicht. Du erzählst mir, was dich Zeit kostet, und ich suche die passende Technik.",
    },
    example: {
      heading: "So läuft die Beratung",
      before: "Vorher: Viele Ideen, kein klarer erster Schritt.",
      steps: [
        "Im kostenlosen Erstgespräch erzählst du mir, was dich jeden Tag Zeit kostet.",
        "Lohnt es sich, schaue ich mir im Prozess-Audit deine Abläufe genauer an.",
        "Ein bis zwei Werktage später bekommst du einen Fahrplan: was sich automatisieren lässt, was es bringt und in welcher Reihenfolge.",
      ],
      after: "Nachher: Du weißt, womit du anfängst, und entscheidest selbst, ob und mit wem du es umsetzt.",
    },
    auditCard: true,
    note: {
      heading: "Förderung",
      body: "Sitzt dein Betrieb in Bayern und hat weniger als 50 Mitarbeiter, kann der Digitalbonus Bayern einen Teil der Kosten übernehmen, oft bis zur Hälfte. Wichtig: Der Antrag muss gestellt sein, bevor du jemanden beauftragst. Ob er bei dir passt, klären wir im Gespräch.",
      link: { label: "Zum Förderprogramm", href: "https://www.digitalbonus.bayern/foerderprogramm/" },
    },
    cta: {
      kind: "kontakt",
      src: CHECK_SRC.leistungKiBeratung,
      heading: "Lass uns herausfinden, wo es sich lohnt.",
      lead: "Das Erstgespräch dauert 30 Minuten und kostet nichts. Danach weißt du, ob sich ein genauerer Blick lohnt.",
    },
    related: ["selbst-bauen-oder-bauen-lassen", "durcheinander-oder-saubere-quelle"],
  },
  {
    slug: "betreuung",
    group: "betreiben",
    navLabel: "Betreuung & Wartung",
    title: "Betreuung & Wartung",
    subline:
      "Ich überwache deine Automatisierungen, behebe Fehler und passe sie an, wenn sich dein Betrieb verändert. Du merkst davon vor allem, dass alles läuft.",
    metaDescription:
      "Betreuung und Wartung für Automatisierungen und KI-Systeme: Überwachung mit Alarm, Fehlerbehebung, kleine Änderungen. Monatlich kündbar, für Systeme, die ich gebaut habe.",
    kurz: "Überwachung mit echtem Alarm, Fehlerbehebung und kleine Änderungen, monatlich kündbar.",
    heroImage: "/images/bg-werkzeuge.webp",
    pain: {
      heading: "Kennst du das?",
      moments: [
        "Eine Automatisierung bricht still ab, und es fällt erst Wochen später auf.",
        "Ein Programm ändert seine Schnittstelle, und niemand passt die Verbindung an.",
        "Du willst eine Kleinigkeit ändern, aber wer es gebaut hat, ist nicht mehr erreichbar.",
        "Der Server läuft, aber niemand weiß, ob er sicher ist.",
      ],
      close: "Eine Automatisierung spart dir Zeit, solange sie läuft. Jemand muss prüfen, dass sie läuft.",
    },
    proof: {
      kind: "case",
      heading: "So betreue ich",
      body: "Jedes System, das ich betreue, meldet sich, wenn etwas schiefgeht: Der Alarm kommt bei mir an, bevor es dir auffällt. Ich teste, dass dieser Alarm bei mir ankommt. Fehler behebe ich, kleine Änderungen sind enthalten, und einmal im Monat siehst du in einer Zeile, was dein System erledigt hat.",
      objection:
        "Die Betreuung ist monatlich kündbar. Kündigst du, läuft dein System sicher weiter, nur ohne Anpassungen.",
    },
    example: {
      heading: "So sieht das aus",
      before: "Vorher: Ein Fehler fällt auf, wenn sich ein Kunde beschwert.",
      steps: [
        "Eine Verbindung zu einem Programm bricht nachts ab.",
        "Der Alarm kommt bei mir an, und ich sehe, welcher Schritt fehlgeschlagen ist.",
        "Ich behebe den Fehler und lasse die liegengebliebenen Vorgänge nachlaufen.",
      ],
      after: "Nachher: Du erfährst davon im Monatsbericht, nicht von deinem Kunden.",
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
