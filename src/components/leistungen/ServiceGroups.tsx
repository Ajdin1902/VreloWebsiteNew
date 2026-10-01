import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { leistungGroups, leistungenPages, leistungHref } from "@/lib/leistungenPages";

// The hub's service menu: seven cards in three groups (Automatisieren ·
// Befähigen · Betreiben), so the offer reads as one system rather than a list.
export function ServiceGroups() {
  return (
    <div className="flex flex-col gap-14">
      {leistungGroups.map((g) => {
        const headingId = `gruppe-${g.id}`;
        return (
          <Reveal key={g.id} as="section" aria-labelledby={headingId}>
            <h2 id={headingId} className="text-2xl font-semibold tracking-tight text-papier md:text-3xl">
              {g.label}
            </h2>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {leistungenPages
                .filter((p) => p.group === g.id)
                .map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={leistungHref(p.slug)}
                      className="card-depth flex h-full flex-col rounded-2xl bg-papier p-6 text-tinte transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol motion-safe:hover:-translate-y-0.5"
                    >
                      <span className="hyphens-auto text-xl font-semibold text-tiefes-wasser">{p.navLabel}</span>
                      <span className="mt-2 flex-1">{p.kurz}</span>
                      <span className="mt-4 text-sm font-semibold text-vrelo-petrol">
                        Mehr erfahren <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>
        );
      })}
    </div>
  );
}
