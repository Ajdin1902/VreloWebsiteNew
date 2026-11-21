// Aufwand-Skala on /vorlagen: who does the work, from the visitor (left/top) to Ajdin (right/bottom).
// Horizontal only from lg: at md six columns are too narrow for "KI-Betriebssystem".
// All copy comes from vorlagenPage.skala; the line is decoration, the <ol> carries the order.
import Link from "next/link";
import type { vorlagenPage } from "@/lib/vorlagen";

type Skala = (typeof vorlagenPage)["skala"];

const TITLE_ID = "aufwand-skala";
const endLabel = "text-xs font-semibold uppercase tracking-wide text-stumm";
const stopLink =
  "rounded-sm font-semibold text-tiefes-wasser underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2";

export function AufwandSkala({ skala }: { skala: Skala }) {
  return (
    <div>
      <h2 id={TITLE_ID} className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">
        {skala.titel}
      </h2>
      <p className="mt-3 max-w-[44rem] text-pretty text-lg text-tinte">{skala.text}</p>
      <div className="mt-8 grid gap-4 lg:grid-cols-2 lg:gap-y-5">
        <p className={`${endLabel} lg:col-start-1 lg:row-start-1`}>{skala.links}</p>
        <ol
          aria-labelledby={TITLE_ID}
          className="relative space-y-6 border-l-2 border-amber pl-6 lg:col-span-2 lg:row-start-2 lg:grid lg:grid-cols-6 lg:gap-4 lg:space-y-0 lg:border-l-0 lg:pl-0 lg:before:absolute lg:before:inset-x-0 lg:before:top-[5px] lg:before:h-0.5 lg:before:bg-linear-to-r lg:before:from-honig lg:before:via-amber lg:before:to-ember lg:before:content-['']"
        >
          {skala.stopps.map((s) => (
            <li key={s.titel} className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-[31px] top-1.5 size-3 rounded-full bg-amber ring-4 ring-papier lg:static lg:mb-4 lg:block"
              />
              {s.href.startsWith("#") ? (
                <a href={s.href} className={stopLink}>
                  {s.titel}
                </a>
              ) : (
                <Link href={s.href} className={stopLink}>
                  {s.titel}
                </Link>
              )}
              <p className="mt-1 text-pretty text-sm text-stumm">{s.notiz}</p>
              {s.kostenlos && (
                <span className="mt-2 inline-block rounded-full border border-faden px-2 py-0.5 text-xs text-stumm">
                  {skala.kostenlosMarke}
                </span>
              )}
            </li>
          ))}
        </ol>
        <p className={`${endLabel} lg:col-start-2 lg:row-start-1 lg:text-right`}>{skala.rechts}</p>
      </div>
    </div>
  );
}
