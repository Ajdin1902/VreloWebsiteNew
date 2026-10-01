export type LegalSection = { heading: string; body: string };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

export const impressum: LegalDoc = {
  title: "Impressum",
  intro:
    "Angaben gemäß § 5 DDG.",
  sections: [
    {
      heading: "Anbieter",
      body: "Ajdin Dzafic\nVrelo, Prozessautomatisierung\nDietrich-Bonhoeffer-Straße 2\n93055 Regensburg\nDeutschland",
    },
    {
      heading: "Kontakt",
      body: "E-Mail: kontakt@vrelo-ki.de\nOder über das Kontaktformular auf dieser Website.",
    },
    // USt-IdNr erteilt vom BZSt (eingegangen 2026-09-16). § 5 Abs. 1 Nr. 6 DDG: Pflichtangabe, soweit vorhanden.
    {
      heading: "Umsatzsteuer-ID",
      body: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:\nDE464014191",
    },
    // Die Steuernummer gehört NICHT hierher (keine Pflichtangabe, Missbrauchsrisiko).
    {
      heading: "Verantwortlich für den Inhalt",
      body: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV (V.i.S.d.P.):\nAjdin Dzafic\nDietrich-Bonhoeffer-Straße 2\n93055 Regensburg",
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
