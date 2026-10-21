"use client";
// src/components/ratgeber/KategorieFilter.tsx
import { Fragment, useState, type ReactNode } from "react";

export type FilterItem = { key: string; kategorie?: string; card: ReactNode };

const ALLE = "Alle";

// The filter row above the Ratgeber list (Ajdin 2026-10-20). The cards are
// rendered on the server (they read the article module, which uses fs) and
// arrive here as nodes; this component only decides which ones show. Without
// JavaScript every article stays visible under „Alle“.
export function KategorieFilter({ kategorien, items }: { kategorien: string[]; items: FilterItem[] }) {
  const [active, setActive] = useState(ALLE);
  const options = [
    { label: ALLE, count: items.length },
    ...kategorien.map((k) => ({ label: k, count: items.filter((i) => i.kategorie === k).length })),
  ].filter((o) => o.count > 0);
  const shown = active === ALLE ? items : items.filter((i) => i.kategorie === active);

  return (
    <div>
      <div role="group" aria-label="Nach Thema filtern" className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = o.label === active;
          return (
            <button
              key={o.label}
              type="button"
              aria-pressed={on}
              onClick={() => setActive(o.label)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier ${
                on ? "bg-tiefes-wasser text-papier" : "border border-faden text-tinte hover:border-vrelo-petrol hover:text-vrelo-petrol"
              }`}
            >
              {o.label}
              <span className={`ml-2 font-normal ${on ? "text-gletscher" : "text-stumm"}`}>{o.count}</span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {shown.length} Artikel
      </p>
      <div className="mt-6">
        {shown.map((i) => (
          // Fragment, not a wrapper: the cards' first:border-t-0 needs them as siblings.
          <Fragment key={i.key}>{i.card}</Fragment>
        ))}
      </div>
    </div>
  );
}
