import type { Leistung } from "@/lib/leistungen";

// A compact Baustein card for the two-column grid on /leistungen — a frosted
// glass tile on the petrol water band: a DARK tiefes-wasser fill (not a light
// one) + backdrop-blur so the water shows through, darkened, while the light text
// stays legible even over the image's bright patches. A light gletscher fill
// lightened the card and dropped the honig punchline to 2.3:1 over the bright
// sweep; tiefes-wasser/50 holds body gletscher 6.7:1, honig 5:1, papier title
// 7:1 (measured on the brightest candidate image). On-dark tokens: papier title,
// honig accents (amber is too dark on petrol), gletscher body + chips. `mt-auto`
// on the chip row pins the chips to the card foot so a grid of cards lines up.
export function LeistungCard({ leistung, index }: { leistung: Leistung; index: number }) {
  const labelId = `leistung-${leistung.slug}`;
  const number = String(index + 1).padStart(2, "0");
  return (
    <article className="card-depth flex h-full flex-col rounded-2xl bg-tiefes-wasser/50 p-6 ring-1 ring-gletscher/20 backdrop-blur-sm">
      <div className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-serif text-lg italic text-honig">
          {number}
        </span>
        <h3 id={labelId} className="text-balance text-xl font-semibold tracking-tight text-papier">
          {leistung.title}
        </h3>
      </div>
      <p className="mt-2 font-medium text-honig">{leistung.punchline}</p>
      <p className="mt-3 text-pretty text-sm leading-relaxed text-gletscher">{leistung.kurz}</p>
      <ul aria-labelledby={labelId} className="mt-auto flex flex-wrap gap-2 pt-5">
        {leistung.outcomes.map((outcome) => (
          <li
            key={outcome}
            className="rounded-full border border-gletscher/25 bg-gletscher/10 px-3 py-1 text-xs text-gletscher"
          >
            {outcome}
          </li>
        ))}
      </ul>
    </article>
  );
}
