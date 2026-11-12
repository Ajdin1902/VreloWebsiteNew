import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";
import { VORLAGEN_CTA, CHECK_SRC, vorlagenHref } from "@/lib/prozessCheckCta";

// The free path (Ajdin 2026-11-11): Vorlage → Gespräch → Fahrplan, shown
// before the service doors so a visitor knows what to do before what exists.
const steps = [
  {
    title: "Vorlage holen",
    body: "Nimm dir den Bauplan für deine Branche oder mach den Prozess-Check. Ohne Gespräch, ohne Kosten.",
  },
  {
    title: "Gespräch",
    body: "30 Minuten. Ich gehe deine Abläufe mit dir durch und finde die Aufgabe, die dich am meisten Zeit kostet.",
  },
  {
    title: "Fahrplan",
    body: "Ein bis zwei Werktage später hast du deinen Fahrplan: was sich automatisieren lässt und in welcher Reihenfolge. Er gehört dir, auch ohne mich.",
  },
];

// Spine A: still in the deep stretch between Problem and the doors, so the
// text-carrying band uses the featureless texture under the tiefes tint
// (subpage rule), not another seascape next to two.
export function DerWeg() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      <SectionBackdrop src="/images/section-texture.webp" tintRgb="10 37 56" tintOpacity={0.65} />
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          So fängst du an. Kostenlos.
        </Reveal>
      </div>
      <Reveal as="ol" delayMs={160} className="mx-auto mt-10 grid max-w-4xl gap-5 text-left md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="card-depth rounded-2xl border border-gletscher/25 bg-gletscher/10 p-6">
            <p className="font-serif text-3xl italic text-honig" aria-hidden="true">
              {i + 1}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-papier">{s.title}</h3>
            <p className="mt-2 text-gletscher">{s.body}</p>
          </li>
        ))}
      </Reveal>
      <Reveal delayMs={240} className="mt-10 text-center">
        <CTAButton tone="dark" href={vorlagenHref(CHECK_SRC.homeWeg)}>
          {VORLAGEN_CTA.label}
        </CTAButton>
      </Reveal>
    </Section>
  );
}
