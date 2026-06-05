import type { LegalDoc } from "./impressum";

export const datenschutz: LegalDoc = {
  title: "Datenschutzerklärung",
  intro:
    "Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen. Diese Erklärung informiert über die Verarbeitung personenbezogener Daten auf dieser Website.",
  sections: [
    {
      heading: "Verantwortlicher",
      body: "Verantwortlich im Sinne der DSGVO:\n[Platzhalter: Name, Anschrift, E-Mail] (siehe Impressum).",
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
      body: "[Platzhalter: wird mit dem Newsletter ergänzt.]",
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
