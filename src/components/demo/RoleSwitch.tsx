"use client";

const OPENER = "Hallo, ich interessiere mich für eine Baufinanzierung – wann hätten Sie Zeit?";

export function RoleSwitch({ onStart }: { onStart: (firstMessage: string) => void }) {
  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 text-center md:p-10">
      <h2 className="font-serif text-2xl text-tinte">Ab jetzt bist du dein eigener Kunde.</h2>
      <p className="mx-auto mt-3 max-w-prose text-stumm">
        Schreib der Termin-Quelle, als kämst du gerade neu rein – frag nach einem Termin, sei ruhig auch mal skeptisch.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        <button type="button" onClick={() => onStart(OPENER)} className="cta-fx rounded-lg bg-tiefes-wasser px-4 py-2 text-papier">
          „{OPENER}“
        </button>
        <button type="button" onClick={() => onStart("")} className="text-sm text-stumm underline">
          … oder selbst schreiben
        </button>
      </div>
    </div>
  );
}
