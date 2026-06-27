// src/components/lead-check/Result.tsx
"use client";

import { SchedulerEmbed } from "@/components/kontakt/SchedulerEmbed";
import { ResultEmailForm } from "./ResultEmailForm";
import type { LeadCheckAnswers, LeadCheckResult } from "@/lib/leadCheck";

const eur = (n: number) => new Intl.NumberFormat("de-DE").format(n);

const SCORE_LABEL: Record<LeadCheckResult["score"], string> = {
  schnell: "schnell",
  solide: "solide",
  langsam: "langsam",
};

export function Result({
  answers,
  result,
  calLink,
}: {
  answers: LeadCheckAnswers;
  result: LeadCheckResult;
  calLink: string | undefined;
}) {
  const fast = result.score === "schnell";

  return (
    <div className="space-y-10">
      <p className="text-sm font-medium uppercase tracking-wider text-stumm">
        Deine Lead-Reaktion: <span className="text-tiefes-wasser">{SCORE_LABEL[result.score]}</span>
      </p>

      {fast ? (
        <p className="text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">
          Du reagierst schon schnell. Dann geht es bei der Termin-Quelle eher darum, dass das so bleibt – auch wenn mehr reinkommt.
        </p>
      ) : (
        <div>
          <p className="text-balance font-serif text-2xl text-tiefes-wasser md:text-3xl">
            Mit einer Antwort in unter 5 Minuten wären bei dir rund{" "}
            <strong>{result.zusaetzlicheAbschluesse} Abschlüsse mehr im Jahr</strong> drin {"–"} ca.{" "}
            <strong>{eur(result.eurUpside)} €</strong>. Ohne eine einzige neue Anfrage.
          </p>
          {result.provisionWasDefault ? (
            <p className="mt-3 text-sm text-stumm">
              Gerechnet mit 4.000 € pro Abschluss {"–"} passt du den Wert an, wird die Schätzung genauer.
            </p>
          ) : null}
        </div>
      )}

      {!fast ? (
        <p className="text-tinte">
          Aktuell werden rund {result.currentLossPct} % deiner Anfragen kalt, bevor daraus ein Termin wird {"–"}{" "}
          das sind ca. {result.verloreneAnfragenProJahr} im Jahr.
        </p>
      ) : null}

      <details className="rounded-lg border border-tiefes-wasser/15 bg-gletscher/30 p-4">
        <summary className="cursor-pointer text-sm font-medium text-tiefes-wasser">Wie wir rechnen</summary>
        <p className="mt-3 text-sm text-tinte">
          Grundlage ist die Lead-Response-Forschung (HBR/InsideSales): nach der Fünf-Minuten-Marke fällt die
          Chance, einen Lead zu erreichen und zu qualifizieren, um rund das Acht- bis Zehnfache. Wir rechnen bewusst
          konservativ {"–"} und selbst dann, wenn nur jeder fünfte zurückgeholte Termin zum Abschluss wird.
        </p>
      </details>

      <div>
        <h3 className="text-lg font-semibold text-tiefes-wasser">Drei Dinge, die du sofort tun kannst</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-tinte">
          <li>Eine feste Fünf-Minuten-Regel für neue Anfragen.</li>
          <li>Eine einfache Auto-Antwort, die sofort bestätigt.</li>
          <li>Eine feste Nachfass-Routine für alle, die sich nicht melden.</li>
        </ul>
        <p className="mt-3 text-sm text-stumm">
          Das Schwere ist, das <strong>konsequent</strong> zu tun {"–"} nachts, im Termin, bei jeder Anfrage.
        </p>
      </div>

      <div className="rounded-2xl bg-vrelo-petrol p-8 md:p-10">
        <p className="text-balance font-serif text-xl text-papier md:text-2xl">
          Willst du, dass das von selbst läuft – auch wenn du im Termin sitzt? Genau das ist die Termin-Quelle.
        </p>
        <div className="mt-6">
          <SchedulerEmbed calLink={calLink} />
        </div>
        <div className="mt-8 border-t border-papier/15 pt-6">
          <ResultEmailForm answers={answers} />
        </div>
      </div>
    </div>
  );
}
