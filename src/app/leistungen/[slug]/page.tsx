// src/app/leistungen/[slug]/page.tsx
//
// One template, seven services (spec 2026-10-01 §4): Hero → Pain → Proof →
// Example → (audit card / note) → CTA → „Mehr dazu“. All copy comes from
// src/lib/leistungenPages.ts.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { ProzessAudit } from "@/components/leistungen/ProzessAudit";
import { PainBlock } from "@/components/leistungen/page/PainBlock";
import { ProofBlock } from "@/components/leistungen/page/ProofBlock";
import { ExampleBlock } from "@/components/leistungen/page/ExampleBlock";
import { NoteBlock } from "@/components/leistungen/page/NoteBlock";
import { RelatedLinks } from "@/components/leistungen/page/RelatedLinks";
import { leistungenPages, getLeistungPage } from "@/lib/leistungenPages";
import { getArticleBySlug, draftsVisible } from "@/lib/ratgeber";
import { breadcrumbLd, serviceLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

type Params = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return leistungenPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const page = getLeistungPage(slug);
  if (!page) return {};
  return {
    title: page.title,
    description: page.metaDescription,
    alternates: { canonical: canonical(`/leistungen/${page.slug}`) },
    openGraph: { title: page.title, description: page.metaDescription },
  };
}

/** Ratgeber links for the „Mehr dazu“ line: unknown slugs and hidden drafts drop out. */
export function relatedArticles(slugs: string[], showDrafts: boolean): { slug: string; title: string }[] {
  return slugs.flatMap((s) => {
    try {
      const a = getArticleBySlug(s);
      return a.draft && !showDrafts ? [] : [{ slug: a.slug, title: a.title }];
    } catch {
      return [];
    }
  });
}

export default async function LeistungSubpage({ params }: Params) {
  const { slug } = await params;
  const page = getLeistungPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero title={page.title} lead={page.subline} src={page.heroImage} />
      <PainBlock pain={page.pain} />
      <ProofBlock proof={page.proof} />
      <ExampleBlock example={page.example} />
      {page.auditCard ? (
        <Section id="prozess-audit" tone="paper" className="scroll-mt-24">
          <Reveal>
            <ProzessAudit />
          </Reveal>
        </Section>
      ) : null}
      {page.note ? <NoteBlock note={page.note} /> : null}
      <ClosingCta heading={page.cta.heading} lead={page.cta.lead} src={page.cta.src} primary={page.cta.kind} />
      <RelatedLinks articles={relatedArticles(page.related, draftsVisible())} />
      <JsonLd data={serviceLd(page)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Leistungen", path: "/leistungen" },
          { name: page.title, path: `/leistungen/${page.slug}` },
        ])}
      />
    </>
  );
}
