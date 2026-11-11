import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { leistungGroups, leistungEintraege } from "@/lib/leistungenPages";

// The hub's service menu: four cards behind three doors (Prüfen · Bauen ·
// Betreiben, 2026-11-11), so the offer reads as one path rather than a list.
// On paper since the slim redesign (2026-11-11): dark cards, light text.
export function ServiceGroups() {
  return (
    <div className="flex flex-col gap-14">
      {leistungGroups.map((g) => {
        const headingId = `gruppe-${g.id}`;
        const pages = leistungEintraege(g.id);
        return (
          <Reveal key={g.id} as="section" aria-labelledby={headingId}>
            <h2 id={headingId} className="scroll-mt-24 text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl">
              {g.label}
            </h2>
            <ul className={`mt-6 grid gap-5 sm:grid-cols-2 ${pages.length === 1 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
              {pages.map((p) => (
                  <li key={p.href}>
                    <Link
                      href={p.href}
                      className="card-depth flex h-full flex-col rounded-2xl bg-tiefes-wasser p-6 text-gletscher transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-papier motion-safe:hover:-translate-y-0.5"
                    >
                      <span className="hyphens-auto text-xl font-semibold text-papier">{p.label}</span>
                      <span className="mt-2 flex-1">{p.kurz}</span>
                      <span className="mt-4 text-sm font-semibold text-honig">
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
