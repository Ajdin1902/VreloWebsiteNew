export type LegalSection = { heading: string; body: string };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

export const impressum: LegalDoc = {
  title: "Impressum",
  intro:
    "Entwurf — bitte vor Veröffentlichung rechtlich prüfen lassen. Angaben gemäß § 5 DDG.",
  sections: [
    {
      heading: "Anbieter",
      body: "[Platzhalter: Vor- und Nachname]\n[Platzhalter: Straße und Hausnummer]\n[Platzhalter: PLZ und Ort]\nDeutschland",
    },
    {
      heading: "Kontakt",
      body: "E-Mail: [Platzhalter: E-Mail-Adresse]\nTelefon: [Platzhalter: optional]",
    },
    {
      heading: "Umsatzsteuer-ID",
      body: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: [Platzhalter: falls vorhanden]",
    },
    {
      heading: "Verantwortlich für den Inhalt",
      body: "[Platzhalter: Name], Anschrift wie oben.",
    },
    {
      heading: "EU-Streitschlichtung",
      body: "Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: [https://ec.europa.eu/consumers/odr](https://ec.europa.eu/consumers/odr). Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.",
    },
    {
      heading: "Haftung für Inhalte",
      body: "Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen.",
    },
    {
      heading: "Haftung für Links",
      body: "Diese Seite enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte ist stets der jeweilige Anbieter verantwortlich.",
    },
    {
      heading: "Urheberrecht",
      body: "Die durch den Seitenbetreiber erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht.",
    },
  ],
};
