// src/components/kontakt/SchedulerEmbed.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Cal from "@calcom/embed-react";

// Vrelo's Cal.com account (ajdin-dzafic-vrelo) lives on the default cal.com
// origin — the EU cal.eu host 404s this account, so we pin cal.com explicitly.
// The slug itself comes from NEXT_PUBLIC_CAL_LINK.
const CAL_ORIGIN = "https://cal.com";

// Sits on the petrol water above the form card: on-dark text, amber CTA. Cal's
// iframe loads only after the click, so there's no third-party request on page
// load (keeps the Datenschutz story clean).
export function SchedulerEmbed({
  calLink,
  fallbackHint = "Schreib mir so lange einfach über das Formular unten.",
  fallbackHref,
  prompt = "Lieber direkt sprechen?",
  notes,
}: {
  calLink: string | undefined;
  /** Where to send the visitor when no scheduler is configured. Defaults to the
      Kontakt page wording, where a form does sit below the embed. */
  fallbackHint?: string;
  /** Route for the fallback. Pages that have no form of their own (/makler,
      /lead-check) must pass one — otherwise the unconfigured state names a
      Kontaktformular the visitor has no way to reach. This is the Vercel
      Preview state, so it is what branch reviewers see. */
  fallbackHref?: string;
  /** The heading above the click-to-load button. Pass "" to omit it where the
      surrounding section already asks for the call (e.g. /makler). */
  prompt?: string;
  /** Prefill for Cal's "notes" booking field, e.g. `Quelle: brief-handwerk` so a
      booking from a letter batch is attributable. Short, allow-listed text only. */
  notes?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!calLink) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="font-serif text-xl text-papier md:text-2xl">Online-Terminbuchung folgt in Kürze.</p>
        <p className="mt-2 text-gletscher">
          {fallbackHref ? (
            <Link href={fallbackHref} className="underline underline-offset-4 hover:text-papier">
              {fallbackHint}
            </Link>
          ) : (
            fallbackHint
          )}
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mx-auto max-w-xl text-center">
        {prompt ? (
          <p className="font-serif text-xl text-papier md:text-2xl">{prompt}</p>
        ) : null}
        <p className={prompt ? "mt-2 text-gletscher" : "text-gletscher"}>
          Buch dir ein unverbindliches Kennenlern-Gespräch.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-vrelo-petrol focus-visible:ring-amber"
        >
          Termin anzeigen
        </button>
        <p className="mt-3 text-xs text-gletscher/80">
          Beim Klick wird der Kalender von Cal.com geladen.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-[640px] max-w-2xl overflow-hidden rounded-2xl bg-papier shadow-deepwater">
      <Cal
        calLink={calLink}
        calOrigin={CAL_ORIGIN}
        config={notes ? { theme: "light", notes } : { theme: "light" }}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
      />
    </div>
  );
}
