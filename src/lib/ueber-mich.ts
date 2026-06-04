export type StoryBeat = {
  slug: string; // matches the clip slug: quelle | ripples | fluss | merak
  eyebrow: string;
  heading: string;
  body: string; // [Platzhalter] — founder replaces with the real story
  side: "left" | "right";
};

export const storyBeats: StoryBeat[] = [
  {
    slug: "quelle",
    eyebrow: "Quelle",
    heading: "Woher ich komme",
    body: "[Platzhalter] Erzähl hier von deinen Wurzeln und dem Ursprung des Namens — Vrelo Bosne, die Quelle bei Sarajevo. Warum dieser Ursprung dich bis heute prägt.",
    side: "left",
  },
  {
    slug: "ripples",
    eyebrow: "Wellen",
    heading: "Der Moment, der alles ins Rollen brachte",
    body: "[Platzhalter] Beschreibe den Moment, in dem dir klar wurde, wie viel Zeit kleine, wiederkehrende Aufgaben kosten — und dass es auch anders geht.",
    side: "right",
  },
  {
    slug: "fluss",
    eyebrow: "Fluss",
    heading: "Wie ich heute arbeite",
    body: "[Platzhalter] Erkläre, wie du Automatisierungen baust: ruhig, sauber, dokumentiert. Was kleine Betriebe von der Zusammenarbeit mit dir erwarten können.",
    side: "left",
  },
  {
    slug: "merak",
    eyebrow: "Merak",
    heading: "Wonach es sich anfühlt",
    body: "[Platzhalter] Male das Bild vom Ergebnis: ein freier Kopf, zurückgewonnene Zeit, Ruhe im Betrieb. Lade zum unverbindlichen Gespräch ein.",
    side: "right",
  },
];
