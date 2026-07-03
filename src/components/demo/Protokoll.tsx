"use client";

export function Protokoll({ calLink }: { calLink: string | undefined }) {
  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 text-center md:p-10">
      <h2 className="font-serif text-2xl text-tinte">Das hat dein Kunde gerade erlebt.</h2>
      <p className="mx-auto mt-3 max-w-prose text-stumm">
        Antwort in Sekunden, rund um die Uhr, qualifiziert, Termin gebucht – ohne dass du etwas tun musstest.
      </p>
      <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-tinte">
        <li>✓ Anfrage beantwortet</li>
        <li>✓ Qualifiziert</li>
        <li>✓ Termin gebucht &amp; protokolliert</li>
      </ul>
      <a href="/kontakt" className="cta-fx mt-8 inline-block rounded-lg bg-tiefes-wasser px-6 py-3 text-papier">
        Genau das für deinen Betrieb – lass uns reden
      </a>
      {calLink ? <p className="mt-3 text-xs text-stumm">15 Minuten, unverbindlich.</p> : null}
    </div>
  );
}
