import type { Leistung } from "@/lib/leistungen";

export function LeistungDetail({
  leistung,
  index,
  onDark = false,
}: {
  leistung: Leistung;
  index: number;
  onDark?: boolean;
}) {
  const labelId = `leistung-${leistung.slug}`;
  const number = String(index + 1).padStart(2, "0");
  // The card stays light; on a petrol band it goes fully opaque so the petrol
  // doesn't bleed through and muddy the papier.
  const cardBg = onDark ? "bg-papier" : "bg-papier/80";
  return (
    <div className={`card-depth rounded-2xl ${cardBg} p-6 ring-1 ring-faden md:p-8`}>
      <div className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-serif text-xl italic text-vrelo-petrol">
          {number}
        </span>
        <h2
          id={labelId}
          className="text-balance text-2xl font-semibold tracking-tight text-tiefes-wasser md:text-3xl"
        >
          {leistung.title}
        </h2>
      </div>
      <p className="mt-2 text-lg font-medium text-vrelo-petrol">{leistung.punchline}</p>
      <p className="mt-4 max-w-2xl text-pretty text-tinte">{leistung.body}</p>
      <ul aria-labelledby={labelId} className="mt-6 flex flex-wrap gap-2">
        {leistung.outcomes.map((outcome) => (
          <li
            key={outcome}
            className="rounded-full border border-faden bg-gletscher/40 px-3 py-1 text-sm text-tiefes-wasser"
          >
            {outcome}
          </li>
        ))}
      </ul>
    </div>
  );
}
