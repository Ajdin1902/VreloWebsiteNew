// src/components/newsletter/ConfirmResult.tsx
import Link from "next/link";
import type { ConfirmResultData } from "@/app/newsletter/confirm";

export function ConfirmResult({ status }: { status: ConfirmResultData["status"] }) {
  if (status === "ok") {
    return (
      <p className="font-serif text-2xl text-ember">Bestätigt — danke! Du bist dabei.</p>
    );
  }
  if (status === "invalid") {
    return (
      <div className="space-y-3">
        <p className="text-tinte">Dieser Link ist ungültig oder abgelaufen.</p>
        <Link href="/newsletter" className="text-vrelo-petrol underline underline-offset-2">
          Zur Newsletter-Anmeldung
        </Link>
      </div>
    );
  }
  return (
    <p className="text-tinte">Da ist etwas schiefgelaufen. Versuch es bitte später noch einmal.</p>
  );
}
