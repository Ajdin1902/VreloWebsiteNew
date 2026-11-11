// src/lib/kiAgenten.ts
//
// The KI-Agenten examples page (Ajdin 2026-11-11): one agent per company
// department, copy approved in docs/superpowers/specs/2026-11-11-abteilungs-agenten-copy.md.
// Rules: no price; the Inhaber-Assistent is the paid top floor, never a bonus
// or included; a client is named only where I built that agent (built, not
// necessarily live: the Velp go-live waits on Alen, so never say it runs there).
import { CHECK_SRC, type CheckSrc } from "@/lib/prozessCheckCta";

export const KI_AGENTEN_PATH = "/leistungen/ki-agenten";

export type Agent = {
  id: "marketing" | "vertrieb" | "kundenservice" | "projektdoku" | "buchhaltung" | "inhaber";
  name: string;
  aufgaben: string[];
  ergebnis: string;
  gebautFuer?: string;
  /** The top floor: built on the others, shown apart. */
  oberste?: true;
};

const MDZ = "MDZ Hausmeisterservice";
const VELP = "Velp";

export const KI_AGENTEN: {
  title: string;
  line: string;
  metaDescription: string;
  heroImage: string;
  heading: string;
  gebautPrefix: string;
  agenten: Agent[];
  cta: { heading: string; lead: string; src: CheckSrc };
} = {
  title: "KI-Agenten",
  line: "Sechs Beispiele, was ein KI-Agent in deinem Betrieb übernimmt.",
  metaDescription:
    "Beispiele für KI-Agenten im Betrieb: Marketing, Vertrieb, Kundenservice, Projektdoku, Buchhaltung und ein Assistent für den Inhaber.",
  heroImage: "/images/leistung-ki-agenten.webp",
  heading: "Ein Agent für jede Abteilung",
  gebautPrefix: "Gebaut für",
  agenten: [
    {
      id: "marketing",
      name: "Marketing-Agent",
      aufgaben: [
        "Schreibt Entwürfe für Posts, Newsletter und Anzeigen aus deinen echten Aufträgen",
        "Erstellt passende Grafiken dazu",
        "Bittet zufriedene Kunden um eine Google-Bewertung",
        "Wertet jede Woche aus, welche Anzeige Anfragen bringt",
      ],
      ergebnis: "Dein Marketing wertet sich selbst aus. Du gibst frei, was weiterläuft.",
    },
    {
      id: "vertrieb",
      name: "Vertriebs-Agent",
      aufgaben: [
        "Antwortet auf neue Anfragen in wenigen Minuten, auch abends",
        "Fragt Bedarf, Zeitraum und Budget ab und sortiert ernsthafte Anfragen nach oben",
        "Schreibt den Angebotsentwurf und fasst nach drei und sieben Tagen nach",
      ],
      ergebnis: "Alles über einen Kunden steht in deinem CRM, bevor du zum Hörer greifst.",
      gebautFuer: VELP,
    },
    {
      id: "kundenservice",
      name: "Kundenservice-Agent",
      aufgaben: [
        "Schickt jedem neuen Kunden eine Willkommensmail mit der Liste der Unterlagen, die noch fehlen",
        "Erinnert, bis alles da ist. Jede Unterlage landet im richtigen Ordner.",
        "Beantwortet Fragen wie „Wann kommt ihr?“ sofort",
      ],
      ergebnis: "Neue Kunden sind startklar, ohne dass du hinterhertelefonierst.",
      gebautFuer: VELP,
    },
    {
      id: "projektdoku",
      name: "Projektdoku-Agent",
      aufgaben: [
        "Legt für jeden Auftrag Aufgaben und Fristen an",
        "Macht aus Sprachnachrichten und Baustellenfotos ein Protokoll",
        "Schiebt den Auftrag in die nächste Phase, sobald ein Schritt erledigt ist",
      ],
      ergebnis: "Dein Team arbeitet am Auftrag. Die Doku führt der Agent.",
      gebautFuer: VELP,
    },
    {
      id: "buchhaltung",
      name: "Buchhaltungs-Agent",
      aufgaben: [
        "Schreibt die Rechnung, sobald der Auftrag abgeschlossen ist",
        "Erinnert höflich, wenn eine Zahlung ausbleibt",
        "Sortiert Belege und speichert sie im richtigen Ordner ab",
      ],
      // Ajdin 2026-11-11: replaces the absolute promise on errors (UWG §5).
      ergebnis: "Kein Abtippen und Rumkopieren mehr bei Rechnungen. Das Geld kommt früher.",
      gebautFuer: MDZ,
    },
    {
      id: "inhaber",
      name: "Inhaber-Assistent",
      aufgaben: [
        "Beantwortet Sprachnachrichten wie „Welche Rechnungen sind offen?“",
        "Legt Termine und Notizen an und schreibt Mail-Entwürfe",
        "Schickt dir jeden Morgen ein Tagesbild",
      ],
      ergebnis: "Du behältst den Überblick, auch wenn du draußen bist.",
      gebautFuer: MDZ,
      oberste: true,
    },
  ],
  cta: {
    heading: "Welcher Agent nimmt dir am meisten ab?",
    lead: "In 30 Minuten zeige ich dir, wie das in deinem Betrieb aussieht.",
    src: CHECK_SRC.kiAgenten,
  },
};
