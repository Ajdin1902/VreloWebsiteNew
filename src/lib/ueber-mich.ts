export type StoryBeat = {
  slug: string; // matches the clip slug: quelle | ripples | fluss | merak
  heading: string;
  body: string; // plain text; blank lines separate paragraphs, Vrelo/Merak get BrandWord
  side: "left" | "right";
};

export const storyBeats: StoryBeat[] = [
  {
    slug: "quelle",
    heading: "Woher ich komme",
    body: "Mein Name – wie auch der Name Vrelo – kommt aus Bosnien und Herzegowina, diesem Land im Balkan in Südosteuropa mit ganzen 25 km Meerzugang (danke, Kroatien). Immer wenn ich unten bin, passiert etwas Magisches: Dieser ganze Arbeitsstress ist einfach weg. („Ja wow, Ajdin, wenn man im Urlaub ist, hat man keinen Stress, danke dafür.“ – kannst du dir zurecht denken, aber ich frage mich trotzdem:)\n\nWas hält mich davon ab, dieses Gefühl in meinen Arbeitsalltag zu integrieren? Die Antwort: Dafür braucht es klare Strukturen, definierte Prozesse und Governance, die automatisiert ablaufen und alles verifizieren. Nur hat keiner die Zeit, sich ordnungsgemäß darum zu kümmern – eben genau wegen des Arbeitsalltags. Es ist nicht einfach umzusetzen, aber sicherlich möglich.",
    side: "left",
  },
  {
    slug: "ripples",
    heading: "Der Moment, der alles ins Rollen brachte",
    body: "Ich bin seit einigen Jahren als Programmierer von Automatisierungsprozessen tätig und habe gemerkt, wie sehr der Arbeitsalltag durch mühsame, wiederkehrende Tätigkeiten geprägt ist – die man machen muss, aber keiner wirklich machen will. Wenn das der neue Arbeitsalltag ist, verursacht das unnötigen Stress und nimmt uns den Spaß an der kreativen, wertschöpfenden Arbeit. (Ja, ich glaube wirklich daran, dass Arbeit als Weiterentwicklung von einem selbst tatsächlich Spaß machen kann. Das haben wir nur verlernt.)\n\nIch habe aber auch gemerkt: So muss es nicht bleiben. Genau hier kommt Vrelo ins Spiel.",
    side: "right",
  },
  {
    slug: "fluss",
    heading: "Wie ich heute arbeite",
    body: "Immer wenn ich in meiner Arbeit eine Automatisierung fertiggestellt habe, waren die betroffenen Kollegen besonders dankbar, dass sie sich um den ganzen Kleinkram nicht mehr aktiv kümmern müssen. Das hat ihnen zum Teil mehrere Stunden pro Woche (!) zurückgegeben. Die Möglichkeiten der Automatisierung – vor allem im Zuge der KI-Entwicklung – sind den meisten Menschen nicht bekannt (meiner Meinung nach).\n\nGrundlegende Prozesse können völlig automatisiert und vor allem verlässlich ablaufen, ohne dass man sich darum Gedanken machen muss. „Also, seitdem dieser Prozess automatisiert läuft, habe ich völlig vergessen, dass dieser überhaupt noch existiert.“ Immer wenn ich diesen Satz gehört habe, wusste ich, dass ich meine Arbeit erfolgreich getan habe.",
    side: "left",
  },
  {
    slug: "merak",
    heading: "Wonach es sich anfühlt",
    body: "Genau diesen Satz – „Ich habe völlig vergessen, dass dieser Prozess überhaupt existiert.“ – möchte ich nun möglichst viele Menschen sagen hören. Nicht, weil das heißt, dass ich viele Kunden erreicht habe (ok, vielleicht zum Teil), sondern viel mehr, weil es einen kurzen Moment der Ruhe in der Arbeit – und damit auch im Leben – ermöglicht.\n\nJe weniger Stress wir im Arbeitsalltag haben, desto mehr Zeit und Fokus bleiben uns für die wichtigen Dinge im Leben. Darum geht es hier: seine Zeit in der Arbeit und privat sinnvoll zu nutzen und sich nicht im Kleinkram zu verlieren. Das ist die Kraft der Automatisierung – mehr Zeit und Fokus für das schaffen, was einem Spaß macht und wichtig ist.\n\nDiesen Moment der Ruhe, den man sich dann öfter nehmen kann, nennen wir Merak. Es gibt keine direkte Übersetzung ins Deutsche. Liegt es vielleicht daran, dass es solche Momente viel zu selten gibt? Wer weiß. Was ich aber mit Sicherheit weiß: Vrelo kann genau diesen Merak bei jedem seiner Kunden erreichen. Melde dich – dann schauen wir zusammen in Ruhe, wie wir mehr Merak in deinen Arbeitsalltag bringen.",
    side: "right",
  },
];
