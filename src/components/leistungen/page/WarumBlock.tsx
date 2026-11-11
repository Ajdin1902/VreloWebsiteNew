import Link from "next/link";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import type { WarumPunkt } from "@/lib/leistungenPages";

// „Warum ich“ (Ajdin 2026-11-11): three cards on paper. The guarantee card links
// to its conditions in the FAQ (UWG §5); nothing else here is a link.
export function WarumBlock({ warum }: { warum: WarumPunkt[] }) {
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-5xl">
        <Reveal as="h2" className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          Warum ich
        </Reveal>
        <Reveal as="ul" delayMs={120} className="mt-10 grid gap-5 md:grid-cols-3">
          {warum.map((w) => (
            <li key={w.title} className="card-depth flex flex-col rounded-2xl bg-sonnenlicht p-6 md:p-7">
              <h3 className="text-balance text-xl font-semibold text-ember">{w.title}</h3>
              <p className="mt-2 flex-1 text-pretty text-tinte">{w.body}</p>
              {w.link ? (
                <Link
                  href={w.link.href}
                  className="mt-4 text-sm text-tiefes-wasser underline underline-offset-2 transition-colors hover:text-vrelo-petrol"
                >
                  {w.link.label}
                </Link>
              ) : null}
            </li>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
