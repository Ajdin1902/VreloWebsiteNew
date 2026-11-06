// src/app/vorlagen/page.tsx
// Public hub for the free assets (2026-11-06). Gifts, so no ClosingCta: the
// Baupläne carry their own offer, the header carries the Prozess-Check.
// All copy: src/lib/vorlagen.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";
import { VORLAGEN_PATH, vorlagenPage as c } from "@/lib/vorlagen";

export const metadata: Metadata = {
  alternates: { canonical: canonical(VORLAGEN_PATH) },
  title: c.meta.title,
  description: c.meta.description,
};

export default function VorlagenPage() {
  return (
    <>
      <CompactHero eyebrow={c.hero.eyebrow} title={c.hero.title} line={c.hero.line} image="/images/bg-karst-quelle.webp" />
      <Section>
        <ul className="grid gap-6 md:grid-cols-2">
          {c.items.map((v) => (
            <li key={v.id} id={v.id} className="card-depth flex flex-col rounded-2xl border border-faden bg-papier p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-stumm">{v.umfang}</p>
              <h2 className="mt-2 text-balance text-2xl font-semibold text-tiefes-wasser">{v.titel}</h2>
              <p className="mt-3 flex-1 text-pretty">{v.text}</p>
              <Link
                href={v.link.href}
                className="mt-6 inline-flex self-start rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2"
              >
                {v.link.text}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Vorlagen", path: VORLAGEN_PATH }])} />
    </>
  );
}
