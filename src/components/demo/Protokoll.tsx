"use client";

import { useEffect, useState } from "react";
import type { DemoSeed } from "@/lib/demo/seed";
import type { ChatMessage } from "@/lib/demo/prompt";
import { type Terminnotiz } from "@/lib/demo/summary";

function isEmptyNotiz(n: Terminnotiz): boolean {
  return !n.name && !n.anliegen && !n.termin && n.offenePunkte.length === 0;
}

type State = { status: "loading" } | { status: "ready"; notiz: Terminnotiz | null };

export function Protokoll({ calLink, seed, transcript }: { calLink: string | undefined; seed: DemoSeed; transcript: ChatMessage[] }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/demo/summary", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ seed, messages: transcript }),
        });
        if (!res.ok) throw new Error("summary failed");
        const notiz = (await res.json()) as Terminnotiz;
        if (!alive) return;
        setState({ status: "ready", notiz: isEmptyNotiz(notiz) ? null : notiz });
      } catch {
        // Fail-safe: degrade to transcript-only, never break the reveal.
        if (alive) setState({ status: "ready", notiz: null });
      }
    })();
    return () => {
      alive = false;
    };
    // Run once on mount – seed/transcript are the frozen end-of-chat snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notiz = state.status === "ready" ? state.notiz : null;

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <h2 className="font-serif text-2xl text-tinte">Das hat dein Kunde gerade erlebt.</h2>
      <p className="mt-3 max-w-prose text-stumm">
        Antwort in Sekunden, rund um die Uhr, qualifiziert, Termin gebucht – und genau das landet automatisch als Terminnotiz bei dir.
      </p>

      {state.status === "loading" ? (
        <p className="mt-6 text-sm text-stumm">Einen Moment – ich fasse das Gespräch zusammen …</p>
      ) : notiz ? (
        <div className="mt-6 rounded-xl border border-faden bg-papier p-5 text-left">
          <h3 className="font-serif text-lg text-tinte">Terminnotiz</h3>
          <dl className="mt-3 space-y-2 text-sm">
            {notiz.name ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-stumm">Name</dt>
                <dd className="text-tinte">{notiz.name}</dd>
              </div>
            ) : null}
            {notiz.anliegen ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-stumm">Anliegen</dt>
                <dd className="text-tinte">{notiz.anliegen}</dd>
              </div>
            ) : null}
            {notiz.termin ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-stumm">Termin</dt>
                <dd className="text-tinte">{notiz.termin}</dd>
              </div>
            ) : null}
            {notiz.offenePunkte.length > 0 ? (
              <div>
                <dt className="text-xs uppercase tracking-wide text-stumm">Offene Punkte</dt>
                <dd>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-tinte">
                    {notiz.offenePunkte.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : (
        <p className="mt-6 text-sm text-tinte">Termin gebucht &amp; protokolliert.</p>
      )}

      {transcript.length > 0 ? (
        <div className="mt-6 flex flex-col gap-2 text-left">
          {transcript.map((m, i) => (
            <div key={i} className="rounded-xl bg-gletscher/30 px-4 py-2">
              <span className="block text-xs uppercase tracking-wide text-stumm">{m.role === "user" ? "Kunde" : "Assistent"}</span>
              <span className="whitespace-pre-line leading-relaxed text-tinte">{m.content}</span>
            </div>
          ))}
        </div>
      ) : null}

      <a href="/kontakt" className="cta-fx mt-8 inline-block rounded-lg bg-tiefes-wasser px-6 py-3 text-papier">
        Genau das für deinen Betrieb – lass uns reden
      </a>
      {calLink ? <p className="mt-3 text-xs text-stumm">15 Minuten, unverbindlich.</p> : null}
    </div>
  );
}
