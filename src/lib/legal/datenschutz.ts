import type { LegalDoc } from "./impressum";

export const datenschutz: LegalDoc = {
  title: "Datenschutzerklärung",
  intro:
    "Diese Erklärung informiert über die Verarbeitung personenbezogener Daten auf dieser Website und bei der Kontaktaufnahme per E-Mail. Stand: November 2026.",
  sections: [
    {
      heading: "Verantwortlicher",
      body: "Verantwortlich im Sinne der DSGVO:\nAjdin Dzafic\nDietrich-Bonhoeffer-Straße 2\n93055 Regensburg\nE-Mail: kontakt@vrelo-ki.de\n(vollständige Angaben siehe Impressum).",
    },
    {
      heading: "Hosting",
      body: "Diese Website wird bei Vercel gehostet. Beim Aufruf werden technisch notwendige Server-Logs (u. a. IP-Adresse, Zeitpunkt, abgerufene Seite) verarbeitet. Dabei können Daten in die USA übertragen werden. Rechtsgrundlage ist das berechtigte Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
    },
    {
      heading: "Reichweitenmessung (Vercel Web Analytics)",
      body: "Um zu sehen, welche Seiten aufgerufen werden, nutze ich Vercel Web Analytics. Der Dienst arbeitet ohne Cookies und ohne Wiedererkennung über mehrere Websites hinweg. Es wird kein Profil über dich gebildet und nichts auf deinem Gerät gespeichert. Aus technischen Angaben deines Aufrufs (u. a. IP-Adresse und Browser-Kennung) bildet Vercel einen anonymen Kennwert, der täglich wechselt; die IP-Adresse selbst wird nicht gespeichert. Anbieter ist die Vercel Inc.; dabei können Daten in die USA übertragen werden. Rechtsgrundlage ist das berechtigte Interesse an einer einfachen, datensparsamen Auswertung der Seitennutzung (Art. 6 Abs. 1 lit. f DSGVO).",
    },
    {
      heading: "Kontaktformular",
      body: "Wenn du das Kontaktformular nutzt, verarbeite ich die von dir angegebenen Daten (Name, E-Mail-Adresse, Nachricht und optional dein Betrieb), um deine Anfrage zu beantworten. Der Versand der E-Mail erfolgt über den Dienstleister Resend (Auftragsverarbeiter). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. f DSGVO. Die Daten werden gelöscht, sobald sie für die Bearbeitung nicht mehr erforderlich sind.",
    },
    {
      heading: "Prozess-Check",
      body: [
        // COPY: Ajdin approves (shortened 2026-11-25)
        "Der Fragebogen unter /prozess-check läuft in deinem Browser. Erst wenn du dir den Vorab-Fahrplan schicken lässt, verarbeite ich Name, Firma, E-Mail-Adresse, Telefonnummer, deine Antworten und optional deine Website. Daraus erstelle ich deinen Vorab-Fahrplan als PDF. Ich schicke ihn dir über Resend (Auftragsverarbeiter) per E-Mail und mir eine Kopie mit deinen Angaben. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
        "Mit dem Haken „Ja, ruf mich dafür an.“ willigst du ein, dass ich dich einmal anrufe. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Du kannst jederzeit widerrufen, etwa per E-Mail an kontakt@vrelo-ki.de. Wortlaut und Zeitpunkt deiner Einwilligung halte ich als Nachweis fest.",
        "KI-Recherche: Eine KI recherchiert, was deine Programme von Haus aus können. Gibst du deine Website an, liest die KI sie dabei aus. Dafür schicke ich nur Firmenname, Programmnamen, deine Antworten und deine Website über meine Automatisierungs-Software n8n (Server bei der Hetzner Online GmbH, Auftragsverarbeiter) an die Anthropic PBC (USA). Name, E-Mail-Adresse und Telefonnummer bekommen weder n8n noch Anthropic. Grundlage der Übermittlung sind die EU-Standardvertragsklauseln (SCC), die in den Commercial Terms von Anthropic enthalten sind. Anthropic nutzt über die Programmierschnittstelle (API) übermittelte Daten nicht zum Training seiner Modelle und löscht sie standardmäßig nach spätestens 30 Tagen. Bis zum Versand lege ich deine Anfrage bei Upstash (Auftragsverarbeiter, Serverstandort EU/Frankfurt) ab, höchstens 2 Stunden. Auf meinem Server speichere ich zu jedem Lauf einen Eintrag ohne Kontaktdaten und ohne Antworten und lösche ihn nach 30 Tagen. Schlägt ein Lauf fehl, bleiben deine Antworten höchstens drei Tage im Fehlerprotokoll. Die Ergebnisse der KI zu Programmen lege ich in einer Programmbibliothek ab; Programmnamen, die sie nicht finden konnte, lösche ich nach 30 Tagen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.",
        "Missbrauchsschutz: Über Upstash zähle ich Anfragen mit Hashwerten deiner E-Mail- und IP-Adresse; die Adressen selbst speichere ich dort nicht. Die Zähler laufen nach 30 Tagen (E-Mail) bzw. 24 Stunden (IP) ab. Rechtsgrundlage ist mein berechtigtes Interesse an einem sicheren Betrieb (Art. 6 Abs. 1 lit. f DSGVO).",
        "Speicherung: Die Kopie an mich bewahre ich bei meinen übrigen E-Mails auf (siehe „E-Mail-Kontakt“). Alles andere lösche ich, sobald es nicht mehr nötig ist.",
      ].join("\n\n"),
    },
    {
      heading: "Bauplan-PDF anfordern",
      body: "Auf den Bauplan-Seiten unter Vorlagen und auf einzeln verschickten Bauplan-Links kannst du das PDF anfordern. Dafür verwende ich deine E-Mail-Adresse einmalig, um dir das PDF zu schicken und mich selbst zu benachrichtigen. Einen Newsletter oder ein Profiling gibt es dazu nicht. Der Versand erfolgt über den Dienstleister Resend (Auftragsverarbeiter). Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Die Adresse bewahre ich zusammen mit den übrigen eingehenden E-Mails auf (siehe „E-Mail-Kontakt“).",
    },
    {
      heading: "E-Mail-Kontakt",
      body: "Wenn du mir eine E-Mail schreibst (auch über das Kontaktformular), werden eingehende E-Mails mit KI-Unterstützung sortiert und zusammengefasst; dazu werden sie an die Anthropic PBC (USA) übermittelt. Kontaktdaten und wichtige Angaben aus der E-Mail speichere ich in Notion (Notion Labs, Inc., USA). Beide sind Auftragsverarbeiter; Grundlage der Übermittlung in die USA sind die EU-Standardvertragsklauseln (SCC). Jede Antwort prüfe und versende ich selbst. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und lit. f DSGVO.",
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
      body: "Du kannst dich für meinen Newsletter anmelden. Dabei verarbeite ich deine E-Mail-Adresse, um dir die Inhalte zuzusenden. Die Anmeldung erfolgt im Double-Opt-In-Verfahren: Nach der Eingabe erhältst du eine E-Mail mit einem Bestätigungslink; erst nach deiner Bestätigung wird deine Adresse in die Empfängerliste aufgenommen. Vorher wird nichts gespeichert. Rechtsgrundlage ist deine Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Der Versand und die Verwaltung der Empfängerliste erfolgen über den Dienstleister Resend (Auftragsverarbeiter). Du kannst deine Einwilligung jederzeit widerrufen, über den Abmeldelink in jeder Newsletter-E-Mail. Danach wird deine Adresse aus der Empfängerliste entfernt.",
    },
    {
      heading: "Interaktive Demo (/demo)",
      body: "Auf der Seite /demo kannst du unverbindlich eine interaktive Demo der „Termin-Quelle“ ausprobieren: Du spielst dabei selbst einen möglichen Kunden und unterhältst dich mit einem KI-Terminassistenten. Die Demo ist eine Simulation zu Anschauungszwecken. Eine echte Terminbuchung findet nicht statt.\n\nVerarbeitete Daten: die Angaben, die du selbst eingibst, eine kurze Beschreibung deines Betriebs oder, optional, die Adresse deiner Website, die dann automatisch ausgelesen und zusammengefasst wird, sowie die Nachrichten, die du im Chat schreibst. Aus dem Gesprächsverlauf wird am Ende eine kurze „Terminnotiz“ erzeugt und dir angezeigt.\n\nKI-Verarbeitung: Zur Erzeugung der Antworten und der Terminnotiz werden diese Eingaben an die Anthropic PBC (USA) übermittelt und dort verarbeitet. Dabei werden Daten in die USA übertragen; Grundlage der Übermittlung sind die EU-Standardvertragsklauseln (SCC), die in den Commercial Terms von Anthropic enthalten sind. Anthropic nutzt über die Programmierschnittstelle (API) übermittelte Daten nicht zum Training seiner Modelle.\n\nMissbrauchsschutz: Zur Begrenzung von Missbrauch (etwa zu häufiger Anfragen) wird deine IP-Adresse in pseudonymisierter Form (als Hashwert) kurzzeitig verarbeitet und dafür über den Dienstleister Upstash (Auftragsverarbeiter, Serverstandort EU/Frankfurt) gezählt.\n\nSpeicherung: Die Gesprächsinhalte und die Terminnotiz werden nur für die Dauer deiner Sitzung in deinem Browser angezeigt und auf meinen Systemen nicht dauerhaft gespeichert.\n\nRechtsgrundlage ist mein berechtigtes Interesse, dir die Leistung anschaulich und sicher vorzuführen (Art. 6 Abs. 1 lit. f DSGVO). Die Nutzung der Demo ist freiwillig. Bitte gib dort keine sensiblen personenbezogenen Daten ein.",
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
