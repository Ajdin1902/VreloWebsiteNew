import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { makler } from "@/lib/makler";

// Risk reversal on the warm sonnenlicht band — the page's warmest point, right
// before the close. The Gründungs-Zusage is stated once, with no countdown and
// no scarcity styling: it is a fact about where the business stands.
export function Garantie() {
  const g = makler.garantie;
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      {/* The page's "surface": the same sunlit water every subpage closes on
          (ClosingCta), here under the risk reversal because /makler ends on the
          petrol WaterSection instead. Cards are opaque papier; only the heading,
          intro and close sit on the image — measured against its darkest patch. */}
      <SectionBackdrop src="/images/bg-oberflaeche.webp" tintRgb="244 228 193" tintOpacity={0.7} />
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance font-serif text-3xl italic text-tiefes-wasser md:text-4xl">
          {g.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-tinte">{g.intro}</p>
      </div>
      <ol className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
        {g.promises.map((p, i) => (
          <Reveal
            as="li"
            key={p.title}
            delayMs={i * 80}
            className="card-depth rounded-2xl bg-papier p-6"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-vrelo-petrol text-sm font-semibold text-papier"
            >
              {i + 1}
            </span>
            <h3 className="mt-3 font-semibold text-tiefes-wasser">{p.title}</h3>
            <p className="mt-2 text-pretty leading-relaxed text-tinte">{p.body}</p>
          </Reveal>
        ))}
      </ol>
      <p className="mx-auto mt-10 max-w-[44rem] text-center text-tinte">{g.close}</p>
      <div className="card-depth mx-auto mt-10 max-w-2xl rounded-2xl bg-papier p-6 md:p-8">
        <h3 className="font-semibold text-tiefes-wasser">{g.founding.title}</h3>
        <p className="mt-2 text-pretty leading-relaxed text-tinte">{g.founding.body}</p>
      </div>
    </Section>
  );
}
