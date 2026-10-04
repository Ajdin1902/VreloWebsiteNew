// src/lib/claudeGehirnPage.ts
//
// Every German string for /claude-gehirn (spec 2026-10-03 §7). The page and
// its components hold none. A gift page: nothing here asks for anything.
// Layout by Ajdin (2026-10-04): prompt first, then steps + video, where the
// folder lives, how it is built, what to keep in mind, and the honest notes.
// German quotes are written as \u201E … \u201C escapes so no tool can downgrade them.

export type FolderRow = { ort: string; vorteile: string; nachteile: string; wann: string };

export type GehirnPage = {
  meta: { title: string; description: string };
  top: { title: string; line: string; voraussetzungenLabel: string; voraussetzungen: string[] };
  prompt: { boxLabel: string; copyLabel: string; copiedLabel: string; failedLabel: string };
  anleitung: {
    heading: string;
    steps: [string, string, string];
    video: { src: string; poster: string; label: string; caption: string };
  };
  speicherort: { heading: string; columns: [string, string, string, string]; rows: [FolderRow, FolderRow]; fussnote: string };
  ordner: { heading: string; intro: string; root: string; tree: { name: string; note: string }[] };
  beachten: { heading: string; items: string[] };
  gutZuWissen: { heading: string; items: string[] };
  hinweis: string;
};

export const gehirnPage: GehirnPage = {
  meta: {
    title: "Dein Prompt für dein KI-Gehirn mit Claude",
    description:
      "Ein kostenloser Text für Claude Cowork (ab Pro): Claude legt in einem Ordner ein Gehirn für deinen Betrieb an, lernt aus deinen Unterlagen und hält sein Wissen selbst aktuell.",
  },
  top: {
    title: "Dein Prompt für dein KI-Gehirn",
    line: "Kopieren, in Claude einfügen, abschicken.",
    voraussetzungenLabel: "Voraussetzungen",
    voraussetzungen: ["Claude Pro oder höher, in der Claude-App für Windows oder Mac", "15 Minuten"],
  },
  prompt: {
    boxLabel: "Der Text zum Einfügen",
    copyLabel: "Text kopieren",
    copiedLabel: "Kopiert. Jetzt in Cowork einfügen.",
    failedLabel: "Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn von Hand.",
  },
  anleitung: {
    heading: "So richtest du es ein",
    steps: [
      "Leg einen leeren Ordner an.",
      "Öffne in der Claude-App Cowork und wähle den Ordner aus.",
      "Füge den Text ein und schick ihn ab. Claude führt dich durch den Rest.",
    ],
    video: {
      src: "/video/claude-gehirn-anleitung.mp4",
      poster: "/video/claude-gehirn-anleitung.webp",
      label: "Video: die Einrichtung in Claude Cowork, Schritt für Schritt",
      caption: "Die Einrichtung in 22 Sekunden, ohne Ton.",
    },
  },
  speicherort: {
    heading: "Wo der Ordner liegt",
    columns: ["Speicherort", "Vorteile", "Nachteile", "Wann nutzen"],
    rows: [
      {
        ort: "Lokal, etwa C:\\Mein Gehirn",
        vorteile: "Am schnellsten. Läuft auch ohne Internet.",
        nachteile: "Keine automatische Sicherung. Nur auf diesem Rechner.",
        wann: "Wenn du an einem Rechner arbeitest. So mache ich es selbst und sichere jede Stunde nach OneDrive.",
      },
      {
        ort: "Cloud: OneDrive, Google Drive, iCloud",
        vorteile: "Automatisch gesichert. Auf mehreren Geräten.",
        nachteile:
          "Etwas langsamer. Die Dateien müssen auf dem Gerät liegen, bei OneDrive mit \u201EImmer auf diesem Gerät behalten\u201C.",
        wann: "Wenn du an mehreren Geräten arbeitest oder keine eigene Sicherung hast.",
      },
    ],
    fussnote: "Kein USB-Stick, kein Netzlaufwerk.",
  },
  ordner: {
    heading: "So ist der Ordner aufgebaut",
    intro: "Claude legt alles selbst an. Deine Unterlagen kommen nach quellen/.",
    root: "Mein Gehirn/",
    tree: [
      { name: "CLAUDE.md", note: "das Wichtigste, liest Claude jedes Mal" },
      { name: "inhalt.md", note: "Inhaltsverzeichnis aller Seiten" },
      { name: "verlauf.md", note: "was wann passiert ist" },
      { name: "quellen/", note: "deine Unterlagen, Claude liest nur" },
      { name: "wissen/", note: "eine Seite pro Kunde, Ablauf und Thema" },
    ],
  },
  beachten: {
    heading: "Dinge zu beachten",
    items: [
      "Starte Cowork ab jetzt immer in diesem Ordner.",
      "Claude merkt sich nur, was wichtig ist.",
      "Je mehr Claude weiß, desto besser die Ergebnisse.",
    ],
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
