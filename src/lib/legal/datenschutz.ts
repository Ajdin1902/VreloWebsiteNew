import type { LegalDoc } from "./impressum";

export const datenschutz: LegalDoc = {
  title: "Datenschutzerklärung",
  intro:
    "Entwurf – bitte vor Veröffentlichung rechtlich prüfen lassen. Diese Erklärung informiert über die Verarbeitung personenbezogener Daten auf dieser Website.",
  sections: [
    {
      heading: "Verantwortlicher",
      body: "Verantwortlich im Sinne der DSGVO:\nAjdin Dzafic\n[Platzhalter: Anschrift]\n[Platzhalter: E-Mail]\n(vollständige Angaben siehe Impressum).",
    },
    {
      heading: "Hosting",
      body: "Diese Website wird bei Vercel gehostet. Beim Aufruf werden technisch notwendige Server-Logs (u. a. IP-Adresse, Zeitpunkt, abgerufene Seite) verarbeitet. Dabei können Daten in die USA übertragen werden. Rechtsgrundlage ist das berechtigte Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
    },
    {
      heading: "Kontaktformular",
      body: "Wenn du das Kontaktformular nutzt, verarbeite ich die von dir angegebenen Daten (Name, E-Mail-Adresse, Nachricht und optional dein Betrieb), um deine Anfrage zu beantworten. Der Versand der E-Mail erfolgt über den Dienstleister Resend (Auftragsverarbeiter). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind.",
    },
    {
      heading: "Terminbuchung (Cal.com)",
      body: "Die Online-Terminbuchung wird über Cal.com eingebunden und erst geladen, wenn du aktiv auf „Termin anzeigen“ klickst. Vorher werden keine Daten an Cal.com übertragen. Mit dem Klick willigst du in das Laden ein; dabei können Daten an die Cal.com, Inc. übermittelt werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. a und lit. b DSGVO.",
    },
    {
      heading: "Cookies",
      body: "Beim Laden der Seite werden keine Tracking-Cookies gesetzt. Externe Einbindungen (z. B. Cal.com) werden erst nach deiner aktiven Zustimmung geladen.",
    },
    {
      heading: "Newsletter",
      body: "Du kannst dich für meinen Newsletter anmelden. Dabei verarbeite ich deine E-Mail-Adresse, um dir die Inhalte zuzusenden. Die Anmeldung erfolgt im Double-Opt-In-Verfahren: Nach der Eingabe erhältst du eine E-Mail mit einem Bestätigungslink; erst nach deiner Bestätigung wird deine Adresse in die Empfängerliste aufgenommen. Vorher wird nichts gespeichert. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Der Versand und die Verwaltung der Empfängerliste erfolgen über den Dienstleister Resend (Auftragsverarbeiter). Du kannst deine Einwilligung jederzeit widerrufen – über den Abmeldelink in jeder Newsletter-E-Mail. Danach wird deine Adresse aus der Empfängerliste entfernt.",
    },
    {
      heading: "Interaktive Demo (/demo)",
      body: "Auf der Seite /demo kannst du unverbindlich eine interaktive Demo der „Termin-Quelle“ ausprobieren: Du spielst dabei selbst einen möglichen Kunden und unterhältst dich mit einem KI-Terminassistenten. Die Demo ist eine Simulation zu Anschauungszwecken – eine echte Terminbuchung findet nicht statt.\n\nVerarbeitete Daten: die Angaben, die du selbst eingibst – eine kurze Beschreibung deines Betriebs oder, optional, die Adresse deiner Website, die dann automatisch ausgelesen und zusammengefasst wird – sowie die Nachrichten, die du im Chat schreibst. Aus dem Gesprächsverlauf wird am Ende eine kurze „Terminnotiz“ erzeugt und dir angezeigt.\n\nKI-Verarbeitung: Zur Erzeugung der Antworten und der Terminnotiz werden diese Eingaben an die Anthropic PBC (USA) übermittelt und dort verarbeitet. Dabei werden Daten in die USA übertragen; Grundlage der Übermittlung sind die EU-Standardvertragsklauseln (SCC), die in den Commercial Terms von Anthropic enthalten sind. Anthropic nutzt über die Programmierschnittstelle (API) übermittelte Daten nicht zum Training seiner Modelle.\n\nMissbrauchsschutz: Zur Begrenzung von Missbrauch (etwa zu häufiger Anfragen) wird deine IP-Adresse in pseudonymisierter Form (als Hashwert) kurzzeitig verarbeitet und dafür über den Dienstleister Upstash (Auftragsverarbeiter, Serverstandort EU/Frankfurt) gezählt.\n\nSpeicherung: Die Gesprächsinhalte und die Terminnotiz werden nur für die Dauer deiner Sitzung in deinem Browser angezeigt und auf meinen Systemen nicht dauerhaft gespeichert.\n\nRechtsgrundlage ist mein berechtigtes Interesse, dir die Leistung anschaulich und sicher vorzuführen (Art. 6 Abs. 1 lit. f DSGVO). Die Nutzung der Demo ist freiwillig – bitte gib dort keine sensiblen personenbezogenen Daten ein.",
    },
    {
      heading: "Deine Rechte (Betroffenenrechte)",
      body: "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch. Außerdem hast du das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.",
    },
    {
      heading: "SSL-/TLS-Verschlüsselung",
      body: "Diese Seite nutzt aus Sicherheitsgründen eine SSL-/TLS-Verschlüsselung.",
    },
  ],
};
