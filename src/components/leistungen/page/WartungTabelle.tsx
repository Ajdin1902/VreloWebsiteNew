import { WARTUNG_HINWEIS, WARTUNG_PREIS_ZUSATZ, wartungPreis, wartungTiers, wartungZeilen, type WartungTier } from "@/lib/wartung";

// The three Wartung tiers side by side with their prices (Ajdin 2026-11-11:
// details and prices as a table, so the differences read at a glance). A real
// table from md up; below md the same content stacks as one card per tier, so
// the page never scrolls sideways. Standard is the tier to push: it carries the
// sunlit column and the petrol frame, no beliebt label (that would be a claim).
// A cell with several lines renders as bullets, a single line as plain text.
// The last row (Ergebnis) is where the reader decides, so it closes the table
// as a dark band: the short result in honig serif, the fit sentence below.
const hervor = (t: WartungTier) => t.id === "standard";
const details = wartungZeilen.filter((z) => z.id !== "ergebnis");
const ergebnisLabel = wartungZeilen.find((z) => z.id === "ergebnis")!.label;

function Zelle({ items }: { items: string[] }) {
  if (items.length === 1) return <>{items[0]}</>;
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-4 marker:text-vrelo-petrol">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Ergebnis({ t }: { t: WartungTier }) {
  const [kurz, ...rest] = t.zeilen.ergebnis;
  return (
    <>
      <p className="font-serif text-xl italic leading-snug text-honig">{kurz}</p>
      {rest.map((s) => (
        <p key={s} className="mt-2 text-pretty text-gletscher">
          {s}
        </p>
      ))}
    </>
  );
}

function Kopf({ t }: { t: WartungTier }) {
  return (
    <>
      <span className="block text-2xl font-semibold text-tiefes-wasser">{t.name}</span>
      <span className="mt-1 block text-pretty font-serif text-lg italic leading-snug text-ember">{t.motto}</span>
      <span className="mt-3 block text-3xl font-semibold text-tiefes-wasser">{wartungPreis(t)}</span>
      <span className="block text-sm text-stumm">{WARTUNG_PREIS_ZUSATZ}</span>
      {t.grenze ? <span className="mt-2 block text-sm font-semibold text-stumm">{t.grenze}</span> : null}
    </>
  );
}

export function WartungTabelle() {
  return (
    <>
      <div className="mt-10 hidden md:block">
        <table className="w-full table-fixed border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              <td className="w-[22%]" />
              {wartungTiers.map((t) => (
                <th
                  key={t.id}
                  scope="col"
                  className={`rounded-t-2xl p-5 align-top font-normal ${hervor(t) ? "border-x-2 border-t-2 border-vrelo-petrol bg-sonnenlicht" : ""}`}
                >
                  <Kopf t={t} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {details.map((z) => (
              <tr key={z.id}>
                <th scope="row" className="border-t border-faden py-4 pr-4 align-top text-sm font-semibold text-tiefes-wasser">
                  {z.label}
                </th>
                {wartungTiers.map((t) => (
                  <td
                    key={t.id}
                    className={`border-t border-faden px-5 py-4 align-top text-pretty text-tinte ${hervor(t) ? "border-x-2 border-x-vrelo-petrol bg-sonnenlicht" : ""}`}
                  >
                    <Zelle items={t.zeilen[z.id]} />
                  </td>
                ))}
              </tr>
            ))}
            <tr data-ergebnis>
              <th scope="row" className="rounded-bl-2xl bg-tiefes-wasser py-6 pl-5 pr-4 align-top text-sm font-semibold uppercase tracking-wide text-honig">
                {ergebnisLabel}
              </th>
              {wartungTiers.map((t, i) => (
                <td
                  key={t.id}
                  className={`px-5 py-6 align-top ${
                    hervor(t) ? "rounded-b-2xl border-x-2 border-b-2 border-vrelo-petrol bg-vrelo-petrol" : "bg-tiefes-wasser"
                  } ${i === wartungTiers.length - 1 ? "rounded-br-2xl" : ""}`}
                >
                  <Ergebnis t={t} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-10 flex flex-col gap-6 md:hidden">
        {wartungTiers.map((t) => (
          <article
            key={t.id}
            data-wartung-karte
            className={`card-depth rounded-2xl p-6 ${hervor(t) ? "border-2 border-vrelo-petrol bg-sonnenlicht" : "border border-faden bg-papier"}`}
          >
            <h3>
              <Kopf t={t} />
            </h3>
            <dl className="mt-6 flex flex-col gap-4">
              {details.map((z) => (
                <div key={z.id}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stumm">{z.label}</dt>
                  <dd className="mt-1 text-pretty text-tinte">
                    <Zelle items={t.zeilen[z.id]} />
                  </dd>
                </div>
              ))}
              <div data-ergebnis className="rounded-xl bg-tiefes-wasser p-5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-honig">{ergebnisLabel}</dt>
                <dd className="mt-2">
                  <Ergebnis t={t} />
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-pretty text-tinte">{WARTUNG_HINWEIS}</p>
    </>
  );
}
