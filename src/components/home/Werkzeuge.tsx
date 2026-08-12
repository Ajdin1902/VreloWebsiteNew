import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// Clears the silent "do I have to switch the tools I already use?" objection.
// Deliberately NOT a logo carousel (Ruhe vor Hype) and NO real logos
// (trademark/UWG risk) — tool *names* only. Grouped clusters so it reads as
// considered (and differs from WasIchBaue's flat chips directly above). Every
// tool has a public API, so "works with your tools" stays honest.
const clusters: { label: string; tools: string[] }[] = [
  { label: "E-Mail & Kalender", tools: ["Outlook", "Gmail", "Google Kalender"] },
  { label: "CRM & Kontakte", tools: ["onOffice", "HubSpot", "Pipedrive"] },
  { label: "Aufgaben & Ablage", tools: ["ClickUp", "Notion", "Google Sheets"] },
  { label: "Rechnung & Buchhaltung", tools: ["sevDesk", "lexoffice", "DATEV"] },
];

export function Werkzeuge() {
  return (
    <Section tone="petrol">
      {/* Centered spine: heading + subline on the central axis. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal
          as="h2"
          delayMs={0}
          className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl"
        >
          Läuft mit den Werkzeugen, die du schon nutzt.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-gletscher">
          Du wechselst nichts und lernst nichts Neues. Ich baue die Automatisierung
          um das herum, womit du heute schon arbeitest.
        </Reveal>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {clusters.map((cluster, i) => {
          const labelId = `werkzeuge-cluster-${i}`;
          return (
            <Reveal key={cluster.label} delayMs={160 + i * 80}>
              <p
                id={labelId}
                className="text-sm font-medium uppercase tracking-wide text-gletscher/80"
              >
                {cluster.label}
              </p>
              <ul aria-labelledby={labelId} className="mt-3 grid gap-2">
                {cluster.tools.map((tool) => (
                  <li
                    key={tool}
                    className="card-depth rounded-xl border border-gletscher/20 bg-tiefes-wasser/40 px-4 py-2.5 text-center text-gletscher"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>

      <Reveal
        as="p"
        delayMs={480}
        className="mx-auto mt-10 max-w-2xl text-center text-sm text-gletscher/80"
      >
        Und viele weitere – wenn dein Werkzeug eine Schnittstelle hat, lässt es sich
        meist anbinden.
      </Reveal>
    </Section>
  );
}
