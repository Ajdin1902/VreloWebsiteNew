// src/components/newsletter/ConfirmResult.tsx
import Link from "next/link";
import { RippleImage } from "@/components/RippleImage";
import type { ConfirmResultData } from "@/app/newsletter/confirm";

export function ConfirmResult({ status }: { status: ConfirmResultData["status"] }) {
  if (status === "ok") {
    // The real payoff: confirmed. Calm thank-you + the interactive ripple banner.
    return (
      <>
        <div role="status" className="mx-auto max-w-xl text-center">
          <div
            aria-hidden="true"
            className="success-ring mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber/60"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-amber" />
          </div>
          <p className="font-serif text-2xl text-tiefes-wasser">Bestätigt. Du bist dabei.</p>
          <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-stumm">
            Ab jetzt fließen dir wöchentlich neue KI-Ideen ins Postfach.
          </p>
          <p className="mx-auto mt-2 max-w-[42ch] text-xs leading-relaxed text-stumm">
            Sollte eine Ausgabe im Spam-Ordner landen, verschieb sie einmal in den Posteingang. Dann kommt die nächste gleich richtig an.
          </p>
        </div>
        <RippleImage
          src="/images/newsletter-banner.webp"
          alt="Ein ruhiger, klarer Wasserlauf fließt gleichmäßig in die Ferne."
          className="mx-auto mt-10 aspect-[16/9] w-full max-w-2xl rounded-2xl shadow-deepwater ring-1 ring-gletscher/10"
          seedXFraction={0.5}
          seedYFraction={0.5}
        />
      </>
    );
  }
  if (status === "invalid") {
    return (
      <div className="mx-auto max-w-xl space-y-3 text-center">
        <p className="text-tinte">Dieser Link ist ungültig oder abgelaufen.</p>
        <Link href="/newsletter" className="inline-block text-vrelo-petrol underline underline-offset-2">
          Zur Newsletter-Anmeldung
        </Link>
      </div>
    );
  }
  return (
    <p className="mx-auto max-w-xl text-center text-tinte">
      Da ist etwas schiefgelaufen. Versuch es bitte später noch einmal.
    </p>
  );
}
