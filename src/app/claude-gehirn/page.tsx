// src/app/claude-gehirn/page.tsx
//
// The Claude-Gehirn gift page (spec 2026-10-03 §7). Ungated, no CTA in the
// body, no ClosingCta: the site header is the only chrome that sells.
// All copy: src/lib/claudeGehirnPage.ts; the prompt: content/claude-gehirn/prompt.txt.
import type { Metadata } from "next";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
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

const h2 = "text-balance text-3xl font-semibold md:text-4xl";
const prose = "mx-auto max-w-3xl";

export default function GehirnPage() {
  const prompt = getGehirnPrompt();
  return (
    <>
      <CompactHero eyebrow={c.hero.eyebrow} title={c.hero.title} line={c.hero.line} image={c.hero.image} />

      <Section tone="paper">
        <Reveal>
          <div className={prose}>
            <p className="text-pretty font-serif text-xl leading-relaxed md:text-2xl">{c.intro}</p>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.voraussetzungen.heading}</h2>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-lg">
              {c.voraussetzungen.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="mt-4 text-stumm">{c.voraussetzungen.hinweis}</p>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.schritte.heading}</h2>
            <ol className="mt-6 list-decimal space-y-3 pl-6 text-lg">
              {c.schritte.steps.map((s) => <li key={s}>{s}</li>)}
            </ol>
            <div className="mt-6 rounded-2xl bg-sonnenlicht p-5">
              <p>{c.schritte.tipp}</p>
              <p className="mt-3 text-sm">{c.schritte.tippHinweis}</p>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section tint>
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.ordner.heading}</h2>
            <p className="mt-4 text-lg">{c.ordner.intro}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {c.ordner.options.map((o) => (
                <article key={o.name} className="card-depth rounded-2xl bg-papier p-5">
                  <h3 className="text-lg font-semibold text-tiefes-wasser">{o.name}</h3>
                  <p className="mt-1 text-sm text-stumm">{o.wo}</p>
                  <ul className="mt-3 space-y-1">
                    {o.plus.map((p) => <li key={p}><span aria-hidden>+ </span>{p}</li>)}
                    {o.minus.map((m) => <li key={m}><span aria-hidden>− </span>{m}</li>)}
                  </ul>
                </article>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-sonnenlicht p-5">
              <h3 className="font-semibold text-tiefes-wasser">{c.ordner.unserWeg.heading}</h3>
              <p className="mt-2">{c.ordner.unserWeg.body}</p>
              <p className="mt-2">{c.ordner.fallback}</p>
            </div>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-stumm">
              {c.ordner.warnungen.map((w) => <li key={w}>{w}</li>)}
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section tone="petrol" id="prompt" className="scroll-mt-24">
        <div className={prose}>
          <h2 className={`${h2} text-papier`}>{c.prompt.heading}</h2>
          <p className="mt-4 text-lg text-gletscher">{c.prompt.lead}</p>
          <div className="mt-8">
            <PromptBox
              text={prompt}
              boxLabel={c.prompt.boxLabel}
              copyLabel={c.prompt.copyLabel}
              copiedLabel={c.prompt.copiedLabel}
              failedLabel={c.prompt.failedLabel}
            />
          </div>
        </div>
      </Section>

      <Section tone="paper">
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.ergebnis.heading}</h2>
            <pre className="mt-6 overflow-x-auto rounded-xl bg-lesepapier p-4 font-mono text-sm">{c.ergebnis.tree}</pre>
            <dl className="mt-6 space-y-4">
              {c.ergebnis.files.map((f) => (
                <div key={f.name}>
                  <dt className="font-mono font-semibold text-tiefes-wasser">{f.name}</dt>
                  <dd className="mt-1">{f.body}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Section>

      <Section tint>
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.regeln.heading}</h2>
            <p className="mt-4 text-lg">{c.regeln.lead}</p>
            <ul className="mt-8 space-y-5">
              {c.regeln.items.map((r) => (
                <li key={r.title}>
                  <p className="font-semibold text-tiefes-wasser">{r.title}</p>
                  <p className="mt-1">{r.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      <Section tone="paper">
        <Reveal>
          <div className={prose}>
            <h2 className={`${h2} text-tiefes-wasser`}>{c.alltag.heading}</h2>
            <ul className="mt-6 space-y-2 text-lg">
              {c.alltag.beispiele.map((b) => <li key={b}>{b}</li>)}
            </ul>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.nichtHinein.heading}</h2>
            <ul className="mt-6 list-disc space-y-2 pl-6 text-lg">
              {c.nichtHinein.items.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="mt-4">{c.nichtHinein.datenschutz}</p>

            <h2 className={`${h2} mt-16 text-tiefes-wasser`}>{c.fragen.heading}</h2>
            <dl className="mt-6 space-y-5">
              {c.fragen.items.map((f) => (
                <div key={f.frage}>
                  <dt className="font-semibold text-tiefes-wasser">{f.frage}</dt>
                  <dd className="mt-1">{f.antwort}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-16 text-sm text-stumm">{withBrandWords(c.hinweis)}</p>
          </div>
        </Reveal>
      </Section>

      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: c.hero.title, path: "/claude-gehirn" },
        ])}
      />
    </>
  );
}
