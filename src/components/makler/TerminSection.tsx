import Link from "next/link";
import { WaterSection } from "@/components/WaterSection";
import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { makler } from "@/lib/makler";

// The close. The Cal embed sits on the page itself so there is no hop between
// persuasion and booking; its iframe still loads only on click, so there is no
// third-party request on page load (the Datenschutz stance holds). The written
// route stays available underneath for anyone who would rather not book.
export function TerminSection({ calLink }: { calLink: string | undefined }) {
  const c = makler.close;
  return (
    <WaterSection className="scroll-mt-20">
      <div id="termin" className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-papier md:text-4xl">
          {c.title}
        </h2>
        <p className="mt-4 text-pretty text-lg text-gletscher">{c.body}</p>
      </div>
      <div className="mt-12">
        <SchedulerEmbed calLink={calLink} fallbackHint={c.fallbackHint} />
      </div>
      <p className="mt-8 text-center text-sm text-gletscher">
        {c.fallback.prompt}{" "}
        <Link
          href={c.fallback.href}
          className="font-medium text-papier underline decoration-amber/60 underline-offset-4 transition-colors hover:decoration-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol"
        >
          {c.fallback.label}
        </Link>
      </p>
    </WaterSection>
  );
}
