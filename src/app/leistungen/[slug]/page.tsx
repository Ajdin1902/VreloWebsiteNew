// src/app/leistungen/[slug]/page.tsx
//
// One template, four services. Slim redesign (Ajdin 2026-11-11): Hero →
// Kennst du das? → Lösung → proof → Warum ich → CTA, nothing else.
// All copy comes from src/lib/leistungenPages.ts.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { LeistungHero } from "@/components/leistungen/page/LeistungHero";
import { PainBlock } from "@/components/leistungen/page/PainBlock";
import { LoesungBlock } from "@/components/leistungen/page/LoesungBlock";
import { SzenenBlock } from "@/components/leistungen/page/SzenenBlock";
import { WarumBlock } from "@/components/leistungen/page/WarumBlock";
import { leistungenPages, getLeistungPage } from "@/lib/leistungenPages";
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
  };
}

export default async function LeistungSubpage({ params }: Params) {
  const { slug } = await params;
  const page = getLeistungPage(slug);
  if (!page) notFound();

  return (
    <>
      <LeistungHero page={page} />
      <PainBlock pain={page.pain} />
      <LoesungBlock loesung={page.loesung} />
      <SzenenBlock szenen={page.szenen} />
      <WarumBlock warum={page.warum} />
      <ClosingCta heading={page.cta.heading} lead={page.cta.lead} src={page.cta.src} primary={page.cta.kind} />
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
