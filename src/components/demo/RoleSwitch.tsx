"use client";

import type { DemoSeed } from "@/lib/demo/seed";

const ANLASS: Record<DemoSeed["appointmentType"], string> = {
  erstberatung: "eine Erstberatung",
  baufinanzierung: "eine Baufinanzierung",
  versicherung: "einen Versicherungs-Check",
  frei: "einen Termin",
};

function suggestedOpener(seed: DemoSeed): string {
  const anlass = ANLASS[seed.appointmentType];
  return seed.tone === "locker"
    ? `Hallo, ich interessiere mich für ${anlass} – wann hast du Zeit?`
    : `Hallo, ich interessiere mich für ${anlass} – wann hätten Sie Zeit?`;
}

export function RoleSwitch({ seed, onStart }: { seed: DemoSeed; onStart: (firstMessage: string) => void }) {
  const opener = suggestedOpener(seed);
  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 text-center md:p-10">
      <h2 className="font-serif text-2xl text-tinte">Ab jetzt bist du dein eigener Kunde.</h2>
      <p className="mx-auto mt-3 max-w-prose text-stumm">
        Schreib der Termin-Quelle, als kämst du gerade neu rein – frag nach einem Termin, sei ruhig auch mal skeptisch.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button type="button" onClick={() => onStart(opener)} className="cta-fx rounded-lg bg-tiefes-wasser px-4 py-2 text-papier">
          „{opener}“
        </button>
        <button type="button" onClick={() => onStart("")} className="text-sm text-stumm underline">
          … oder selbst schreiben
        </button>
      </div>
    </div>
  );
}
