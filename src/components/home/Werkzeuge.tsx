import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";

// Clears the silent "do I have to switch the tools I already use?" objection.
// Deliberately NOT a logo carousel (Ruhe vor Hype) and NO real logos
// (trademark/UWG risk) — tool *names* only. Grouped clusters so it reads as
// considered. Rendered on the deepest tone (`cool` / tiefes-wasser) -- one step
// DARKER than the vrelo-petrol WasIchBaue above and Steps below -- so the three
// dark sections read as one calm deep stretch with gentle tonal seams, instead of
// a bright light band flashing between two darks (the old `tint` treatment read as
// harsh dark->light->dark). Tool chips lift as faint gletscher-tinted tiles. Every
// tool has a public API, so "works with your tools" stays honest.
const clusters: { label: string; tools: string[] }[] = [
  { label: "E-Mail & Kalender", tools: ["Outlook", "Gmail", "Google Kalender"] },
  { label: "CRM & Kontakte", tools: ["onOffice", "HubSpot", "Pipedrive"] },
  { label: "Aufgaben & Ablage", tools: ["ClickUp", "Notion", "Google Sheets"] },
  { label: "Rechnung & Buchhaltung", tools: ["sevDesk", "lexoffice", "DATEV"] },
];

export function Werkzeuge() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      {/* Spine A "die Quelle": a karst spring — ripples spreading from a single drop in
          clear turquoise water between pale limestone, warm light on the left stone. It
          is a bright image, so it needs a slightly heavier tiefes-wasser tint (0.75) than
          the deep neighbours for the small chip tiles to stay AA where they cross the
          bright stone (worst chip gletscher 4.95:1, labels 6.8:1, heading papier 11:1
          measured). Labels/chips stay gletscher (light) as on the other deep sections. */}
      <SectionBackdrop src="/images/bg-werkzeuge.webp" tintRgb="10 37 56" tintOpacity={0.75} />
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
        {/* One small amber accent — the recurring warm 10% element that threads the
            sections together (echoes the amber step-badges in the Steps section). */}
        <Reveal delayMs={120} className="mx-auto mt-8 h-[3px] w-12 rounded-full bg-amber">{null}</Reveal>
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
                className="min-h-[2lh] text-sm font-medium uppercase tracking-wide text-gletscher"
              >
                {cluster.label}
              </p>
              <ul aria-labelledby={labelId} className="mt-3 grid gap-2">
                {cluster.tools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-xl border border-gletscher/25 bg-gletscher/10 px-4 py-2.5 text-center text-gletscher"
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
        className="mx-auto mt-10 max-w-2xl text-center text-sm text-stein"
      >
        Und viele weitere – wenn dein Werkzeug eine Schnittstelle hat, lässt es sich
        meist anbinden.
      </Reveal>
    </Section>
  );
}
