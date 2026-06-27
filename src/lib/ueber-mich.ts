export type StoryBeat = {
  slug: string; // matches the clip slug: quelle | ripples | fluss | merak
  heading: string;
  body: string; // plain text; blank lines separate paragraphs, Vrelo/Merak get BrandWord
  side: "left" | "right";
  video?: boolean; // defaults to true; set false to render the beat text-only
};

export const storyBeats: StoryBeat[] = [
  {
    slug: "quelle",
    heading: "Woher ich komme",
    body: "Mein Name kommt – wie auch der Name Vrelo – aus Bosnien und Herzegowina. Vrelo bedeutet Quelle: der Ursprung, aus dem ein Fluss klar und beständig entspringt. Das steht hinter meiner Arbeit.\n\nWenn ich dort bin, fällt die Hektik ab, und es bleibt Raum für das Wesentliche. Die Frage, die mich seitdem begleitet: Wie lässt sich dieses Gefühl in den Arbeitsalltag holen? Die Antwort liegt darin, die vielen täglichen Aufgaben loszuwerden, die Zeit und Konzentration rauben. Es braucht eine saubere, definierte Quelle, aus der die Tätigkeiten strukturiert und automatisiert laufen. Möglich ist das – im Tagesgeschäft fehlt nur die Zeit, es sauber aufzusetzen. Hier setzt Vrelo an.",
    side: "left",
  },
  {
    slug: "ripples",
    heading: "Der Moment, der alles ins Fließen brachte",
    body: "Seit über drei Jahren baue ich Automatisierungen, die in einem international renommierten Unternehmen täglich im Einsatz sind. Tag für Tag habe ich dort gesehen, wie viel Arbeitszeit in mühsamen, wiederkehrenden Aufgaben verschwindet – Aufgaben, die jemand machen muss, aber niemand machen will.\n\nDieser Kleinkram kostet nicht nur Zeit. Er nimmt den Spaß an der eigentlichen Arbeit und sorgt für Stress, der nicht sein müsste. Weil ich dabei ständig im Austausch mit der fachlichen Seite war, weiß ich, wo es wirklich hakt – und wie man es richtig löst. Daraus ist Vrelo entstanden.",
    side: "right",
  },
  {
    slug: "fluss",
    heading: "Wie ich heute arbeite",
    body: "Meine Automatisierungen laufen rund um die Uhr, zeitgesteuert und verlässlich. Ganze Abteilungen haben dadurch Woche für Woche spürbar Zeit zurückgewonnen – nicht indem der Stress ganz verschwindet, sondern indem der unnötige Teil davon wegfällt. Ich baue solche Abläufe nicht nur, ich halte sie auch dauerhaft am Laufen.\n\nDie Technik dahinter ist Mittel zum Zweck. Entscheidend ist das Ergebnis: Grundlegende Prozesse laufen vollständig automatisch und zuverlässig, ohne dass jemand daran denken muss. „Seitdem dieser Prozess automatisiert läuft, habe ich völlig vergessen, dass es ihn überhaupt gibt.“ Immer wenn ich diesen Satz gehört habe, wusste ich: Genau so soll es sein.",
    side: "left",
  },
  {
    slug: "merak",
    heading: "Wonach es sich anfühlt",
    body: "Was mich antreibt, ist ein bestimmter Moment: wenn mitten im Arbeitstag Ruhe einkehrt, weil etwas einfach läuft. Je weniger unnötige Reibung wir bei der Arbeit haben, desto mehr Zeit und Fokus bleiben für das, was wirklich zählt – beruflich wie privat. Das ist die eigentliche Kraft der Automatisierung.\n\nDiesen Moment der Ruhe nennen wir Merak. Eine direkte Übersetzung ins Deutsche gibt es nicht – vielleicht, weil solche Momente viel zu selten geworden sind. Was ich dir aber sicher sagen kann: Vrelo kann dir genau dieses Gefühl zurückgeben. Melde dich, und wir schauen in Ruhe gemeinsam, wo wir anfangen.",
    side: "right",
  },
];
