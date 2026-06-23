// src/components/kontakt/SchedulerEmbed.tsx
"use client";

import { useState } from "react";
import Cal from "@calcom/embed-react";

// Vrelo's Cal.com account lives in the EU data region (cal.eu). The embed
// defaults to the cal.com origin, which would 404 the booking iframe — so we
// pin it to the EU origin. The slug itself comes from NEXT_PUBLIC_CAL_LINK.
const CAL_ORIGIN = "https://cal.eu";

// Sits on the petrol water above the form card: on-dark text, amber CTA. Cal's
// iframe loads only after the click, so there's no third-party request on page
// load (keeps the Datenschutz story clean).
export function SchedulerEmbed({ calLink }: { calLink: string | undefined }) {
  const [open, setOpen] = useState(false);

  if (!calLink) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="font-serif text-xl text-papier md:text-2xl">Online-Terminbuchung folgt in Kürze.</p>
        <p className="mt-2 text-gletscher">Schreib mir so lange einfach über das Formular unten.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <p className="font-serif text-xl text-papier md:text-2xl">Lieber direkt sprechen?</p>
        <p className="mt-2 text-gletscher">Buch dir ein unverbindliches Kennenlern-Gespräch.</p>
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
        config={{ theme: "light" }}
        style={{ width: "100%", height: "100%", overflow: "scroll" }}
      />
    </div>
  );
}
