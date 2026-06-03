import type { Leistung } from "@/lib/leistungen";

export function LeistungDetail({
  leistung,
  index,
}: {
  leistung: Leistung;
  index: number;
}) {
  const labelId = `leistung-${leistung.slug}`;
  const number = String(index + 1).padStart(2, "0");
  return (
    <div>
      <p aria-hidden="true" className="font-serif text-lg italic text-vrelo-petrol">
        {number}
      </p>
      <h2
        id={labelId}
        className="mt-2 text-2xl font-semibold text-tiefes-wasser md:text-3xl"
      >
        {leistung.title}
      </h2>
      <p className="mt-2 text-lg font-medium text-vrelo-petrol">{leistung.punchline}</p>
      <p className="mt-4 max-w-2xl text-tinte">{leistung.body}</p>
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
