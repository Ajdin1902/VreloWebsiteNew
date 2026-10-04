// src/app/claude-gehirn/page.tsx
//
// The Claude-Gehirn gift page (spec 2026-10-03 §7). Ungated, no CTA in the
// body, no ClosingCta: the site header is the only chrome that sells.
// Layout by Ajdin (2026-10-04): title, requirements and a short prompt box in the
// first screen (no image hero) with the vision band peeking in, then three bands:
// setup + tutorial video · where the folder lives + how it is built · what to
// keep in mind + honest notes.
// All copy: src/lib/claudeGehirnPage.ts; the prompt: content/claude-gehirn/prompt.txt.
import type { Metadata } from "next";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { withBrandWords } from "@/components/BrandWord";
import { PromptBox } from "@/components/claude-gehirn/PromptBox";
import { gehirnPage as c } from "@/lib/claudeGehirnPage";
import { getGehirnPrompt } from "@/lib/claudeGehirn";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/claude-gehirn") },
  title: c.meta.title,
  description: c.meta.description,
  openGraph: { title: c.meta.title, description: c.meta.description },
};

const h2 = "text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl";
const dot = "mt-[0.6em] size-1.5 shrink-0 rounded-full bg-amber";

export default function GehirnPage() {
  const prompt = getGehirnPrompt();
  const [colOrt, ...cols] = c.speicherort.columns;
  return (
    <>
      <section className="bg-papier text-tinte">
        {/* px-6 outside max-w-3xl, like Section, so every band shares one text column. */}
        <div className="mx-auto max-w-3xl box-content px-6 pb-10 pt-12 md:pb-12 md:pt-16">
          <h1 className="text-balance text-4xl font-semibold text-tiefes-wasser md:text-5xl">{c.top.title}</h1>
          <p className="mt-4 text-pretty text-lg">{c.top.line}</p>
          <div className="mt-6">
            <p className="text-sm font-semibold uppercase tracking-wide text-stumm">{c.top.voraussetzungenLabel}</p>
            <ul className="mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-6">
              {c.top.voraussetzungen.map((v) => (
                <li key={v} className="flex gap-2">
                  <span aria-hidden="true" className={dot} />
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <PromptBox
              text={prompt}
              boxLabel={c.prompt.boxLabel}
              copyLabel={c.prompt.copyLabel}
              copiedLabel={c.prompt.copiedLabel}
              failedLabel={c.prompt.failedLabel}
              hintLabel={c.prompt.hintLabel}
            />
          </div>
        </div>
      </section>

      {/* Own band with less top padding than Section, so its heading shows in the first screen. */}
      <section className="bg-tiefes-wasser text-gletscher">
        <div className="mx-auto max-w-3xl box-content px-6 py-14 md:py-16">
          <h2 className="text-balance text-2xl font-semibold text-papier md:text-3xl">{c.vision.heading}</h2>
          <ul className="mt-5 space-y-2">
            {c.vision.items.map((i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className={dot} />
                <span>{i}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xl font-semibold text-honig md:text-2xl">{c.vision.ziel}</p>
          <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-stein">{c.vision.fragenLabel}</p>
          <ul className="mt-3 grid gap-3 md:grid-cols-3">
            {c.vision.fragen.map((f) => (
              <li key={f} className="rounded-xl bg-vrelo-petrol/60 p-4 font-medium text-papier">
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-8">{c.vision.ich}</p>
        </div>
      </section>

      <Section tint>
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{c.anleitung.heading}</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-6">
            {c.anleitung.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <figure className="mt-8">
            {/* A tutorial, not decoration: the reader starts it, can pause and scrub. */}
            <video
              src={c.anleitung.video.src}
              poster={c.anleitung.video.poster}
              aria-label={c.anleitung.video.label}
              controls
              muted
              playsInline
              preload="none"
              width={1600}
              height={852}
              className="h-auto w-full rounded-2xl bg-tiefes-wasser shadow-deepwater"
            />
            <figcaption className="mt-3 text-sm text-stumm">{c.anleitung.video.caption}</figcaption>
          </figure>
        </div>
      </Section>

      <Section tone="paper">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{c.speicherort.heading}</h2>
          {/* A real table from md up; below it every row becomes a card with inline labels. */}
          <table className="mt-6 block w-full text-left md:table md:border-collapse">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-faden">
                {c.speicherort.columns.map((col) => (
                  <th key={col} scope="col" className="py-3 pr-4 text-sm font-semibold uppercase tracking-wide text-stumm">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="block space-y-4 md:table-row-group md:space-y-0">
              {c.speicherort.rows.map((r) => (
                <tr
                  key={r.ort}
                  className="block rounded-2xl border border-faden bg-lichtpapier p-5 md:table-row md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent md:p-0"
                >
                  <th scope="row" className="block pb-2 font-semibold text-tiefes-wasser md:table-cell md:w-1/5 md:py-4 md:pr-4 md:align-top">
                    <span className="sr-only">{colOrt}: </span>
                    {r.ort}
                  </th>
                  {[r.vorteile, r.nachteile, r.wann].map((cell, i) => (
                    <td key={cols[i]} className="block py-1 md:table-cell md:py-4 md:pr-4 md:align-top">
                      <span className="font-semibold md:hidden">{cols[i]}: </span>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm text-stumm">{c.speicherort.fussnote}</p>

          <h2 className={`${h2} mt-16`}>{c.ordner.heading}</h2>
          <p className="mt-4">{c.ordner.intro}</p>
          <div className="mt-6 rounded-2xl bg-tiefes-wasser p-6 text-gletscher md:p-8">
            <p className="font-mono font-semibold text-papier">{c.ordner.root}</p>
            <ul className="ml-2 mt-3 space-y-3 border-l border-gletscher/40 pl-5">
              {c.ordner.tree.map((e) => (
                <li key={e.name} className="flex flex-col sm:flex-row sm:gap-4">
                  <code className="font-mono font-semibold text-papier sm:w-32 sm:shrink-0">{e.name}</code>
                  <span>{e.note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tint>
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{c.beachten.heading}</h2>
          <ul className="mt-4 space-y-2">
            {c.beachten.items.map((i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className={dot} />
                <span>{i}</span>
              </li>
            ))}
          </ul>

          <h2 className={`${h2} mt-12`}>{c.gutZuWissen.heading}</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            {c.gutZuWissen.items.map((i) => <li key={i}>{i}</li>)}
          </ul>

          <p className="mt-12 text-sm text-stumm">{withBrandWords(c.hinweis)}</p>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: c.top.title, path: "/claude-gehirn" },
        ])}
      />
    </>
  );
}
