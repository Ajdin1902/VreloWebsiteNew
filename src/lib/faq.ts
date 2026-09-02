export type FaqEntry = { question: string; answer: string };
export type FaqGroup = { theme: string; entries: FaqEntry[] };

export const faqGroups: FaqGroup[] = [
  {
    theme: "Zusammenarbeit",
    entries: [
      {
        question: "Wie läuft ein Projekt mit dir ab?",
        answer:
          "In drei Schritten: Zuerst legen wir in einem unverbindlichen Erstgespräch den Grundstein: womit du arbeitest, wo es hakt, wo du hinwillst. Dann erstelle ich dir einen genauen Plan, wie wir dorthin kommen: Welche Prozesse lassen sich automatisieren, wo lohnt es sich am meisten, und was bringt dir das konkret? Zum Schluss entscheidest du, wann du diesen Weg gehen möchtest. Nach dem Projekt bleibe ich für Anpassungen erreichbar.",
      },
      {
        question: "Für welche Betriebe baust du?",
        answer:
          "Für kleine Betriebe und Selbstständige im DACH-Raum: Handwerk, Praxen, Agenturen, lokale Dienstleister. Wenn sich bei dir täglich derselbe Kleinkram wiederholt, lohnt es sich.",
      },
      {
        question: "Arbeitest du auch remote?",
        answer:
          "Ja, komplett remote. Die Zusammenarbeit läuft über kurze Calls und klare Absprachen, egal, wo dein Betrieb sitzt.",
      },
      {
        question: "Was passiert nach dem Projekt?",
        answer:
          "In den ersten 14 Tagen nach der Übergabe beobachte ich dein System und justiere nach, ohne dass du dich darum kümmerst. Danach bist du nicht allein: Ich bleibe erreichbar, und weil alles sauber dokumentiert ist, lässt sich dein System anpassen, wenn sich etwas in deinem Betrieb ändert.",
      },
      {
        question: "Ersetzt die Automatisierung mich oder meine Mitarbeiter?",
        answer:
          "Nein. Sie übernimmt die Aufgaben, die sich jeden Tag wiederholen: das Abtippen, Weiterleiten, Erinnern. Alles, was dein Urteil oder das deiner Mitarbeiter braucht, bleibt bei euch. In der Praxis heißt das: weniger Kleinkram am Schreibtisch, mehr Zeit für die Arbeit, für die deine Kunden dich bezahlen.",
      },
      {
        question: "Müssen meine Mitarbeiter etwas Neues lernen?",
        answer:
          "Meistens nicht, oder nur einen kleinen Schritt, etwa eine Nachricht an einer neuen Stelle lesen. Die Abläufe bleiben, wie dein Team sie kennt; das System arbeitet im Hintergrund. Zur Übergabe gehört eine Dokumentation für deine Mitarbeiter, in klarer Sprache und ohne Fachbegriffe.",
      },
    ],
  },
  {
    theme: "Technik & Sicherheit",
    entries: [
      {
        question: "Muss ich meine bestehenden Tools wechseln?",
        answer:
          "Nicht zwingend. Wenn eine andere Lösung dein Problem an der Wurzel löst, schlage ich sie dir vor. Manchmal ist damit schon das Grundproblem behoben. Oft reicht es aber, deine bestehenden Tools sauber miteinander zu verbinden. Ich zwinge dir kein neues System auf, sondern passe mich deiner Lage an.",
      },
      {
        question: "Was passiert mit meinen Daten?",
        answer:
          "Deine Daten bleiben deine. Du entscheidest, wohin sie fließen: Entweder nutzen wir eine Cloud-Lösung, oder ich baue dir ein selbstgehostetes System mit zertifizierten Anbietern auf. Ich arbeite DSGVO-konform, nutze nur die nötigen Zugänge und dokumentiere, was wohin fließt.",
      },
      {
        question: "Was, wenn etwas nicht mehr funktioniert?",
        answer:
          "Während der Testphase schauen wir ganz genau hin und reagieren, sobald sich etwas ändert. Jede Automatisierung ist dabei dokumentiert und überwacht. Ist der Prozess etabliert, entscheidest du, ob du eine laufende Wartung möchtest.",
      },
    ],
  },
  {
    theme: "Kosten & Ablauf",
    entries: [
      {
        question: "Was kostet eine Automatisierung?",
        answer:
          "Je nach Umfang liegt eine Automatisierung zwischen 1.500 und 25.000 Euro netto. Wie viel es bei dir wird, hängt davon ab, wie viel sich automatisieren lässt, vom kleinen Baustein bis zum ganzen Ablauf, daher die große Spanne. Den genauen Betrag rechne ich für deinen Fall aus und erkläre ihn dir im Gespräch Schritt für Schritt, damit du nachvollziehen kannst, wie er zustande kommt.",
      },
      {
        question: "Fallen laufende Kosten an?",
        answer:
          "Den Server für dein System zahlst du direkt beim Anbieter und auf deinen Namen, rund 30 Euro im Monat. Nutzt dein System KI, kommen je nach Nutzung meist 5 bis 10 Euro im Monat dazu. Weitere laufende Fremdkosten hast du nicht. Eine laufende Betreuung kannst du dazunehmen, wenn du willst: Ich überwache die Abläufe, behebe Fehler und passe Kleinigkeiten an. Je nach Umfang liegt das zwischen 350 und 1.000 Euro im Monat, netto und monatlich kündbar. Ohne Betreuung läuft dein System weiter, sicher, aber auf dem Stand der Übergabe.",
      },
      {
        question: "Wie lange dauert die Umsetzung?",
        answer:
          "Die meisten ersten Automatisierungen stehen innerhalb weniger Wochen, kleinere Abläufe oft schon in Tagen. Je genauer wir Ausgangslage und Ziel am Anfang festlegen, desto reibungsloser läuft die Umsetzung.",
      },
      {
        question: "Wie fange ich an?",
        answer:
          "Mit einem unverbindlichen Gespräch. Du erzählst mir, was dich Zeit kostet. Ich sage dir ehrlich, ob und wie ich helfen kann.",
      },
    ],
  },
];
