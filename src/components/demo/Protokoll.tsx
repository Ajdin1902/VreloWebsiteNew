"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoSeed } from "@/lib/demo/seed";
import type { ChatMessage } from "@/lib/demo/prompt";
import { type Terminnotiz } from "@/lib/demo/summary";

function isEmptyNotiz(n: Terminnotiz): boolean {
  return !n.name && !n.anliegen && !n.termin && n.offenePunkte.length === 0 && !n.email;
}

function MailVorschau({ notiz }: { notiz: Terminnotiz }) {
  const anrede = notiz.name ? `Guten Tag ${notiz.name},` : "Guten Tag,";
  const terminSatz = notiz.termin
    ? `Ihr Termin am ${notiz.termin} ist bestätigt.`
    : "Ihr Termin ist bestätigt.";
  return (
    <div className="mt-4 rounded-xl border border-faden bg-papier p-5 text-left">
      <p className="text-xs uppercase tracking-wide text-stumm">Bestätigungsmail (Vorschau)</p>
      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex gap-2">
          <dt className="text-stumm">An:</dt>
          <dd className="text-tinte">{notiz.email}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-stumm">Betreff:</dt>
          <dd className="text-tinte">Ihr Termin – Bestätigung</dd>
        </div>
      </dl>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-tinte">
        {`${anrede}\n${terminSatz} Wir freuen uns auf das Gespräch.`}
      </p>
      <p className="mt-3 text-xs text-stumm">In der Live-Version wird diese Bestätigung automatisch versendet.</p>
    </div>
  );
}

type State = { status: "loading" } | { status: "ready"; notiz: Terminnotiz | null };

export function Protokoll({ calLink, seed, transcript }: { calLink: string | undefined; seed: DemoSeed; transcript: ChatMessage[] }) {
  const [state, setState] = useState<State>({ status: "loading" });

  const cardRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // The reveal replaces the chat card in place, so the browser keeps the scroll
  // position from the bottom of a long conversation – the summary would render
  // above the viewport and go unseen. Pull the card into view and hand focus to
  // its heading so the phase change is announced rather than merely visual.
  // Both APIs are optional-called: jsdom has no scrollIntoView, and matchMedia
  // is absent in some non-browser renderers.
  // Runs once: the reveal is a terminal phase, it never re-mounts.
  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    cardRef.current?.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "start" });
    // preventScroll: focusing an element scrolls it into view by default, which
    // would cut the smooth scroll short.
    headingRef.current?.focus({ preventScroll: true });
  }, []);

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

  // scroll-mt-24 must sit on the element the browser actually scrolls to.
  // /demo keeps the site chrome and its header is `sticky top-0`, so a
  // scroll-margin on an ancestor would do nothing.
  return (
    <div ref={cardRef} className="card-depth scroll-mt-24 rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl text-tinte focus:outline-none">
        Das hat dein Kunde gerade erlebt.
      </h2>
      <p className="mt-3 max-w-prose text-stumm">
        Antwort in Sekunden, rund um die Uhr, qualifiziert, Termin gebucht – und genau das landet automatisch als Terminnotiz bei dir.
      </p>

      {state.status === "loading" ? (
        <p className="mt-6 text-sm text-stumm">Einen Moment – ich fasse das Gespräch zusammen …</p>
      ) : notiz ? (
        <>
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
              {notiz.email ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-stumm">E-Mail</dt>
                  <dd className="text-tinte">{notiz.email}</dd>
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
          {notiz.email ? <MailVorschau notiz={notiz} /> : null}
        </>
      ) : (
        <p className="mt-6 text-sm text-tinte">Termin gebucht &amp; protokolliert.</p>
      )}

      <a href="/kontakt" className="cta-fx mt-8 inline-block rounded-lg bg-tiefes-wasser px-6 py-3 text-papier">
        Genau das für deinen Betrieb – lass uns reden
      </a>

      {transcript.length > 0 ? (
        <details className="mt-6 rounded-xl border border-faden bg-papier p-4 text-left">
          <summary className="cursor-pointer text-sm font-medium text-tiefes-wasser">
            Gespräch nachlesen
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {transcript.map((m, i) => (
              <div key={i} className="rounded-xl bg-gletscher/30 px-4 py-2">
                <span className="block text-xs uppercase tracking-wide text-stumm">
                  {m.role === "user" ? "Kunde" : "Assistent"}
                </span>
                <span className="whitespace-pre-line leading-relaxed text-tinte">{m.content}</span>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
