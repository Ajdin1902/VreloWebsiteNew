import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ReferenzCard } from "@/components/referenzen/ReferenzCard";
import { referenzen } from "@/lib/referenzen";

export function Referenzen() {
  return (
    <Section tone="paper">
      <Reveal>
        <p className="text-sm font-medium uppercase tracking-wider text-stumm">Aus echten Betrieben</p>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          Zwei Betriebe, zwei Aufgaben weniger.
        </h2>
        <p className="mt-5 max-w-2xl text-pretty text-lg text-tinte">
          Zwei Beispiele aus laufenden Systemen – anonym, aber echt. So sieht es aus, wenn eine
          wiederkehrende Aufgabe vom Tisch ist.
        </p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {referenzen.map((r) => (
            <li key={r.slug}>
              <ReferenzCard referenz={r} variant="full" />
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
