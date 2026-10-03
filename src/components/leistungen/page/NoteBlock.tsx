import Link from "next/link";
import { Section } from "@/components/Section";
import type { LeistungPage } from "@/lib/leistungenPages";

const linkClass =
  "mt-4 inline-block rounded-sm font-medium text-[#6f4a20] underline underline-offset-4 hover:text-[#4d3216] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht";

// A small hint above the CTA (KI-Beratung: Digitalbonus Bayern; Claude: the
// free Claude-Gehirn page). Worded as a possibility in the data; this block
// only frames it. External links open a new tab, internal ones stay.
export function NoteBlock({ note }: { note: NonNullable<LeistungPage["note"]> }) {
  const external = /^https?:\/\//.test(note.link.href);
  return (
    <Section tone="paper" className="-mt-12 md:-mt-16">
      <aside aria-label={note.heading} className="card-depth mx-auto max-w-3xl rounded-2xl bg-sonnenlicht p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-tiefes-wasser">{note.heading}</p>
        <p className="mt-3 text-pretty text-tinte">{note.body}</p>
        {external ? (
          <a href={note.link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {note.link.label}
            <span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
        ) : (
          <Link href={note.link.href} className={linkClass}>
            {note.link.label}
          </Link>
        )}
      </aside>
    </Section>
  );
}
