import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { leistungHref, type LeistungSlug, type Vergleich } from "@/lib/leistungenPages";

// Prozess- vs. KI-Automatisierung side by side, on both pages (Ajdin 2026-10-20).
// A real table from md up; below md the same rows as two cards, because three
// columns don't fit a phone. The column of the page you are on is warm, the
// other column's title links to its page.
const linkClass =
  "rounded-sm underline underline-offset-4 hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber";

function Dot() {
  return (
    <span aria-hidden className="flex h-[1lh] shrink-0 items-center">
      <span className="h-1.5 w-1.5 rounded-full bg-amber" />
    </span>
  );
}

function ColumnTitle({ col, current }: { col: Vergleich["columns"][number]; current: LeistungSlug }) {
  return col.slug === current ? (
    <>{col.title}</>
  ) : (
    <Link href={leistungHref(col.slug)} className={linkClass}>
      {col.title}
    </Link>
  );
}

export function VergleichBlock({ vergleich, current }: { vergleich: Vergleich; current: LeistungSlug }) {
  const isCurrent = (i: number) => vergleich.columns[i].slug === current;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {vergleich.heading}
        </Reveal>
        <Reveal as="div" delayMs={120} className="mt-10">
          {/* md and up: one table, labels on the left. */}
          <table className="card-depth hidden w-full table-fixed overflow-hidden rounded-2xl text-left md:table">
            <caption className="sr-only">
              {vergleich.columns[0].title} und {vergleich.columns[1].title} im Vergleich
            </caption>
            <colgroup>
              <col className="w-44" />
              <col />
              <col />
            </colgroup>
            <thead className="bg-tiefes-wasser text-papier">
              <tr>
                <td />
                {vergleich.columns.map((c) => (
                  <th key={c.slug} scope="col" className="px-6 py-5 text-lg font-semibold">
                    <ColumnTitle col={c} current={current} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-tinte/10">
              {vergleich.rows.map((r) => (
                <tr key={r.label}>
                  {/* align-baseline lines the small label up with the first line of each cell. */}
                  <th scope="row" className="bg-papier px-6 py-5 align-baseline text-xs font-semibold uppercase tracking-[0.16em] text-stumm">
                    {r.label}
                  </th>
                  {r.cells.map((c, i) => (
                    <td key={i} className={`px-6 py-5 align-baseline text-tinte ${isCurrent(i) ? "bg-sonnenlicht" : "bg-papier"}`}>
                      {/* A block, not flex, so the cell's baseline is its first text line. */}
                      <span className="relative block pl-5">
                        <span aria-hidden className="absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full bg-amber" />
                        {c}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Below md: one card per column, the same rows as labelled points. */}
          <div className="grid gap-5 md:hidden">
            {vergleich.columns.map((col, i) => (
              <section
                key={col.slug}
                aria-label={col.title}
                className={`card-depth overflow-hidden rounded-2xl ${isCurrent(i) ? "bg-sonnenlicht" : "bg-papier"}`}
              >
                <h3 className="bg-tiefes-wasser px-6 py-4 text-lg font-semibold text-papier">
                  <ColumnTitle col={col} current={current} />
                </h3>
                <ul className="divide-y divide-tinte/10 px-6">
                  {vergleich.rows.map((r) => (
                    <li key={r.label} className="py-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stumm">{r.label}</p>
                      <p className="mt-2 flex items-start gap-3 text-tinte">
                        <Dot />
                        <span>{r.cells[i]}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Reveal>

        {/* The rule of thumb: one sentence the reader can take away (Ajdin 2026-10-20). */}
        <Reveal
          as="div"
          delayMs={200}
          className="mt-8 flex flex-col items-start gap-3 rounded-2xl bg-tiefes-wasser p-6 shadow-deepwater sm:flex-row sm:items-center sm:gap-5 md:p-8"
        >
          <span className="shrink-0 rounded-full bg-amber px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-tiefes-wasser">
            Faustregel
          </span>
          <p className="text-pretty font-serif text-xl leading-snug text-papier md:text-2xl">{vergleich.faustregel}</p>
        </Reveal>

        <Reveal as="p" delayMs={280} className="mt-8 max-w-3xl text-pretty text-lg text-tinte">
          {vergleich.close}
        </Reveal>
      </div>
    </Section>
  );
}
