export type LegalSection = { heading: string; body: string };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

export const impressum: LegalDoc = {
  title: "Impressum",
  intro:
    "Angaben gemäß § 5 DDG.",
  sections: [
    {
      heading: "Anbieter",
      body: "Ajdin Džafić\nVrelo – Prozessautomatisierung\nDietrich-Bonhoeffer-Straße 2\n93055 Regensburg\nDeutschland",
    },
    {
      heading: "Kontakt",
      body: "E-Mail: kontakt@vrelo-ki.de\nOder über das Kontaktformular auf dieser Website.",
    },
    // USt-IdNr: beantragt, noch nicht erteilt (Stand 2026-08-16). § 5 DDG verlangt sie nur
    // „soweit vorhanden“ → Abschnitt kommt zurück, sobald der BZSt-Brief da ist:
    // { heading: "Umsatzsteuer-ID", body: "Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG: DE…" }
    // Die Steuernummer gehört NICHT hierher (keine Pflichtangabe, Missbrauchsrisiko).
    {
      heading: "Verantwortlich für den Inhalt",
      body: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV (V.i.S.d.P.):\nAjdin Džafić\nDietrich-Bonhoeffer-Straße 2\n93055 Regensburg",
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
    // Site-wide counterpart to the note on /ueber-mich (`bildhinweis` in
    // src/lib/ueber-mich.ts): that one sits where the UWG §5 risk is, this one
    // covers the rest of the site at zero conversion cost. Art. 50 Abs. 4a does
    // not compel either — reasoning in ../../../CLAUDE.md.
    // ⚠️ Naming the tools makes this go stale: re-roll imagery with a different
    // generator and this sentence has to move with it.
    {
      heading: "Bildnachweis",
      body: "Die Bild- und Videoaufnahmen auf dieser Website habe ich mit KI erzeugt: Standbilder mit Google Gemini, Videos mit Seedance und Veo. Sie zeigen keine realen Personen, Orte oder Ereignisse.",
    },
  ],
};
