import Link from "next/link";
import type { KiKarte } from "@/lib/leistungenPages";

// The KI services as stations on a river from „Deine Daten“ to „Dein Team“
// (Ajdin 2026-11-12, replaces the card grid). From md the river winds down the
// middle and the stations alternate left and right; it crosses the centre
// exactly at each station, because every row is ROW tall and the path's sine
// has its zero crossings at ROW multiples. Below md it is a straight line on
// the left. Each station is one <li> carrying the anchor an old URL 308s to,
// scroll margin on the same element, never inside a Reveal. A small honig dot
// drifts down the river, motion-safe.
const ROW = 112; // px per station (md+); the label rows are half of it
const VB = 100; // viewBox units per row

function flussPfad(n: number) {
  const pts: string[] = [];
  // From the „Deine Daten“ label to the „Dein Team“ label (row centres of the half rows).
  for (let y = VB / 4; y <= VB * (n + 0.75); y += 5) {
    const x = 50 + 32 * Math.sin((Math.PI * (y - VB)) / VB);
    pts.push(`${x.toFixed(1)},${y}`);
  }
  return `M${pts.join(" L")}`;
}

export function KiFluss({ karten }: { karten: KiKarte[] }) {
  const d = flussPfad(karten.length);
  const halb = { height: ROW / 2 };
  return (
    <div data-fluss className="relative mt-8">
      {/* md+: the winding river in the middle column */}
      <svg
        aria-hidden
        viewBox={`0 0 100 ${VB * (karten.length + 1)}`}
        preserveAspectRatio="none"
        className="absolute left-1/2 top-0 hidden h-full w-36 -translate-x-1/2 md:block"
      >
        <defs>
          <linearGradient id="ki-fluss-farbe" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-gletscher)" />
            <stop offset="55%" stopColor="var(--color-vrelo-petrol)" />
            <stop offset="100%" stopColor="var(--color-tiefes-wasser)" />
          </linearGradient>
        </defs>
        <path d={d} fill="none" stroke="url(#ki-fluss-farbe)" strokeWidth={14} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path d={d} fill="none" stroke="var(--color-papier)" strokeOpacity={0.4} strokeWidth={2.5} strokeDasharray="2 12" vectorEffect="non-scaling-stroke" />
        <circle r={5} fill="var(--color-honig)" className="motion-reduce:hidden">
          <animateMotion dur="12s" repeatCount="indefinite" path={d} />
        </circle>
      </svg>
      {/* below md: a straight line on the left */}
      <div aria-hidden className="absolute bottom-0 left-[1.125rem] top-0 w-1 rounded-full bg-linear-to-b from-gletscher via-vrelo-petrol to-tiefes-wasser md:hidden" />

      <p className="relative flex items-center pl-12 font-serif text-lg italic text-vrelo-petrol md:justify-center md:pl-0" style={halb}>
        <span className="bg-papier px-2">Deine Daten</span>
      </p>
      <ul className="relative">
        {karten.map((k, i) => {
          const links = i % 2 === 0;
          return (
            <li
              key={k.id}
              id={k.id}
              className="grid scroll-mt-24 grid-cols-[2.5rem_1fr] items-start gap-x-2 md:items-center py-3 md:grid-cols-[1fr_9rem_1fr] md:gap-x-0 md:py-0 md:[height:var(--row)]"
              style={{ "--row": `${ROW}px` } as React.CSSProperties}
            >
              <span
                aria-hidden
                className="col-start-1 row-start-1 mt-1 h-5 w-5 justify-self-center md:mt-0 rounded-full border-4 border-papier bg-amber shadow-deepwater md:col-start-2"
              />
              <div className={`col-start-2 row-start-1 ${links ? "md:col-start-1 md:pr-6 md:text-right" : "md:col-start-3 md:pl-6"}`}>
                <h4 className="text-lg font-semibold text-tiefes-wasser">{k.title}</h4>
                <p className="mt-1 text-pretty text-tinte">{k.kurz}</p>
                {k.link ? (
                  <Link
                    href={k.link.href}
                    className="mt-1 inline-block text-sm font-semibold text-tiefes-wasser underline underline-offset-2 transition-colors hover:text-vrelo-petrol"
                  >
                    {k.link.label}
                  </Link>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="relative flex items-center pl-12 font-serif text-lg italic text-tiefes-wasser md:justify-center md:pl-0" style={halb}>
        <span className="bg-papier px-2">Dein Team</span>
      </p>
    </div>
  );
}
