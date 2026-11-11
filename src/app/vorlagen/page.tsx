// src/app/vorlagen/page.tsx
// Public hub for the free assets (2026-11-06), the site's front door since
// 2026-11-11: every primary CTA lands here with ?src=, which SrcLink passes on
// to the card pages. Gifts, so no ClosingCta; one quiet line names the free next step.
// All copy: src/lib/vorlagen.ts.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SrcLink } from "@/components/vorlagen/SrcLink";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";
import {
  VORLAGEN_GRUPPEN,
  VORLAGEN_PATH,
  vorlagenPage as c,
} from "@/lib/vorlagen";

export const metadata: Metadata = {
  alternates: { canonical: canonical(VORLAGEN_PATH) },
  title: c.meta.title,
  description: c.meta.description,
};

const cardButton =
  "mt-6 inline-flex self-start rounded-lg bg-amber px-5 py-2.5 text-sm font-semibold text-tiefes-wasser transition-colors hover:bg-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2";

export default function VorlagenPage() {
  return (
    <>
      <CompactHero
        eyebrow={c.hero.eyebrow}
        title={c.hero.title}
        line={c.hero.line}
        image="/images/bg-karst-quelle.webp"
      />
      <Section>
        {VORLAGEN_GRUPPEN.map((g) => {
          const items = c.items.filter((v) => v.gruppe === g.id);
          return items.length === 0 ? null : (
            <div key={g.id} className="mt-12 first:mt-0">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-vrelo-petrol">
                {g.titel}
              </h2>
              <ul className="mt-4 grid gap-6 md:grid-cols-2">
                {items.map((v) => (
                  <li
                    key={v.id}
                    id={v.id}
                    className="card-depth flex flex-col rounded-2xl border border-faden bg-papier p-6 md:p-8"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-stumm">
                      {v.umfang}
                    </p>
                    <h3 className="mt-2 text-balance text-2xl font-semibold text-tiefes-wasser">
                      {v.titel}
                    </h3>
                    <p className="mt-3 flex-1 text-pretty">{v.text}</p>
                    {/* A file needs a plain <a>: <Link> routes /vorlagen/x.pdf client-side into /vorlagen/[slug] → 404. */}
                    {v.link.href.endsWith(".pdf") ? (
                      <a href={v.link.href} className={cardButton}>
                        {v.link.text}
                      </a>
                    ) : (
                      <Suspense
                        fallback={
                          <Link href={v.link.href} className={cardButton}>
                            {v.link.text}
                          </Link>
                        }
                      >
                        <SrcLink href={v.link.href} className={cardButton}>
                          {v.link.text}
                        </SrcLink>
                      </Suspense>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <p className="mt-14 text-pretty text-lg text-tinte">
          {c.weiter.text}{" "}
          <Link
            href={c.weiter.link.href}
            className="rounded-sm font-semibold text-vrelo-petrol underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2"
          >
            {c.weiter.link.text}
          </Link>
        </p>
      </Section>
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Vorlagen", path: VORLAGEN_PATH },
        ])}
      />
    </>
  );
}
