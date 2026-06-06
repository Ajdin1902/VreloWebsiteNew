export type FaqEntry = { question: string; answer: string };
export type FaqGroup = { theme: string; entries: FaqEntry[] };

export const faqGroups: FaqGroup[] = [
  {
    theme: "Zusammenarbeit",
    entries: [
      {
        question: "Wie läuft ein Projekt mit dir ab?",
        answer:
          "In drei ruhigen Schritten: Wir schauen gemeinsam hin, wo dir Zeit verloren geht. Ich baue daraus eine saubere, dokumentierte Lösung. Danach läuft sie von selbst — für Anpassungen bleibe ich erreichbar.",
      },
      {
        question: "Für welche Betriebe baust du?",
        answer:
          "Für kleine Betriebe und Selbstständige im DACH-Raum — Handwerk, Praxen, Agenturen, lokale Dienstleister. Wenn sich bei dir täglich derselbe Kleinkram wiederholt, lohnt es sich.",
      },
      {
        question: "Arbeitest du auch remote?",
        answer:
          "Ja, komplett remote. Die Zusammenarbeit läuft über kurze Calls und klare Absprachen — egal, wo dein Betrieb sitzt.",
      },
      {
        question: "Was passiert nach dem Projekt?",
        answer:
          "Du bist nicht allein: Ich bleibe erreichbar, und weil alles sauber dokumentiert ist, lässt sich dein System anpassen, wenn sich etwas in deinem Betrieb ändert.",
      },
    ],
  },
  {
    theme: "Technik & Sicherheit",
    entries: [
      {
        question: "Muss ich meine bestehenden Tools wechseln?",
        answer:
          "Nein. Ich baue auf dem auf, was du schon nutzt, und verbinde deine Tools miteinander — statt dir ein neues System aufzuzwingen.",
      },
      {
        question: "Was passiert mit meinen Daten?",
        answer:
          "Deine Daten bleiben deine. Ich arbeite DSGVO-konform, nutze nur die nötigen Zugänge und dokumentiere, was wohin fließt.",
      },
      {
        question: "Was, wenn etwas nicht mehr funktioniert?",
        answer:
          "Jede Automatisierung wird dokumentiert und überwacht. Ändert sich etwas, passe ich sie an — du stehst nie mit einem kaputten Ablauf allein da.",
      },
    ],
  },
  {
    theme: "Kosten & Ablauf",
    entries: [
      {
        question: "Was kostet eine Automatisierung?",
        answer:
          "Das hängt vom Umfang ab — jede Lösung ist maßgeschneidert. Nach einem kurzen Gespräch bekommst du ein klares, unverbindliches Angebot ohne versteckte Kosten.",
      },
      {
        question: "Wie lange dauert die Umsetzung?",
        answer:
          "Die meisten ersten Automatisierungen stehen innerhalb weniger Wochen, kleinere Abläufe oft schon in Tagen.",
      },
      {
        question: "Wie fange ich an?",
        answer:
          "Mit einem unverbindlichen Gespräch. Du erzählst mir, was dich Zeit kostet — ich sage dir ehrlich, ob und wie ich helfen kann.",
      },
    ],
  },
];
