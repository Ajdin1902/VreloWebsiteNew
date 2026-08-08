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
      {/* The result view's own heading level. Without it the outline skipped
          h1 (PageHero) → h3 („Drei Dinge"), and the headline claim below is a
          <p>, so nothing carried the result in the heading outline at all. */}
      <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">
        Deine Lead-Reaktion: <span className="text-tiefes-wasser">{SCORE_LABEL[result.score]}</span>
      </h2>

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
              Gerechnet mit {eur(result.provisionUsed)} € pro Abschluss {"–"} passt du den Wert an, wird die
              Schätzung genauer.
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

      <details className="rounded-lg border border-tiefes-wasser/15 bg-papier p-4">
        <summary className="cursor-pointer text-sm font-medium text-tiefes-wasser">Wie wir rechnen</summary>
        {!fast ? (
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-tinte">
            <li>
              {result.anfragenProJahr} Anfragen im Jahr, davon gehen nach deinen Angaben rund{" "}
              {result.currentLossPct} % verloren: {result.verloreneAnfragenProJahr} Stück.
            </li>
            <li>
              Auch ein gutes System verliert welche {"–"} wir rechnen mit 10 %, die nie erreichbar sind. Bleiben{" "}
              {result.adressierbareAnfragen}, an denen Schnelligkeit überhaupt etwas ändern kann.
            </li>
            <li>
              Davon holt eine Antwort in unter fünf Minuten erfahrungsgemäß etwa jede dritte zurück:{" "}
              {result.recoverableTermine} zusätzliche Termine.
            </li>
            <li>
              Und davon wird jeder fünfte ein Abschluss: {result.zusaetzlicheAbschluesse}.
            </li>
          </ol>
        ) : null}
        <p className="mt-3 text-sm text-tinte">
          Grundlage ist die Forschung zur Reaktionszeit bei Online-Anfragen {"–"} allen voran Harvard Business
          Review, The Short Life of Online Sales Leads (2011): jenseits der Fünf-Minuten-Marke fällt die Chance,
          einen Interessenten überhaupt noch zu erreichen und zu qualifizieren, um ein Vielfaches. Die Schätzung
          oben ist bewusst vorsichtig gerechnet: sie unterstellt weder, dass sich jede verlorene Anfrage
          zurückholen lässt, noch dass aus jedem zusätzlichen Termin ein Abschluss wird.
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
          <SchedulerEmbed
            calLink={calLink}
            fallbackHint="Schreib mir so lange einfach über das Kontaktformular."
            fallbackHref="/kontakt"
          />
        </div>
        <div className="mt-8 border-t border-papier/15 pt-6">
          <ResultEmailForm answers={answers} />
        </div>
      </div>
    </div>
  );
}
