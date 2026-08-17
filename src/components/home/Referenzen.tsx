import Link from "next/link";
import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";
import { ReferenzCard } from "@/components/referenzen/ReferenzCard";
import { referenzen } from "@/lib/referenzen";

// Homepage references: their own branded band on the warm surface, sitting in the
// continuous warm run Proof → Referenzen → MerakClose so the page holds the light
// all the way into the sunset. The bright karst-spring backdrop (a sunlit turquoise
// river over pale stones) sits under a warm sonnenlicht tint that pulls the cool
// water toward the amber register while keeping it bright and light. The two
// project cards are opaque papier proof panels; heading is the deep-espresso
// #33210f used on Proof. Eyebrow + link are a deep ember #6f4a20: the long link
// is a warm-dark element over warm-toned water, where the token ember only reaches
// ~3.9:1 — the deeper ember clears 4.7:1 (small-text AA), measured.
export function Referenzen() {
  return (
    <Section id="referenzen" tone="warm" className="relative isolate overflow-hidden scroll-mt-24">
      <SectionBackdrop src="/images/bg-karst-quelle.webp" tintRgb="244 228 193" tintOpacity={0.7} />

      <div className="mx-auto max-w-[44rem] text-center">
        <Reveal as="p" delayMs={0} className="text-sm font-semibold uppercase tracking-wider text-[#6f4a20]">
          Referenzen
        </Reveal>
        <Reveal as="h2" delayMs={80} className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[#33210f] md:text-4xl">
          So läuft es in echten Betrieben.
        </Reveal>
      </div>

      <Reveal as="ul" delayMs={160} className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {referenzen.map((r) => (
          <li key={r.slug}>
            <ReferenzCard referenz={r} variant="compact" />
          </li>
        ))}
      </Reveal>

      <Reveal as="p" delayMs={240} className="mt-10 text-center">
        <Link
          href="/leistungen#referenzen"
          className="inline-flex items-center gap-1 font-medium text-[#6f4a20] underline decoration-[#6f4a20]/40 underline-offset-4 transition hover:text-[#4d3216] hover:decoration-[#4d3216]"
        >
          Beide Projekte im Detail ansehen
          <span aria-hidden> →</span>
        </Link>
      </Reveal>

      {/* Bridge from proof to the paid entry step: a small papier card (the compact
          twin of the reference cards above) so the next step reads as an offer, not a
          footnote. Narrower + lighter padding so it sits smaller than the two proof
          cards. Opaque papier, so ember/tinte/stumm clear AA without fighting the warm
          backdrop. Honest framing — it points forward, it does not claim the two past
          projects began with an audit. */}
      <Reveal as="div" delayMs={300} className="mx-auto mt-8 max-w-md">
        <div className="card-depth rounded-2xl border border-tinte/10 bg-papier p-6 text-left">
          <p className="text-sm font-medium uppercase tracking-wider text-stumm">
            Dein erster Schritt
          </p>
          <p className="mt-2 text-pretty text-tinte">
            Im Prozess-Audit finden wir gemeinsam die eine Aufgabe, die sich bei dir zuerst lohnt.
          </p>
          <Link
            href="/leistungen#prozess-audit"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-ember underline decoration-ember/40 underline-offset-4 transition hover:text-[#4d3216] hover:decoration-[#4d3216]"
          >
            Mehr zum Prozess-Audit
            <span aria-hidden> →</span>
          </Link>
        </div>
      </Reveal>
    </Section>
  );
}
