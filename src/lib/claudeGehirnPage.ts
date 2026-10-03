// src/lib/claudeGehirnPage.ts
//
// Every German string for /claude-gehirn (spec 2026-10-03 §7). The page and
// its components hold none. A gift page: nothing here asks for anything.

export type GehirnPage = {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; line: string; image: string };
  intro: string;
  voraussetzungen: { heading: string; items: string[]; hinweis: string };
  schritte: { heading: string; steps: [string, string, string]; tipp: string; tippHinweis: string };
  ordner: {
    heading: string;
    intro: string;
    options: { name: string; wo: string; plus: string[]; minus: string[] }[];
    unserWeg: { heading: string; body: string };
    fallback: string;
    warnungen: string[];
  };
  prompt: { heading: string; lead: string; boxLabel: string; copyLabel: string; copiedLabel: string; failedLabel: string };
  ergebnis: { heading: string; tree: string; files: { name: string; body: string }[] };
  regeln: { heading: string; lead: string; items: { title: string; body: string }[] };
  alltag: { heading: string; beispiele: string[] };
  nichtHinein: { heading: string; items: string[]; datenschutz: string };
  fragen: { heading: string; items: { frage: string; antwort: string }[] };
  hinweis: string;
};

export const gehirnPage: GehirnPage = {
  meta: {
    title: "Ein Gehirn für deinen Betrieb, mit Claude",
    description:
      "Ein kostenloser Text zum Einfügen: Claude legt in einem Ordner ein Gehirn für deinen Betrieb an, lernt aus deinen Unterlagen und hält sein Wissen selbst aktuell.",
  },
  hero: {
    eyebrow: "Kostenlos · ohne Anmeldung",
    title: "Ein Gehirn für deinen Betrieb, mit Claude",
    line: "Ein Text zum Einfügen. Danach kennt Claude deinen Betrieb und hält sein Wissen selbst aktuell.",
    image: "/images/bg-karst-quelle.webp",
  },
  intro:
    "So arbeite ich selbst jeden Tag: Zu Beginn jeder Sitzung liest Claude, was in meinem Betrieb gerade wichtig ist. Neues schreibt es selbst mit. Mit dem Text unten richtest du dir dasselbe ein.",
  voraussetzungen: {
    heading: "Was du brauchst",
    items: [
      "Die Claude-App für Windows oder Mac.",
      "Einen bezahlten Claude-Tarif, ab Pro. Cowork, der Arbeitsmodus mit Zugriff auf einen Ordner, ist im kostenlosen Tarif nicht enthalten.",
      "Etwa 15 Minuten.",
    ],
    hinweis: "Cowork ist bei Anthropic noch eine Vorschau und kann sich ändern.",
  },
  schritte: {
    heading: "In drei Schritten",
    steps: [
      "Leg einen neuen, leeren Ordner an, zum Beispiel „Mein Gehirn“.",
      "Öffne in der Claude-App Cowork und wähle diesen Ordner aus.",
      "Kopiere den Text unten, füg ihn ein und schick ihn ab. Claude führt dich durch den Rest.",
    ],
    tipp: "Hast du Angebote, Preislisten oder Notizen? Leg Kopien in den Ordner „quellen“, sobald Claude ihn angelegt hat. Oder du kopierst nichts: Füge deinen bestehenden Ordner in Cowork zum Projekt hinzu und nenne Claude den Pfad. Ein paar eigene Mails zeigen Claude, wie du schreibst. Was Claude dort findet, muss es dich nicht mehr fragen.",
    tippHinweis:
      "Cowork hat keinen Schreibschutz. Dass Claude in deinem Ordner nichts ändert, steht als Regel im Text. Für sehr sensible Ordner leg lieber Kopien in „quellen“.",
  },
  ordner: {
    heading: "Wo du den Ordner anlegst",
    intro: "Claude braucht den Ordner auf deinem Rechner. Du hast vier Möglichkeiten.",
    options: [
      {
        name: "Lokal auf deinem Rechner",
        wo: "Windows: Laufwerk C:, zum Beispiel C:\\Mein Gehirn. Mac: ein Ordner außerhalb von iCloud.",
        plus: ["Am schnellsten, auch ohne Internet.", "Nichts wird zwischendurch abgeglichen."],
        minus: [
          "Liegt nur auf diesem einen Gerät.",
          "Ohne eigene Sicherung ist alles weg, wenn der Rechner kaputtgeht.",
        ],
      },
      {
        name: "OneDrive",
        wo: "Windows und Mac.",
        plus: [
          "Automatische Sicherung mit Versionsverlauf: Überschreibt Claude einmal etwas falsch, holst du die alte Fassung zurück.",
          "Auch auf dem Handy lesbar.",
        ],
        minus: [
          "Stell den Ordner auf „Immer auf diesem Gerät behalten“. Sonst liegen manche Dateien nur in der Cloud.",
          "Bearbeitest du auf zwei Geräten gleichzeitig, entstehen doppelte Dateien.",
        ],
      },
      {
        name: "iCloud Drive",
        wo: "Mac.",
        plus: ["Schon eingebaut, nichts zu installieren."],
        minus: [
          "Schalte „Mac-Speicher optimieren“ aus. Sonst lagert der Mac ältere Dateien aus.",
          "Läuft gut nur auf Apple-Geräten.",
        ],
      },
      {
        name: "Google Drive",
        wo: "Windows und Mac, mit der App Google Drive.",
        plus: ["Sicherung über mehrere Geräte."],
        minus: [
          "Im Standardmodus „Streamen“ liegen die Dateien nur in der Cloud. Stell den Ordner auf „Offline verfügbar“ oder nutze „Spiegeln“.",
          "Eine App mehr auf dem Rechner.",
        ],
      },
    ],
    unserWeg: {
      heading: "So mache ich es",
      body: "Mein Gehirn liegt lokal auf C:, weil es dort am schnellsten läuft. Dafür liegt es nur auf diesem einen Rechner. Deshalb kopiert ein kleines Skript es jede Stunde nach OneDrive.",
    },
    // Depends on Task 2 run (c). If OneDrive failed there, replace with:
    // "Leg den Ordner lokal an und kopier ihn regelmäßig an einen zweiten Ort, zum Beispiel in deine Cloud."
    fallback:
      "Willst du keine eigene Sicherung einrichten, kommt OneDrive mit „Immer auf diesem Gerät behalten“ dem am nächsten.",
    warnungen: [
      "Unter Windows liegt „Dokumente“ oft schon in OneDrive, am Mac kann iCloud den Ordner „Dokumente“ übernehmen. Ein Blick auf den Pfad zeigt es dir.",
      "Kein USB-Stick, keine externe Festplatte, kein Netzlaufwerk: Ist es nicht verbunden, findet Claude sein Gehirn nicht.",
    ],
  },
  prompt: {
    heading: "Der Text zum Einfügen",
    lead: "Kopieren, in Cowork einfügen, abschicken. Es ist derselbe Text wie in meinem LinkedIn-Beitrag.",
    boxLabel: "Der Text zum Einfügen",
    copyLabel: "Text kopieren",
    copiedLabel: "Kopiert. Jetzt in Cowork einfügen.",
    failedLabel: "Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn von Hand.",
  },
  ergebnis: {
    heading: "Was danach in deinem Ordner liegt",
    tree: [
      "Mein Gehirn/",
      "├── CLAUDE.md",
      "├── inhalt.md",
      "├── verlauf.md",
      "├── quellen/",
      "└── wissen/",
      "    ├── kunden/",
      "    ├── ablaeufe/",
      "    └── themen/",
    ].join("\n"),
    files: [
      {
        name: "CLAUDE.md",
        body: "Das Gehirn. Claude liest es zu Beginn jeder Sitzung: wer du bist, woran du arbeitest, was entschieden ist, wie du arbeiten willst. Höchstens 150 Zeilen.",
      },
      { name: "inhalt.md", body: "Die Landkarte. Jede Seite mit einem Satz, damit Claude die richtige findet, ohne alles zu lesen." },
      { name: "verlauf.md", body: "Was sich wann geändert hat. Wird nur ergänzt, nie umgeschrieben." },
      { name: "quellen/", body: "Dein Rohmaterial. Claude liest es, ändert es aber nie." },
      { name: "wissen/", body: "Die Seiten, die Claude schreibt und aktuell hält: Kunden, Abläufe, Themen." },
    ],
  },
  regeln: {
    heading: "Die Regeln dahinter",
    lead: "Alle Regeln stehen im Text oben. Jede stammt aus meinem eigenen Alltag mit Claude.",
    items: [
      {
        title: "Arbeit zuerst.",
        body: "Deine Aufgabe kommt vor der Pflege. Claude speichert nur, was du in einem Monat noch brauchst, entscheidet das selbst und meldet sich mit höchstens einer Zeile. Ein Gehirn, das ständig nachfragt, schaltet man nach einer Woche ab.",
      },
      {
        title: "Eine Quelle der Wahrheit.",
        body: "Was gilt, steht im Gehirn. Ändert sich etwas, passt Claude die Seite an.",
      },
      {
        title: "Erst nachsehen, dann fragen.",
        body: "Claude schaut in seine Unterlagen, bevor es dich fragt. Du erklärst nichts zweimal.",
      },
      {
        title: "Nichts erfinden.",
        body: "Weiß das Gehirn etwas nicht, sagt Claude es. Vermutungen stehen als Vermutung da.",
      },
      {
        title: "Widersprüche zeigen.",
        body: "Passt eine neue Information nicht zur alten, überschreibt Claude nichts still. Es zeigt dir beide, du entscheidest.",
      },
      {
        title: "CLAUDE.md bleibt schlank.",
        body: "Höchstens 150 Zeilen, alles andere wandert auf eigene Seiten. Lädt Claude zu viel auf einmal, arbeitet es langsamer und ungenauer.",
      },
      {
        title: "Es pflegt sich selbst.",
        body: "Neue Dateien in „quellen“ und in deinen hinzugefügten Ordnern arbeitet Claude zu Beginn der Sitzung ein. Alle 14 Tage schaut es kurz nach Widersprüchen und Veraltetem. Du musst es nicht daran erinnern.",
      },
      {
        title: "Erst fragen.",
        body: "Seine eigenen Seiten pflegt Claude selbst. Bevor es Dateien löscht, deine Quellen ändert oder etwas aus dem Ordner schickt, fragt es dich.",
      },
    ],
  },
  alltag: {
    heading: "So sprichst du im Alltag mit deinem Gehirn",
    beispiele: [
      "„Ich habe gerade mit Herrn Weber telefoniert: Er will das Angebot bis Freitag.“",
      "„Was steht diese Woche an?“",
      "„Schreib die Antwort an Frau Kaya in meinem Ton.“",
      "„Ich habe die neue Preisliste in quellen gelegt.“",
      "„fertig“",
    ],
  },
  nichtHinein: {
    heading: "Was nicht hineingehört",
    items: [
      "Passwörter, Zugangsdaten und Bankdaten.",
      "Gesundheitsdaten und alles, was unter eine Schweigepflicht fällt.",
      "Vertrauliche Daten deiner Kunden, die du nicht weitergeben darfst.",
    ],
    datenschutz:
      "Alles, was du Claude gibst, geht an Anthropic. Schau in den Datenschutz-Einstellungen deines Claude-Kontos nach, ob deine Chats zum Training verwendet werden dürfen.",
  },
  fragen: {
    heading: "Fragen",
    items: [
      {
        frage: "Gehört das Gehirn mir?",
        antwort: "Ja. Es sind einfache Textdateien in deinem Ordner. Du kannst sie lesen, kopieren und mitnehmen, auch zu einem anderen Werkzeug.",
      },
      {
        frage: "Was, wenn sich Cowork ändert?",
        antwort: "Deine Dateien bleiben davon unberührt. Jedes Programm, das Text anzeigt, kann sie öffnen.",
      },
      {
        frage: "Geht es auch ohne Cowork?",
        antwort: "Ja, im Bereich „Code“ derselben App. Er liest die Datei CLAUDE.md genauso.",
      },
      {
        frage: "Kostet der Text etwas?",
        antwort: "Nein. Du brauchst nur deinen eigenen Claude-Tarif.",
      },
    ],
  },
  hinweis: "Vrelo ist nicht mit Anthropic verbunden. Claude ist eine Marke von Anthropic.",
};
