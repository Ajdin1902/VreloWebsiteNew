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
  body: string;
  /** Short chips rendered as an arrow-separated mechanism row. */
  chips?: string[];
  /** Numbered flow cards (the Document Concierge's seven steps). */
  flow?: MaklerFlowStep[];
  solves?: MaklerBullet[];
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
  hero: {
    title: string;
    lead: string;
    cta: { label: string; href: string };
    ctaNote: string;
  };
  problem: { title: string; intro: string; leaks: MaklerBullet[]; close: string };
  terminQuelle: MaklerProduct;
  bridge: { title: string; body: string };
  documentConcierge: MaklerProduct;
  warumIch: { title: string; intro: string; points: MaklerBullet[] };
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
    body: string;
    fallbackHint: string;
    fallback: { prompt: string; label: string; href: string };
  };
};

export const makler: MaklerPage = {
  hero: {
    title: "Jede Anfrage, die wartet, ist ein Termin weniger.",
    lead: "Ich baue unabhängigen Maklern und Finanzberatern zwei Systeme: eines, das jede Anfrage in unter fünf Minuten beantwortet und in einen Termin verwandelt – und eines, das die Unterlagen deiner Kunden vollständig einsammelt, ohne dass du hinterhertelefonierst. Du lernst nichts, du wartest nichts, du bekommst das Ergebnis.",
    cta: { label: "Erstgespräch vereinbaren", href: "#termin" },
    ctaNote: "Kostenloses Erstgespräch – 30 Minuten, unverbindlich.",
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
    promise: "Aus jeder Anfrage wird ein Termin – von selbst, während du arbeitest.",
    body: "Jede Anfrage bekommt in unter fünf Minuten eine persönliche Antwort. Rund um die Uhr, auch nachts und am Wochenende. Das System stellt zwei, drei ruhige Rückfragen, bietet freie Zeiten aus deinem Kalender an, bucht den Termin und fasst nach, wenn jemand still bleibt. Gebaut auf deine Anfragequellen, deinen Ton, deinen Kalender – kein Baukasten von der Stange.",
    chips: ["Antwort in unter 5 Minuten", "Qualifizieren", "Termin buchen", "Nachfassen", "Protokoll"],
    solves: [
      {
        title: "Antwortet, wenn du schläfst",
        body: "Die meisten Anfragen kommen abends und am Wochenende. Genau dann ist die Termin-Quelle wach.",
      },
      {
        title: "Fragt nach, bevor du Zeit investierst",
        body: "Zwei bis drei Rückfragen klären die Eckdaten. Du gehst nur noch in Gespräche, die passen können.",
      },
      {
        title: "Beendet das Termin-Pingpong",
        body: "Der passende Termin landet direkt in deinem Kalender. Kein Hin und Her über fünf Mails.",
      },
      {
        title: "Bleibt dran, ohne zu nerven",
        body: "Meldet sich jemand nicht, fragt das System höflich nach. Die meisten Kontakte brauchen mehrere Anläufe – die übernimmt es für dich.",
      },
    ],
    outcome:
      "Mehr Termine aus den Anfragen, die du ohnehin schon hast. Und ein ruhiger Kopf, weil keine mehr liegen bleibt.",
    proof: {
      prompt: "Glaub mir das nicht – probier es aus.",
      body: "Du beschreibst kurz dein Geschäft und schreibst dem System dann als dein eigener Interessent. Zwei Minuten, kein Login, nichts wird gespeichert.",
      label: "Spiel deinen eigenen Kunden",
      href: "/demo",
    },
    demoVideo: null,
  },

  bridge: {
    title: "Der Termin steht. Und dann?",
    body: "Dann beginnt der Teil, der wirklich Wochen frisst: die Unterlagen. Dafür baue ich das zweite System.",
  },

  documentConcierge: {
    eyebrow: "Schritt zwei",
    name: "Der Document Concierge",
    promise: "Du fragst nie wieder nach einer Unterlage.",
    body: "Du legst einen Fall in einem 20-Sekunden-Formular an – Name, Kontakt, Art des Falls. Ab da übernimmt das System: Es schickt deinem Kunden eine ruhige Checkliste mit einem einzigen sicheren Upload-Link, prüft jede hochgeladene Datei darauf, ob sie plausibel das richtige und lesbare Dokument ist, und schickt offensichtlich falsche oder unscharfe Uploads freundlich zurück – bevor sie bei dir landen. Was fehlt, fragt es in ruhigem Abstand nach. Bleibt ein Kunde stecken, hört es auf und sagt dir Bescheid, statt ins Leere zu mahnen.",
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
      body: "Die Dokumente deiner Kunden landen in deiner eigenen Cloud, nicht bei mir. Mein System ist der Bote, nicht der Tresor: Eine Datei berührt meine Seite nur auf dem Weg zu dir und wird danach gelöscht. Gehostet in der EU, verschlüsselt übertragen, mit Auftragsverarbeitungsvertrag. Bei Gehaltsabrechnungen und SCHUFA-Auskünften ist das keine Formalie, sondern die Grundbedingung.",
    },
    note: "Den Document Concierge baue ich für dich – nach deinen Fallarten, deinen Checklisten, deiner Cloud. Es gibt ihn nicht als fertige Software zum Anklicken. Deshalb siehst du hier den Ablauf; alles Weitere zeige ich dir im Gespräch.",
    demoVideo: null,
  },

  warumIch: {
    title: "Warum ich",
    intro:
      "Zwei Systeme, ein Verantwortlicher. Was das im Alltag für dich bedeutet:",
    points: [
      {
        title: "Ein Ansprechpartner",
        body: "Du sprichst mit dem, der baut. Keine Agentur-Kette, kein Ticket-System, keine Übergabe an jemanden, den du nie kennengelernt hast.",
      },
      {
        title: "Maßgeschneidert, nicht von der Stange",
        body: "Ich baue auf deine Anfragequellen, deinen Ton, deinen Kalender, deine Fallarten. Ein Baukasten würde dich zwingen, dich anzupassen. Hier ist es umgekehrt.",
      },
      {
        title: "Klartext statt Technik-Deutsch",
        body: "Ich erkläre dir, was das System tut, in Sätzen, die du deinem Steuerberater weitererzählen könntest.",
      },
      {
        title: "Du lernst und wartest nichts",
        body: "Kein neues Werkzeug auf deinem Schreibtisch. Das System läuft im Hintergrund, ich halte es am Laufen. Du bekommst Termine und vollständige Akten.",
      },
    ],
  },

  garantie: {
    title: "Ich gehe in Vorleistung, nicht du.",
    intro: "Du zahlst nicht im Voraus für etwas, das noch nicht läuft. Die Absicherung sitzt an drei Stellen:",
    promises: [
      {
        title: "Du zahlst die Schlussrechnung erst nach deiner eigenen Abnahme.",
        body: "Das System muss in deinem Test sauber laufen: jede Testanfrage beantwortet, qualifiziert, als Termin gebucht. Läuft es nicht wie zugesagt, baue ich nach.",
      },
      {
        title: "Jede Anfrage bekommt in unter fünf Minuten eine Antwort.",
        body: "Rund um die Uhr. Darauf gebe ich mein Wort. Nicht auf dein Anfrage-Volumen – das bestimmt dein Markt, nicht ich.",
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
        question: "Klingt das nicht wie ein Roboter?",
        answer:
          "Der Ton wird auf dich abgestimmt, und du gibst die Antworten vor der Inbetriebnahme frei. Es klingt nach dir. Dass ein digitaler Assistent antwortet, wird dabei offen gesagt – verstecken wäre der schlechtere Weg.",
      },
      {
        question: "Was ist mit den Daten meiner Kunden?",
        answer:
          "Alles läuft EU-gehostet und DSGVO-konform, mit Auftragsverarbeitungsvertrag. Beim Document Concierge liegen die Dokumente in deiner eigenen Cloud – meine Seite ist nur der Weg dorthin und löscht danach.",
      },
      {
        question: "Wird das ein großes, riskantes Projekt?",
        answer:
          "Nein. Der erste Schritt ist ein Gespräch, danach ein Angebot mit klarem Umfang. Gebaut wird in Wochen, nicht in Quartalen, und die Schlussrechnung zahlst du erst nach deiner Abnahme.",
      },
    ],
  },

  close: {
    title: "Lass uns 30 Minuten sprechen",
    body: "Im Erstgespräch schauen wir uns an, wo bei dir die Anfragen hereinkommen und wo die Zeit wirklich hängt. Danach weißt du, was ich bauen würde, wie lange es dauert und was es kostet. Passt es nicht, sage ich dir das.",
    fallbackHint: "Schreib mir so lange einfach über das Kontaktformular.",
    fallback: { prompt: "Lieber schreiben?", label: "Zum Kontaktformular", href: "/kontakt" },
  },
};
