import { WARTUNG_HINWEIS, WARTUNG_PREIS_ZUSATZ, wartungPreis, wartungTiers, wartungZeilen, type WartungTier } from "@/lib/wartung";

// The three Wartung tiers side by side with their prices (Ajdin 2026-11-11:
// details and prices as a table, so the differences read at a glance). A real
// table from md up; below md the same content stacks as one card per tier, so
// the page never scrolls sideways. Standard is the tier to push: it carries the
// sunlit column and the petrol frame, no „beliebt“ label (that would be a claim).
// The last row (Ergebnis) is set bolder: it is where the reader decides.
// A cell with several lines renders as bullets, a single line as plain text.
const hervor = (t: WartungTier) => t.id === "standard";

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
            {wartungZeilen.map((z, i) => {
              const last = i === wartungZeilen.length - 1;
              return (
                <tr key={z.id}>
                  <th scope="row" className="border-t border-faden py-4 pr-4 align-top text-sm font-semibold text-tiefes-wasser">
                    {z.label}
                  </th>
                  {wartungTiers.map((t) => (
                    <td
                      key={t.id}
                      className={`border-t border-faden px-5 py-4 align-top text-pretty ${z.id === "ergebnis" ? "font-semibold text-tiefes-wasser" : "text-tinte"} ${
                        hervor(t) ? `border-x-2 border-x-vrelo-petrol bg-sonnenlicht ${last ? "rounded-b-2xl border-b-2 border-b-vrelo-petrol" : ""}` : ""
                      }`}
                    >
                      <Zelle items={t.zeilen[z.id]} />
                    </td>
                  ))}
                </tr>
              );
            })}
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
              {wartungZeilen.map((z) => (
                <div key={z.id}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-stumm">{z.label}</dt>
                  <dd className={`mt-1 text-pretty ${z.id === "ergebnis" ? "font-semibold text-tiefes-wasser" : "text-tinte"}`}>
                    <Zelle items={t.zeilen[z.id]} />
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <p className="mt-8 max-w-3xl text-pretty text-tinte">{WARTUNG_HINWEIS}</p>
    </>
  );
}
