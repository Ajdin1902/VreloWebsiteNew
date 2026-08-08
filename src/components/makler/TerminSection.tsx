import { WaterSection } from "@/components/WaterSection";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { makler } from "@/lib/makler";

// The close. The Cal embed sits on the page itself so there is no hop between
// persuasion and booking; its iframe still loads only on click, so there is no
// third-party request on page load (the Datenschutz stance holds). No written
// fallback and no "Lieber direkt sprechen?" hedge — the section heading already
// asks for the call, so the visitor is led straight to booking it.
//
// scroll-mt must live on the element that actually carries id="termin" —
// CSS scroll-margin-top only applies to the anchor target itself, it is not
// inherited from an ancestor, so putting it on <WaterSection> instead would
// leave /makler#termin scrolling flush under the sticky header.
export function TerminSection({ calLink }: { calLink: string | undefined }) {
  const c = makler.close;
  return (
    <WaterSection>
      <div id="termin" className="scroll-mt-24 mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {c.title}
        </h2>
      </div>
      {/* prompt="" drops the SchedulerEmbed's own "Lieber direkt sprechen?"
          heading, which duplicates the section heading above. */}
      <div className="mt-10">
        <SchedulerEmbed calLink={calLink} fallbackHint={c.fallbackHint} fallbackHref="/kontakt" prompt="" />
      </div>
    </WaterSection>
  );
}
