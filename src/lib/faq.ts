import { GARANTIE } from "@/lib/garantie";
import { wartungPreisPunkte } from "@/lib/wartung";

// Ajdin 2026-11-12: every answer is a short bullet list, only the concrete points.
export type FaqEntry = { question: string; answer: readonly string[] };
export type FaqGroup = { theme: string; entries: FaqEntry[] };

/** Stable `id` for a FAQ entry, so other pages can deep-link `/faq#<anchor>`. */
export function faqAnchor(question: string): string {
  return question
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function faqHref(question: string): string {
  return `/faq#${faqAnchor(question)}`;
}

export const faqGroups: FaqGroup[] = [
  {
    theme: "Zusammenarbeit",
    entries: [
      {
        question: "Wie läuft ein Projekt mit dir ab?",
        answer: [
          "Erstgespräch: womit du arbeitest, wo es hakt, wo du hinwillst",
          "Fahrplan: welche Abläufe sich automatisieren lassen und was dir das bringt",
          "Du entscheidest, ob und wann wir bauen",
          "Nach dem Projekt bleibe ich für Anpassungen erreichbar",
        ],
      },
      {
        question: GARANTIE.faqFrage,
        answer: GARANTIE.faqAntwort,
      },
      {
        question: "Was passiert nach dem Projekt?",
        answer: [
          "14 Tage beobachte ich dein System und justiere nach",
          "Danach bin ich weiter erreichbar",
          "Alles ist dokumentiert, also lässt sich dein System später anpassen",
        ],
      },
      {
        question: "Was ist, wenn du mal nicht erreichbar bist?",
        answer: [
          "Server, Konten, Daten und Doku gehören dir",
          "Dein System läuft weiter, auch wenn ich im Urlaub oder krank bin",
          "Mit Betreuung sage ich dir vorher Bescheid, wann ich weg bin",
        ],
      },
      {
        question: "Müssen meine Mitarbeiter etwas Neues lernen?",
        answer: [
          "Meistens nicht, höchstens einen kleinen Schritt, etwa eine Nachricht an einer neuen Stelle lesen",
          "Die Abläufe bleiben, wie dein Team sie kennt",
          "Zur Übergabe gehört eine Anleitung für deine Mitarbeiter, ohne Fachbegriffe",
        ],
      },
    ],
  },
  {
    theme: "Technik & Sicherheit",
    entries: [
      {
        question: "Muss ich meine bestehenden Tools wechseln?",
        answer: [
          "Meistens nicht: Ich verbinde die Programme, die du schon nutzt",
          "Löst ein anderes Programm dein Problem an der Wurzel, schlage ich es dir vor",
          "Du entscheidest",
        ],
      },
      {
        question: "Was passiert mit meinen Daten?",
        answer: [
          "Dein System läuft auf einem eigenen Server bei Hetzner, auf deinen Namen",
          "Rechenzentrum in Deutschland, nach ISO 27001 zertifiziert",
          "DSGVO-konform, nur die nötigen Zugänge, dokumentiert, was wohin fließt",
          "KI mit sensiblen Daten läuft über Server innerhalb der EU, in deinem eigenen Konto",
        ],
      },
      {
        question: "Unterschreibst du einen Vertrag zur Auftragsverarbeitung?",
        answer: [
          "Ja, vor dem Start, nach Art. 28 DSGVO",
          "Sobald dein System personenbezogene Daten verarbeitet, etwa von Kunden oder Mitarbeitern",
          "Telegram nur, wenn du es willst",
          "Für sensible Daten: E-Mail oder ein Kanal, den dein Betrieb schon nutzt",
        ],
      },
      {
        question: "Was, wenn etwas nicht mehr funktioniert?",
        answer: [
          "In der Testphase schaue ich genau hin und reagiere sofort",
          "Jede Automatisierung ist dokumentiert",
          "Danach entscheidest du, ob du eine Betreuung möchtest",
        ],
      },
    ],
  },
  {
    theme: "Kosten & Ablauf",
    entries: [
      {
        question: "Was kostet eine Automatisierung?",
        answer: [
          "1.500 bis 25.000 Euro netto, je nach Umfang",
          "Vom kleinen Baustein bis zum ganzen Ablauf",
          "Den genauen Betrag rechne ich für deinen Fall aus und erkläre ihn dir im Gespräch",
        ],
      },
      {
        question: "Fallen laufende Kosten an?",
        answer: [
          "Server: rund 30 Euro im Monat, direkt beim Anbieter und auf deinen Namen",
          "KI, wenn dein System sie nutzt: meist 5 bis 10 Euro im Monat",
          "Verlangt eines deiner Programme einen bezahlten Tarif für die Schnittstelle, klären wir das vorher",
          ...wartungPreisPunkte(),
        ],
      },
      {
        question: "Gibt es eine Förderung?",
        answer: [
          "Digitalbonus Bayern: oft bis zur Hälfte der Kosten",
          "Für gewerbesteuerpflichtige Betriebe in Bayern mit weniger als 50 Mitarbeitern",
          "Der Antrag muss vor dem Auftrag gestellt sein, auch vor einer mündlichen Zusage",
          "Arztpraxen und freie Berufe sind nicht förderfähig",
        ],
      },
      {
        question: "Wie lange dauert die Umsetzung?",
        answer: [
          "Erste Ergebnisse siehst du in den ersten zwei Wochen nach dem Onboarding",
          "Kleinere Abläufe stehen oft schon nach wenigen Tagen",
        ],
      },
      {
        question: "Wie fange ich an?",
        answer: [
          "Schau dir die kostenlosen Vorlagen an",
          "Geh die Vorlage für deine Branche durch",
          "Dann vereinbarst du ein Gespräch mit mir und wir erstellen deinen Fahrplan",
          "Alles kostenlos",
        ],
      },
    ],
  },
];
