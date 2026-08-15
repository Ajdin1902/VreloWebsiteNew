import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { CTAButton } from "@/components/CTAButton";

const steps = [
  { num: "1", title: "Hinschauen", desc: "Wir finden gemeinsam die Aufgaben, die dich täglich Zeit kosten." },
  { num: "2", title: "Bauen", desc: "Ich baue daraus eine saubere, dokumentierte Quelle." },
  { num: "3", title: "Fließen", desc: "Die Arbeit läuft von selbst – still im Hintergrund." },
];

export function Steps() {
  return (
    <Section tone="cool" className="relative isolate overflow-hidden">
      {/* Spine A "the source": a karst spring gorge, a light shaft falling into a still
          deep pool between rock walls — the last deep beat before the surface breaks at
          Proof below. The image is dark, so it sits on the deep tiefes-wasser tone under
          a 0.7 tint (matching the other deep-image sections) — light text clears AA on
          the darkest patch (heading sonnenlicht ~5:1, intro gletscher; the glass step
          cards read papier 5.54:1 / gletscher body 5.04:1 measured over the bright pool).
          The cards are faint gletscher tiles like Problem / Was-ich-baue, so the whole
          deep stretch shares one card vocabulary instead of a bright panel here. */}
      <SectionBackdrop src="/images/bg-steps.webp" tintRgb="10 37 56" tintOpacity={0.7} />

      {/* Centered spine: intro on the spine, the three cards keep their grid + left text. */}
      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-sonnenlicht md:text-4xl">
          In drei klaren Schritten.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-gletscher">
          Der erste Schritt ist klein – den Rest übernehme ich.
        </Reveal>
      </div>
      <Reveal as="ol" delayMs={160} className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.num} className="card-depth rounded-2xl border border-gletscher/25 bg-gletscher/10 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber font-serif text-lg italic text-tiefes-wasser">
              {s.num}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-papier">{s.title}</h3>
            <p className="mt-2 text-gletscher">{s.desc}</p>
          </li>
        ))}
      </Reveal>
      {/* Mid-page CTA: "der erste Schritt ist klein" is the moment a reader asks
          how to start — offer the start right here instead of only at the close. */}
      <Reveal delayMs={240} className="mt-10 text-center">
        <CTAButton href="/kontakt" variant="primary" />
        <p className="mt-3 text-sm text-gletscher">
          Kostenloses Erstgespräch – 30 Minuten, unverbindlich.
        </p>
      </Reveal>
    </Section>
  );
}
