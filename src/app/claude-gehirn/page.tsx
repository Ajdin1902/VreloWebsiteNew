// src/app/claude-gehirn/page.tsx
//
// The Claude-Gehirn gift page (spec 2026-10-03 §7). Ungated, no CTA in the
// body, no ClosingCta: the site header is the only chrome that sells.
// Short by decision (Ajdin 2026-10-03): title, then the prompt in the first
// screen, then three small sections. No image hero, so the prompt stays on top.
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

export default function GehirnPage() {
  const prompt = getGehirnPrompt();
  return (
    <>
      <section className="bg-papier text-tinte">
        <div className="mx-auto max-w-3xl px-6 pb-16 pt-12 md:pb-20 md:pt-16">
          <h1 className="text-balance text-4xl font-semibold text-tiefes-wasser md:text-5xl">{c.top.title}</h1>
          <p className="mt-4 text-pretty text-lg">{c.top.line}</p>
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
      </section>

      <Section tint>
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{c.anleitung.heading}</h2>
          <p className="mt-4">{c.anleitung.voraussetzungen}</p>
          <ol className="mt-4 list-decimal space-y-2 pl-6">
            {c.anleitung.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
          <p className="mt-4">{c.anleitung.tipp}</p>
          <p className="mt-4 text-stumm">{c.anleitung.ordner}</p>
        </div>
      </Section>

      <Section tone="paper">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{c.danach.heading}</h2>
          <p className="mt-4">{c.danach.body}</p>

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
