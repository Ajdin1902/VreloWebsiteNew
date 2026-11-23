// Fixed copy for the fallback Vorab-Fahrplan (spec §7.3): no research, no KI.
// Zuerst uses `lang`, with the channel variant swapped in as its first sentence;
// Danach and Später use `kurz`. Spec: docs/superpowers/specs/2026-11-23-prozess-check-v2-vorab-fahrplan-design.md
// COPY: Ajdin approves before go-live
import type { AreaId, Kanal, Menge, Wer } from "@/lib/prozessCheck";
import { CAPS } from "./content";

// `lang`: the first sentence ends at the first ". " (fallback.ts swaps it), so no
// abbreviations with a dot in the first sentence.
export const AREA_IDEE: Record<AreaId, { titel: string; lang: string; kurz: string }> = {
  anfragen: {
    titel: "Anfragen beantworten",
    lang: "Jede neue Anfrage bekommt in wenigen Minuten eine Antwort mit zwei Terminvorschlägen. Morgens siehst du nur noch die Termine, die deine Kunden bestätigt haben.",
    kurz: "Neue Anfragen bekommen in wenigen Minuten eine Antwort mit Terminvorschlägen, auch wenn du gerade beim Kunden bist.",
  },
  angebote: {
    titel: "Angebote schreiben und nachfassen",
    lang: "Du bekommst aus deinen Notizen einen Angebotsentwurf mit deinen Positionen und Preisen. Du prüfst ihn und schickst ihn ab. Antwortet der Kunde eine Woche lang nicht, bekommt er eine freundliche Nachfrage.",
    kurz: "Du bekommst aus deinen Notizen einen Angebotsentwurf. Antwortet der Kunde nicht, bekommt er nach einer Woche eine Nachfrage.",
  },
  auftraege: {
    titel: "Aufträge weitergeben",
    lang: "Aus einem neuen Auftrag wird eine fertige Arbeitsinfo mit Adresse und Aufgabe. Die richtige Person hat sie auf dem Handy, ohne dass du etwas ausdruckst oder abtippst.",
    kurz: "Neue Aufträge kommen als fertige Arbeitsinfo bei der richtigen Person an, ohne Ausdrucken und ohne Abtippen.",
  },
  rechnungen: {
    titel: "Belege und Rechnungen ablegen",
    lang: "Eingehende Rechnungen und Belege landen gelesen und zugeordnet im richtigen Ordner. Am Monatsende liegt der Stapel für deinen Steuerberater schon fertig da.",
    kurz: "Belege landen gelesen und zugeordnet im richtigen Ordner. Du tippst nichts mehr ab.",
  },
  postfach: {
    titel: "Das Postfach vorsortieren",
    lang: "Neue Mails bekommen ein Etikett wie Anfrage, Rechnung oder Werbung. Zu den Mails, die Arbeit machen, liegt morgens ein Antwortentwurf bereit, den du prüfst und abschickst.",
    kurz: "Neue Mails kommen sortiert an. Zu den wichtigen liegt ein Antwortentwurf bereit.",
  },
  daten: {
    titel: "Daten nicht mehr abtippen",
    lang: "Die Angaben aus einer neuen Nachricht stehen von selbst in deiner Liste oder deinem Programm, Feld für Feld. Du schaust nur noch hin, wenn eine Angabe fehlt.",
    kurz: "Angaben aus Mails und Formularen stehen von selbst im richtigen Programm. Du tippst sie nicht mehr ab.",
  },
  erinnern: {
    titel: "Kunden erinnern",
    lang: "Deine Kunden bekommen zur richtigen Zeit eine Erinnerung an Termine und offene Rechnungen. Morgens siehst du, wer eine Erinnerung bekommen hat und wer geantwortet hat.",
    kurz: "Deine Kunden bekommen Erinnerungen an Termine und offene Rechnungen zur richtigen Zeit, ohne dass du daran denkst.",
  },
  orga: {
    titel: "Interne Abläufe ordnen",
    lang: "Was heute auf Zetteln und per Zuruf läuft, steht an einem Ort: wer was bis wann erledigt. Wiederkehrende Aufgaben legen sich jede Woche von selbst an, du musst nicht mehr daran denken.",
    kurz: "Aufgaben stehen an einem Ort statt auf Zetteln. Wiederkehrende legen sich jede Woche von selbst an.",
  },
};

// Replaces the first sentence of AREA_IDEE[area].lang for the visitor's channel.
export const KANAL_VARIANTE: Partial<Record<AreaId, Partial<Record<Kanal, string>>>> = {
  anfragen: {
    mail: "Jede Anfrage per Mail bekommt in wenigen Minuten eine Antwort mit zwei Terminvorschlägen.",
    formular: "Wer dein Formular ausfüllt, bekommt in wenigen Minuten eine Antwort mit zwei Terminvorschlägen.",
    whatsapp: "Jede Anfrage per WhatsApp bekommt in wenigen Minuten eine Antwort mit zwei Terminvorschlägen.",
    telefon: "Wer anruft und dich nicht erreicht, bekommt eine Nachricht mit einem Link und wählt dort selbst einen Termin.",
  },
  angebote: {
    mail: "Zu jeder Anfrage per Mail liegt ein Angebotsentwurf mit deinen Positionen und Preisen für dich bereit.",
    formular: "Aus den Angaben im Formular bekommst du einen Angebotsentwurf mit deinen Positionen und Preisen.",
    telefon: "Aus deinen Notizen vom Telefonat bekommst du einen Angebotsentwurf mit deinen Positionen und Preisen.",
    papier: "Du fotografierst deinen Notizzettel und bekommst daraus einen Angebotsentwurf mit deinen Positionen und Preisen.",
  },
  auftraege: {
    mail: "Aus einem Auftrag per Mail wird eine fertige Arbeitsinfo mit Adresse und Aufgabe.",
    whatsapp: "Aus einem Auftrag per WhatsApp wird eine fertige Arbeitsinfo mit Adresse und Aufgabe.",
    telefon: "Aus deiner Notiz vom Telefonat wird eine fertige Arbeitsinfo mit Adresse und Aufgabe.",
  },
  rechnungen: {
    mail: "Rechnungen und Belege, die per Mail kommen, landen gelesen und zugeordnet im richtigen Ordner.",
    papier: "Du fotografierst einen Beleg mit dem Handy, er landet gelesen und zugeordnet im richtigen Ordner.",
  },
  daten: {
    mail: "Die Angaben aus einer Mail stehen von selbst in deiner Liste oder deinem Programm, Feld für Feld.",
    formular: "Was jemand ins Formular schreibt, steht von selbst in deiner Liste oder deinem Programm, Feld für Feld.",
    papier: "Du fotografierst den Zettel und die Angaben stehen in deiner Liste oder deinem Programm, Feld für Feld.",
  },
  erinnern: {
    mail: "Deine Kunden bekommen zur richtigen Zeit eine Mail, die sie an Termine und offene Rechnungen erinnert.",
    whatsapp: "Deine Kunden bekommen zur richtigen Zeit eine WhatsApp-Nachricht, die sie an Termine und offene Rechnungen erinnert.",
  },
  orga: {
    papier: "Was heute auf Zetteln steht, findest du an einem Ort: wer was bis wann erledigt.",
    whatsapp: "Was heute in WhatsApp-Gruppen untergeht, findest du an einem Ort: wer was bis wann erledigt.",
  },
};

// „Selbst ausprobieren“ under Zuerst. Each `quelle` is the vendor's own help page,
// opened and checked on `abgerufen`; the text names the edition or setup it needs. `programm` is the chip key (Lexoffice is sold
// as Lexware Office today). Order decides when several tips match.
export const TIPPS: { programm: string; bereich: AreaId; text: string; quelle: string; abgerufen: string }[] = [
  {
    programm: "Outlook",
    bereich: "anfragen",
    text: "Leg im klassischen Outlook eine Regel an, die Mails mit „Anfrage“ im Betreff in einen eigenen Ordner verschiebt. Dann siehst du neue Anfragen auf einen Blick.",
    quelle: "https://support.microsoft.com/de-de/office/verwalten-von-e-mail-nachrichten-mithilfe-von-regeln-in-outlook-c24f5dea-9465-4df4-ad17-a50704d66c59",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Outlook",
    bereich: "postfach",
    text: "Leg im klassischen Outlook Regeln an, die Mails bestimmter Absender in eigene Ordner verschieben, etwa Newsletter. Im Posteingang bleibt, was Arbeit macht.",
    quelle: "https://support.microsoft.com/de-de/office/verwalten-von-e-mail-nachrichten-mithilfe-von-regeln-in-outlook-c24f5dea-9465-4df4-ad17-a50704d66c59",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Gmail",
    bereich: "anfragen",
    text: "Schalte in Gmail am Computer einmal die Vorlagen ein (Einstellungen, Erweitert). Dann speicherst du deine Antwort auf Anfragen als Vorlage und fügst sie mit wenigen Klicks ein.",
    quelle: "https://support.google.com/mail/answer/14864208?hl=de",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Gmail",
    bereich: "postfach",
    text: "Leg in Gmail am Computer Filter an, die Mails bestimmter Absender mit einem Label versehen oder archivieren. Im Posteingang bleibt, was Arbeit macht.",
    quelle: "https://support.google.com/mail/answer/6579?hl=de",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Gmail",
    bereich: "erinnern",
    text: "Schreib die Erinnerung an den Kunden gleich jetzt und plane in Gmail den Versand für den passenden Tag. Gmail schickt sie dann ab, ohne dass du daran denkst.",
    quelle: "https://support.google.com/mail/answer/9214606?hl=de&co=GENIE.Platform%3DDesktop",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Google Kalender",
    bereich: "anfragen",
    text: "Leg in Google Kalender am Computer einen Terminplan an. Den Link zur Buchungsseite schickst du mit, deine Kunden wählen dort selbst einen freien Termin.",
    quelle: "https://support.google.com/calendar/answer/10729749?hl=de",
    abgerufen: "23.11.2026",
  },
  {
    programm: "WhatsApp",
    bereich: "anfragen",
    text: "Leg in der WhatsApp Business App Schnellantworten für deine häufigsten Fragen an. Im Chat holst du sie über ein Kürzel hervor, statt jedes Mal neu zu tippen.",
    quelle: "https://faq.whatsapp.com/1791149784551042/?locale=de_DE&cms_platform=android",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Word",
    bereich: "angebote",
    text: "Speichere Textblöcke, die in jedem Angebot stehen, in Word am Computer als Schnellbaustein. Beim nächsten Angebot fügst du sie mit wenigen Klicks ein.",
    quelle: "https://support.microsoft.com/de-de/office/7a527697-058f-4967-b8f1-aae0774e4813",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Lexoffice",
    bereich: "rechnungen",
    text: "Ab Tarif M machst du in Lexware Office aus einem Angebot über „Weiterführen zur Rechnung“ die Rechnung. Die Positionen übernimmt Lexware Office, du tippst nichts doppelt.",
    quelle: "https://help.lexware.de/de-form/articles/547986-rechnung-oder-teilrechnung-erstellen-schritt-fur-schritt",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Lexoffice",
    bereich: "erinnern",
    text: "Lexware Office zeigt dir überfällige Rechnungen, die du dort geschrieben hast, in einer eigenen Ansicht. Über „Mahnen“ erstellst du daraus die Zahlungserinnerung.",
    quelle: "https://help.lexware.de/de-form/articles/547985-zahlungserinnerungen-und-mahnungen-erstellen",
    abgerufen: "23.11.2026",
  },
  {
    programm: "sevDesk",
    bereich: "rechnungen",
    text: "Leite Belege von der Adresse, mit der du bei sevDesk angemeldet bist, an die Autobox-Adresse weiter. sevDesk legt sie als Entwurf an, du tippst nichts ab.",
    quelle: "https://intercom.help/sevdesk/de/articles/9453113-belege-erfassen",
    abgerufen: "23.11.2026",
  },
  {
    programm: "DATEV",
    bereich: "rechnungen",
    text: "Hat dein Steuerberater dir DATEV Belege online eingerichtet, fotografierst du Papierbelege mit der App DATEV Upload mobil und lädst sie direkt hoch.",
    quelle: "https://www.datev.de/web/de/shop/produkt-details/99881",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Excel",
    bereich: "daten",
    text: "In Excel am Computer füllt die Blitzvorschau eine Spalte nach deinem Muster aus, etwa Vor- und Nachnamen getrennt. Tipp ein Beispiel ein und wähl unter Daten die Blitzvorschau.",
    quelle: "https://support.microsoft.com/de-de/office/verwenden-der-blitzvorschau-in-excel-3f9bcf1e-db93-4890-94a0-1578341f73f7",
    abgerufen: "23.11.2026",
  },
  {
    programm: "Notion",
    bereich: "orga",
    text: "Leg in einer Notion-Datenbank eine wiederkehrende Vorlage an. Notion erstellt dann jede Woche dieselbe Aufgabenliste, ohne dass jemand daran denkt.",
    quelle: "https://www.notion.com/help/database-templates",
    abgerufen: "23.11.2026",
  },
];

// Parts of „Deine nervigste Aufgabe heute“: kommt per Mail rein · 20 bis 50 pro Woche · macht das Büro
export const KANAL_WEG: Record<Kanal, string> = {
  mail: "per Mail",
  formular: "über ein Formular",
  whatsapp: "per WhatsApp",
  telefon: "per Telefon",
  portal: "über ein Portal",
  papier: "auf Papier",
};
export const MENGE_ZEILE: Record<Menge, string> = {
  bis5: "bis 5 pro Woche",
  "5bis20": "5 bis 20 pro Woche",
  "20bis50": "20 bis 50 pro Woche",
  mehr: "mehr als 50 pro Woche",
};
export const WER_ZEILE: Record<Wer, string> = {
  ich: "machst du selbst",
  buero: "macht das Büro",
  alle: "macht jeder ein bisschen",
};

// Fixed copy of the PDF itself (spec §7.1). `{datum}` is filled in at render time.
export const PDF_UI = {
  titel: "Vorab-Fahrplan für",
  arbeitstag: "Dein Tag, in deinen Worten",
  zeit: "Wo deine Zeit hingeht",
  stunden: "Std. pro Woche",
  aufgabe: "Deine nervigste Aufgabe heute",
  start: "Wo man anfangen würde",
  mitProgrammen: "Mit deinen Programmen:",
  tipp: "Selbst ausprobieren:",
  weiter: "Was jetzt kommt",
  weiterText: "Ich rufe dich an, kläre ein paar Details, danach bekommst du deinen ausführlichen Fahrplan. Kostenlos, er gehört dir.",
  programme: "Deine Programme",
  quellen: "Quellen",
  abgerufen: "abgerufen am",
  kiFooter: "Recherchiert mit KI am {datum}. Angaben ohne Gewähr, Tarife und Funktionen ändern sich.",
  absender: "Ajdin Dzafic · vrelo-ki.de",
};

// Contact form copy (spec §6). The consent sentence is stored with every lead as proof,
// so bump CONSENT_VERSION whenever one of these strings changes. Plan 1 runs no
// research, so no KI sentence here: Plan 2 adds it back when research goes live.
// COPY: Ajdin approves
export const FORM_UI = {
  consentAnruf: "Ich rufe dich einmal an, um die Details für deinen ausführlichen Fahrplan zu klären.",
  checkbox: "Ja, ruf mich dafür an.",
};
export const CONSENT_VERSION = "pc-call-2026-11-24";
export const CONSENT_TEXT = `${FORM_UI.consentAnruf} ${FORM_UI.checkbox}`;

// Form chrome around the consent block. Not part of the consent proof.
// COPY: Ajdin approves
export const FORM_FIELDS = {
  name: "Name",
  firma: "Firma",
  email: "E-Mail",
  telefon: "Telefon",
  submit: "Vorab-Fahrplan schicken",
  pending: "Wird gesendet …",
  datenschutzPrefix: "Was mit deinen Angaben passiert, steht in der ",
  datenschutzLabel: "Datenschutzerklärung",
  datenschutzSuffix: ".",
};

// Errors the form shows (the e-mail error comes from validateEmail).
// COPY: Ajdin approves
export const FORM_ERRORS = {
  name: "Bitte gib deinen Namen an.",
  firma: "Bitte gib deine Firma an.",
  telefon: "Bitte gib eine Telefonnummer an, unter der ich dich erreiche.",
  anruf: "Bitte setz das Häkchen, damit ich dich anrufen darf.",
  tooFast: "Bitte versuch es gleich noch einmal.",
  notConfigured: "Der Versand ist gerade nicht eingerichtet. Schreib mir bitte direkt.",
  generic: "Da ist etwas schiefgelaufen. Schreib mir gern direkt.",
};

// Why the visitor mail did not go out, for the internal lead mail (Ajdin sends by hand then).
// COPY: Ajdin approves
export const CAP_GRUND: Record<"adresse" | "ip" | "tag", string> = {
  adresse: `Diese Adresse hat in den letzten ${CAPS.proAdresseTage} Tagen schon einen bekommen`,
  ip: `Mehr als ${CAPS.proIpTag} von dieser Verbindung heute`,
  tag: `Tageslimit von ${CAPS.proTag} erreicht`,
};
export const PDF_FEHLER_GRUND = "Das PDF ließ sich nicht erstellen";
export const VERSAND_FEHLER_GRUND = "Versand an den Besucher fehlgeschlagen";

// Status line and banner of the internal lead mail. `vonHand` only when the PDF or
// the visitor mail failed; a capped send gets `gesperrt` instead.
// COPY: Ajdin approves
export const LEAD_STATUS = {
  recherche: "Recherche läuft",
  fallback: "Vorab-Fahrplan aus festen Bausteinen versendet",
  nichtVersendet: "Vorab-Fahrplan nicht versendet",
  vonHand: "Schick ihn von Hand.",
  gesperrt: "Gesperrt durch Versandlimit, vermutlich kein echter Lead. Prüf kurz, bevor du reagierst.",
};
