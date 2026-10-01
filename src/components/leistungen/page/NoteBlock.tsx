import { Section } from "@/components/Section";
import type { LeistungPage } from "@/lib/leistungenPages";

// A small hint above the CTA (KI-Beratung: Digitalbonus Bayern). Worded as a
// possibility in the data; this block only frames it.
export function NoteBlock({ note }: { note: NonNullable<LeistungPage["note"]> }) {
  return (
    <Section tone="paper" className="-mt-12 md:-mt-16">
      <aside aria-label={note.heading} className="card-depth mx-auto max-w-3xl rounded-2xl bg-sonnenlicht p-6 md:p-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-tiefes-wasser">{note.heading}</p>
        <p className="mt-3 text-pretty text-tinte">{note.body}</p>
        <a
          href={note.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-sm font-medium text-[#6f4a20] underline underline-offset-4 hover:text-[#4d3216] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sonnenlicht"
        >
          {note.link.label}
          <span className="sr-only"> (öffnet in neuem Tab)</span>
        </a>
      </aside>
    </Section>
  );
}
