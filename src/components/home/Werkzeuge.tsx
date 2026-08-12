import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";

// Clears the silent "do I have to switch the tools I already use?" objection.
// Deliberately NOT a logo carousel (Ruhe vor Hype) and NO real logos
// (trademark/UWG risk) — tool *names* only. Grouped clusters so it reads as
// considered. Rendered on a light `tint` surface (Papier cards lift off it,
// Proof's trick) to break the WasIchBaue→Steps petrol run into a clean
// petrol→light→petrol alternation. Every tool has a public API, so "works with
// your tools" stays honest.
const clusters: { label: string; tools: string[] }[] = [
  { label: "E-Mail & Kalender", tools: ["Outlook", "Gmail", "Google Kalender"] },
  { label: "CRM & Kontakte", tools: ["onOffice", "HubSpot", "Pipedrive"] },
  { label: "Aufgaben & Ablage", tools: ["ClickUp", "Notion", "Google Sheets"] },
  { label: "Rechnung & Buchhaltung", tools: ["sevDesk", "lexoffice", "DATEV"] },
];

export function Werkzeuge() {
  return (
    <Section tint>
      {/* Centered spine: heading + subline on the central axis. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal
          as="h2"
          delayMs={0}
          className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl"
        >
          Läuft mit den Werkzeugen, die du schon nutzt.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
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
                // Reserve two line-heights so a label that wraps (e.g. "Rechnung
                // & Buchhaltung") doesn't push its cards below the other clusters'
                // — all card rows start on the same level.
                className="min-h-[2lh] text-sm font-medium uppercase tracking-wide text-stumm"
              >
                {cluster.label}
              </p>
              <ul aria-labelledby={labelId} className="mt-3 grid gap-2">
                {cluster.tools.map((tool) => (
                  <li
                    key={tool}
                    className="card-depth rounded-xl border border-faden bg-papier px-4 py-2.5 text-center text-tinte"
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
        className="mx-auto mt-10 max-w-2xl text-center text-sm text-stumm"
      >
        Und viele weitere – wenn dein Werkzeug eine Schnittstelle hat, lässt es sich
        meist anbinden.
      </Reveal>
    </Section>
  );
}
