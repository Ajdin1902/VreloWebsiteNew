// Kurierdienste Bauplan of the series. Facts from Knowledge/marketing/prozess-landkarten.md
// section 11 (11.1 Landkarte, 11.7 Recherche, researched 2026-11-07).
import type { ReiheNische } from "./index";

export const kurier: ReiheNische = {
  slug: "kurier",
  label: "Kurierdienste",
  kicker: "Bauplan für Kurierdienste",
  title: "Prozesse, Automatisierung, KI: Wo fange ich überhaupt an?",
  schmerz: "Eine Fahrt, viele Anrufe",
  // Landkarte 11.1 "Heute typisch" for stations 1, 3, 4, 5 and 6.
  auftragsweg: [
    { schritt: "Kunde ruft an, du sitzt im Auto" },
    { schritt: "Notiz im Auto, der Empfänger fehlt", verlust: "zurückgerufen" },
    { schritt: "Anruf beim Fahrer, der gerade frei ist", verlust: "herumtelefoniert" },
    { schritt: "Kunde ruft an: Ist es schon da?", verlust: "nachgefragt" },
    { schritt: "Quittung auf Papier im Fahrzeug", verlust: "nachgereicht" },
    { schritt: "Monatsende: Fahrten aus Zetteln und Chats", verlust: "zusammengesucht" },
    { schritt: "Sammelrechnung, Fahrt für Fahrt", verlust: "abgetippt" },
  ],
  // None (decided): the only primary number, the KEP market share in 11.7, describes the
  // parcel networks, not the reader. The cover carries a pain block instead (spec §5.3).
  statistik: null,
  mail: {
    attachmentName: "Vrelo-Bauplan-Kurierdienste.pdf",
    readerSubject: "Dein Bauplan für Kurierdienste",
    readerClose: "Fang mit dem Selbstcheck auf Seite 2 an, dafür reicht ein Stift.",
    internalPrefix: "Kurier-Bauplan angefordert",
  },
  pdfPath: "/bauplan/kurier-bauplan-a98e5ef1.pdf",
  template: "content/bauplan/kurier-bauplan.html",
  pages: 8,
  knownTools: [
    "eCourier", "Opal", "meC", "Logistiqo", "xRouten", "Spoke Dispatch", "Circuit for Teams",
    "YellowFox", "Webfleet", "DKV Mobility",
    "Lexware Office", "Lexware", "sevDesk", "DATEV", "Excel", "Google Sheets",
    "WhatsApp", "WhatsApp Business", "Telegram",
  ],
  // Exactly "Verifizierte Schnittstellen" in 11.7, plus Telegram via the n8n Telegram node.
  // Not here on purpose: eCourier and Opal (API for large customers only, no public docs),
  // YellowFox (on request only), WhatsApp (not checked).
  verifiedInterfaces: [
    "Logistiqo", "xRouten", "Spoke Dispatch", "Webfleet", "DKV Mobility",
    "Lexware Office", "sevDesk", "DATEV", "Google Calendar", "Telegram",
  ],
};
