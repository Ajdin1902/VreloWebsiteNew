// Public, price-free copy for the /makler outreach landing page – a focus-mode
// page sent by direct link to a scored lead (independent Makler and Finanz-/
// Versicherungsmakler). Sources of truth for the offers themselves (price,
// guarantee, rationale) live in HQ and must be changed there first:
//   ../../../Knowledge/Offers/Termin-Quelle.md
//   ../../../Knowledge/Strategy/Document_Concierge.md
// Rules: no prices, no invented numbers, no testimonials. German punctuation
// per Brand.md – „…“ (U+201E/U+201C) and the spaced en-dash „ – “ (U+2013).
// Guarded by makler.test.ts.

export type MaklerBullet = { title: string; body: string };
export type MaklerFlowStep = { title: string; body: string };

export type MaklerProduct = {
  eyebrow: string;
  name: string;
  promise: string;
  /** Deleted on /makler – the page shows, it does not explain. */
  body?: string;
  /** Short chips rendered as an arrow-separated mechanism row. */
  chips?: string[];
  /** Numbered flow cards (the Document Concierge's seven steps). */
  flow?: MaklerFlowStep[];
  /** Benefit headlines only; the explanatory bodies were cut. */
  solves?: string[];
  outcome?: string;
  /** The try-it-out invitation (Termin-Quelle → /demo). */
  proof?: { prompt: string; body: string; label: string; href: string };
  /** Set once the loop video exists; null renders the flow cards instead. */
  demoVideo: { slug: string; caption: string } | null;
  /** Honest note where a product is built-to-order rather than shippable software. */
  note?: string;
  trust?: { title: string; body: string };
};

export type MaklerPage = {
  /** The single CTA definition, shared by the header and the mid-page band.
      Shortened label for the narrow header – the full one wraps at 390px. */
  cta: { label: string; short: string; href: string; note: string };
  hero: { title: string; lead: string };
  problem: { title: string; intro: string; leaks: MaklerBullet[]; close: string };
  terminQuelle: MaklerProduct;
  midCta: { line: string };
  documentConcierge: MaklerProduct;
  voraussetzungen: { title: string; items: MaklerBullet[] };
  warumIch: { title: string; intro: string; points: string[] };
  garantie: {
    title: string;
    intro: string;
    promises: MaklerBullet[];
    close: string;
    founding: { title: string; body: string };
  };
  einwaende: { title: string; items: { question: string; answer: string }[] };
  close: {
    title: string;
    fallbackHint: string;
  };
};

export const makler: MaklerPage = {
  cta: {
    label: "Erstgespräch vereinbaren",
    short: "Erstgespräch",
    href: "#termin",
    note: "Kostenloses Erstgespräch – 30 Minuten, unverbindlich.",
  },

  hero: {
    title: "Jede Anfrage, die wartet, ist ein Termin weniger.",
    lead: "Zwei Systeme: eines macht aus jeder Anfrage einen Termin, eines sammelt die Unterlagen ein. Beide baue ich dir, beide laufen ohne dich.",
  },

  problem: {
    title: "An zwei Stellen läuft dir die Zeit weg",
    intro:
      "Beides kennst du. Beides kostet dich Geld, ohne dass es je auf einer Rechnung auftaucht.",
    leaks: [
      {
        title: "Die Anfrage, die kalt wird",
        body: "Eine Anfrage kommt abends um halb zehn herein. Du siehst sie am nächsten Morgen zwischen zwei Terminen. Bis du antwortest, hat der Interessent längst drei weitere Berater angeschrieben – und spricht mit dem, der zuerst zurückgemeldet hat. Die Anfrage war da. Der Abschluss nicht.",
      },
      {
        title: "Die Unterlagen, denen du hinterhertelefonierst",
        body: "Gehaltsabrechnung, Kontoauszüge, Steuerbescheid, SCHUFA, Ausweis. Du fragst einmal. Du fragst nach einer Woche noch einmal. Dann kommt das Foto vom Küchentisch, schief und halb abgeschnitten. Der Fall zieht sich um Wochen – nicht weil etwas schwierig wäre, sondern weil du Bote und Mahnung in einer Person bist.",
      },
    ],
    close: "Für beides gibt es bei mir ein System. Das erste ist der Anfang.",
  },

  terminQuelle: {
    eyebrow: "Schritt eins",
    name: "Die Termin-Quelle",
    promise: "Jede Anfrage bekommt sofort eine Antwort – und den Weg zum Termin, während du arbeitest.",
    chips: ["Antwort in unter 5 Minuten", "Qualifizieren", "Termin buchen", "Nachfassen", "Protokoll"],
    solves: [
      "Antwortet, wenn du schläfst",
      "Fragt nach, bevor du Zeit investierst",
      "Beendet das Termin-Pingpong",
      "Bleibt dran, ohne zu nerven",
    ],
    outcome:
      "Mehr Termine aus den Anfragen, die du ohnehin schon hast. Und ein ruhiger Kopf, weil keine mehr liegen bleibt.",
    proof: {
      prompt: "Glaub mir das nicht – probier es aus.",
      body: "Du beschreibst kurz dein Geschäft und schreibst dann als dein eigener Interessent – gegen eine Simulation, die zeigt, wie die Termin-Quelle antwortet. Zwei Minuten, kein Login, nichts wird gespeichert.",
      label: "Spiel deinen eigenen Kunden",
      href: "/demo",
    },
    demoVideo: null,
  },

  midCta: {
    line: "Klingt das nach deiner Woche?",
  },

  documentConcierge: {
    eyebrow: "Schritt zwei",
    name: "Der Document Concierge",
    promise: "Um die Unterlagen kümmert sich das System, nicht mehr du.",
    flow: [
      { title: "Fall anlegen", body: "20 Sekunden: Name, Kontakt, Art des Falls. Mehr machst du nicht." },
      { title: "Checkliste raus", body: "Dein Kunde bekommt sie auf seinem Kanal, mit einem sicheren Upload-Link." },
      { title: "Hochladen ohne Login", body: "Eine Seite, ein Tipp aufs Handy. Keine Registrierung, kein Passwort." },
      { title: "Sofort geprüft", body: "Falsches oder unlesbares Dokument? Geht freundlich zurück, bevor du es überhaupt siehst." },
      { title: "Ruhig nachgefasst", body: "Nur was noch fehlt, in ruhigem Abstand. Höflich und beharrlich." },
      { title: "Abgelegt bei dir", body: "Jede Datei benannt und sortiert in deinem eigenen Cloud-Ordner." },
      { title: "Eine Meldung an dich", body: "Alle sieben da – oder: es fehlt noch der Kontoauszug. Du musst nichts öffnen." },
    ],
    outcome:
      "Vollständige, geprüfte Akten in deiner eigenen Cloud – und kein einziges Telefonat, in dem du um eine Gehaltsabrechnung bittest.",
    trust: {
      title: "Wo die Unterlagen liegen",
      body: "Die Unterlagen deiner Kunden bleiben in deinen eigenen Konten. Das System läuft auf deinem eigenen Server, die Upload-Seite ebenso, und die Dateien landen in deiner eigenen Cloud – bei mir liegt keine einzige. Für die automatische Prüfung geht jede Seite einmal an einen KI-Dienst, der ebenfalls in deinem eigenen Konto läuft, Rechenzentrum in der EU; gespeichert wird dort nichts. Alles verschlüsselt übertragen, mit Auftragsverarbeitungsvertrag. Bei Gehaltsabrechnungen und SCHUFA-Auskünften ist das keine Formalie, sondern die Grundbedingung.",
    },
    note: "Den Document Concierge baue ich für dich – nach deinen Fallarten, deinen Checklisten, deiner Cloud. Es gibt ihn nicht als fertige Software zum Anklicken. Deshalb siehst du hier den Ablauf; alles Weitere zeige ich dir im Gespräch.",
    demoVideo: null,
  },

  voraussetzungen: {
    title: "Was du dazu brauchst: fast nichts",
    items: [
      {
        title: "Deinen eigenen Server",
        body: "Ich richte ihn ein und baue alles darauf. Er läuft auf deinem eigenen Konto – rund 30 € im Monat, und er gehört dir. Deshalb liegen deine Daten auch bei dir und nicht bei mir.",
      },
      {
        title: "Wartung nur, wenn du willst",
        body: "Monatlich kündbar. Kündigst du, läuft alles weiter – du verlierst nur meine Aufmerksamkeit und die laufenden Verbesserungen, nie die Sicherheit.",
      },
    ],
  },

  warumIch: {
    title: "Warum ich",
    intro:
      "Zwei Systeme, ein Verantwortlicher. Was das im Alltag für dich bedeutet:",
    points: [
      "Ein Ansprechpartner",
      "Maßgeschneidert, nicht von der Stange",
      "Klartext statt Technik-Deutsch",
      "Du lernst und wartest nichts",
    ],
  },

  garantie: {
    title: "Ich gehe in Vorleistung, nicht du.",
    intro:
      "Du zahlst die Schlussrechnung erst, wenn das System bei dir sauber läuft. Die Absicherung sitzt an drei Stellen:",
    promises: [
      {
        title: "Du zahlst die Schlussrechnung erst nach deiner eigenen Abnahme.",
        body: "Das System muss in deinem Test sauber laufen: jede Testanfrage beantwortet, qualifiziert, als Termin gebucht. Läuft es nicht wie zugesagt, baue ich nach.",
      },
      {
        title: "Jede Anfrage bekommt in unter fünf Minuten eine Antwort.",
        body: "Rund um die Uhr. Das ist die Zahl, an der du mich messen kannst – hält dein System sie nicht ein, baue ich nach. Nicht zugesagt ist dein Anfrage-Volumen: das bestimmt dein Markt, nicht ich.",
      },
      {
        title: "Der erste Monat Betrieb geht auf mich.",
        body: "Überzeugt dich das System im ersten Monat laufenden Betriebs nicht, kündigst du und bekommst diesen Monat erstattet.",
      },
    ],
    close:
      "Ich sichere zu, was ich in der Hand habe: Funktion, Reaktionszeit, sauberer Betrieb.",
    founding: {
      title: "Meine ersten drei Kunden",
      body: "Für meine ersten drei Kunden gebe ich eine zusätzliche Zusage: Hält die Termin-Quelle die Fünf-Minuten-Antwort in einem Monat einmal nicht ein, ist dieser Monat für dich kostenlos. Ich sage das einmal, ohne Countdown – es ist schlicht der Stand.",
    },
  },

  einwaende: {
    title: "Was du dich jetzt fragst",
    items: [
      {
        question: "Ich habe doch schon ein Kontaktformular und einen Kalender-Link.",
        answer:
          "Das Formular sammelt eine Anfrage – reagieren, qualifizieren und nachfassen musst du weiter selbst, und zwar rechtzeitig. Genau da geht das Geld verloren: Die meisten Anfragen kommen abends oder am Wochenende, und bis du am Schreibtisch bist, ist der Interessent oft schon woanders. Der Kalender-Link hilft nur dem, der ohnehin buchen will. Die Termin-Quelle schließt die Lücke dazwischen.",
      },
      {
        question: "Ich bin kein Technik-Mensch.",
        answer:
          "Du lernst und wartest nichts. Ich baue und betreibe alles; du bekommst die fertigen Termine und die vollständigen Akten. Wenn du eine Änderung willst, schreibst du mir einen Satz.",
      },
      {
        question: "Meine Anfragen sind zu individuell für einen Bot.",
        answer:
          "Das System ersetzt dich nicht. Es nimmt den immer gleichen ersten Schritt ab und reicht dir den qualifizierten Termin. Die Beratung und den Abschluss machst weiter du.",
      },
      {
        question: "Was ist mit den Daten meiner Kunden?",
        answer:
          "Deine Kundendaten liegen auf Servern in der EU, verschlüsselt übertragen und mit Auftragsverarbeitungsvertrag. Beim Document Concierge läuft das System auf deinem eigenen Server und die Dokumente landen in deiner eigenen Cloud – bei mir liegt keine einzige Datei. Welche Dienste dabei beteiligt sind, zeige ich dir vorher vollständig.",
      },
    ],
  },

  close: {
    title: "Lass uns 30 Minuten sprechen",
    fallbackHint: "Schreib mir so lange einfach über das Kontaktformular.",
  },
};
