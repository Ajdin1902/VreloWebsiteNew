// src/lib/claudeGehirnPage.ts
//
// Every German string for /claude-gehirn (spec 2026-10-03 §7). The page and
// its components hold none. A gift page: nothing here asks for anything.
// Short by decision (Ajdin 2026-10-03): the prompt first, then only what a
// reader needs to use it safely.

export type GehirnPage = {
  meta: { title: string; description: string };
  top: { title: string; line: string };
  prompt: { boxLabel: string; copyLabel: string; copiedLabel: string; failedLabel: string };
  anleitung: { heading: string; voraussetzungen: string; steps: [string, string, string]; tipp: string; ordner: string };
  danach: { heading: string; body: string };
  gutZuWissen: { heading: string; items: string[] };
  hinweis: string;
};

export const gehirnPage: GehirnPage = {
  meta: {
    title: "Ein Gehirn für deinen Betrieb, mit Claude",
    description:
      "Ein kostenloser Text für Claude Cowork (ab Pro): Claude legt in einem Ordner ein Gehirn für deinen Betrieb an, lernt aus deinen Unterlagen und hält sein Wissen selbst aktuell.",
  },
  top: {
    title: "Ein Gehirn für deinen Betrieb, mit Claude",
    line: "Kopieren, in Claude Cowork einfügen, abschicken. Kostenlos, ohne Anmeldung.",
  },
  prompt: {
    boxLabel: "Der Text zum Einfügen",
    copyLabel: "Text kopieren",
    copiedLabel: "Kopiert. Jetzt in Cowork einfügen.",
    failedLabel: "Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn von Hand.",
  },
  anleitung: {
    heading: "So richtest du es ein",
    voraussetzungen:
      "Du brauchst die Claude-App für Windows oder Mac, einen bezahlten Tarif ab Pro (Cowork, noch in der Vorschau) und etwa 15 Minuten.",
    steps: [
      "Leg einen neuen, leeren Ordner an.",
      "Öffne in der Claude-App Cowork und wähle den Ordner aus.",
      "Füge den Text ein und schick ihn ab. Claude führt dich durch den Rest.",
    ],
    tipp: "Du musst nichts kopieren: Füge bestehende Ordner in Cowork hinzu und nenne Claude den Pfad. Ein paar eigene Mails zeigen Claude, wie du schreibst.",
    ordner:
      "Am schnellsten liegt der Ordner lokal, etwa unter C:\\Mein Gehirn. Mit OneDrive hast du eine Sicherung, stell den Ordner dann auf „Immer auf diesem Gerät behalten“. Kein USB-Stick, kein Netzlaufwerk. Ich arbeite selbst auf C: und sichere jede Stunde nach OneDrive.",
  },
  danach: {
    heading: "Was danach passiert",
    body: "Claude legt dein Gehirn im Ordner an: CLAUDE.md mit dem Wichtigsten, Seiten zu Kunden und Abläufen, ein Inhaltsverzeichnis und einen Verlauf. Es speichert nur, was du in einem Monat noch brauchst, räumt selbst auf und fragt, bevor es Dateien löscht. Du musst nichts pflegen.",
  },
  gutZuWissen: {
    heading: "Gut zu wissen",
    items: [
      "Alles, was du Claude gibst, geht an Anthropic. Passwörter, Gesundheitsdaten und vertrauliche Kundendaten gehören nicht hinein.",
      "Cowork hat keinen Schreibschutz. Dass Claude hinzugefügte Ordner nicht ändert, steht als Regel im Text.",
      "Das Gehirn besteht aus einfachen Textdateien in deinem Ordner. Sie gehören dir.",
    ],
  },
  hinweis: "Vrelo ist nicht mit Anthropic verbunden. Claude ist eine Marke von Anthropic.",
};
