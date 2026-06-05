// src/components/kontakt/SchedulerEmbed.tsx
"use client";

import { useState } from "react";
import Cal from "@calcom/embed-react";

export function SchedulerEmbed({ calLink }: { calLink: string | undefined }) {
  const [open, setOpen] = useState(false);

  if (!calLink) {
    return (
      <div className="rounded-lg border border-faden bg-gletscher/30 p-8 text-center">
        <p className="font-serif text-xl text-tiefes-wasser">Online-Terminbuchung folgt in Kürze.</p>
        <p className="mt-2 text-stumm">Schreib mir so lange einfach über das Formular unten.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="rounded-lg border border-faden bg-gletscher/30 p-8 text-center">
        <p className="font-serif text-xl text-tiefes-wasser">Lieber direkt sprechen?</p>
        <p className="mt-2 text-stumm">Buch dir ein unverbindliches Kennenlern-Gespräch.</p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex items-center justify-center rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-amber"
        >
          Termin anzeigen
        </button>
        <p className="mt-3 text-xs text-stumm">
          Beim Klick wird der Kalender von Cal.com geladen.
        </p>
      </div>
    );
  }

  return <Cal calLink={calLink} style={{ width: "100%", height: "100%", overflow: "scroll" }} />;
}
