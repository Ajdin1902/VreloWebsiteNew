import { Section } from "@/components/Section";
import { SectionBackdrop } from "@/components/SectionBackdrop";
import { Reveal } from "@/components/Reveal";

const values = [
  {
    title: "Ein Ansprechpartner.",
    body: "Du redest immer mit mir. Kein Team, keine Tickets, keine Warteschleife.",
  },
  {
    title: "Praxiserprobt.",
    body: "Seit über drei Jahren automatisiere ich professionell Prozesse. Diese Erfahrung bekommst du in jedem System.",
  },
  {
    title: "Maßgeschneidert statt von der Stange.",
    body: "Ein System, das zu deinem Betrieb passt, bis ins Detail dokumentiert.",
  },
  {
    title: "Du wartest nichts.",
    body: "Einrichten, absichern, am Laufen halten. Das übernehme ich, du musst nichts lernen.",
  },
];

export function Proof() {
  return (
    <Section tone="warm" className="relative isolate overflow-hidden">
      {/* Spine A "surface break": the ascent reaches sunlit water — a real river
          catching low sun over stones, "Fließen". This is where the page finally
          breaks the surface after the long deep climb, then hands off warm-to-warm into
          the MerakClose sunset below. Medium-toned image under a sonnenlicht tint (0.55)
          — dark text clears AA on the darkest patch (heading vs tiefes-wasser 4.26:1,
          body vs tinte 4.81:1 measured). The heading is navy rather than ember because
          ember washes out on the bright stone highlights; the warm honey cards are
          opaque, so their ember/tinte text is unaffected by the image. */}
      <SectionBackdrop src="/images/bg-proof.webp" tintRgb="244 228 193" tintOpacity={0.55} />
      {/* Soft sunlit glow behind the heading spine — a feathered warm radial (like the
          MerakClose scrim, but localised so the Fließen surface stays visible). It lifts
          the top band under the deep-espresso #33210f heading without a heavy full-cover
          tint. ⚠️ It MUST carry a negative z (-z-[5], above the tint at -z-10, below the
          static content): the glow is position:absolute, so with z-index:auto it paints
          in the positioned phase — AFTER the static heading — and its translucent
          sonnenlicht veiled the settled heading (crisp during the Reveal transform, hazy
          once transform:none dropped it below the glow). -z-[5] keeps it a backdrop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-2/3 -z-[5] bg-[radial-gradient(60%_55%_at_50%_16%,color-mix(in_oklab,var(--color-sonnenlicht)_80%,transparent),transparent_72%)]"
      />

      {/* Centered spine: heading + connector on the central axis. Ember heading + tinte
          connector mirror the MerakClose pairing below. */}
      <div className="mx-auto max-w-[44rem] text-center">
        {/* Deep espresso brown (not the oklab ember/tinte mix, which came out muddy and
            washed over the bright water highlights). #33210f holds 4.19:1 even over the
            brightest patch with no glow, so it reads uniformly dark across the whole
            heading while staying warm — the cold tiefes-wasser navy would break the warm
            hand-off into MerakClose. */}
        <Reveal as="h2" delayMs={0} className="text-balance text-3xl font-semibold tracking-tight text-[#33210f] md:text-4xl">
          Sorgfältig gebaut. Verlässlich im Betrieb.
        </Reveal>
        <Reveal as="p" delayMs={80} className="mt-5 text-pretty text-lg text-tinte">
          Worauf du dich verlassen kannst:
        </Reveal>
      </div>

      {/* Frosted papier glass cards: the light-surface twin of the deep sections' faint
          gletscher tiles — the flowing water glows through, ember titles 4.2:1 / tinte
          body 11.5:1 measured over bg-papier/70. */}
      <Reveal as="ul" delayMs={160} className="mx-auto mt-10 grid max-w-3xl gap-5 text-left sm:grid-cols-2">
        {values.map((v) => (
          <li key={v.title} className="card-depth rounded-2xl border border-papier/50 bg-papier/70 p-6 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-ember">{v.title}</h3>
            <p className="mt-2 text-tinte">{v.body}</p>
          </li>
        ))}
      </Reveal>
    </Section>
  );
}
