// src/app/vorlagen/[slug]/page.tsx
// Public, indexable copies of the two Bauplan pages (2026-11-06). Same components
// and copy as /bauplan/<code>, but the form posts a public token instead of the
// secret code, and the request is attributed to ?src= (default "vorlagen").
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BauplanPage } from "@/components/bauplan/BauplanPage";
import { ReiheBauplanPage } from "@/components/bauplan/ReiheBauplanPage";
import { ElektroBauplanPage } from "@/components/bauplan/ElektroBauplanPage";
import { BauplanPdfForm } from "@/components/bauplan/BauplanPdfForm";
import { JsonLd } from "@/components/JsonLd";
import { VORLAGE_TOKEN } from "@/lib/bauplan";
import { bauplanPage } from "@/lib/bauplanPage";
import { elektroBauplanPage } from "@/lib/elektroBauplanPage";
import { isReiheSlug, reiheNischen } from "@/lib/bauplanReihe";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";
import { normalizeSource } from "@/lib/source";
import { VORLAGEN_PATH, vorlageBauplaene } from "@/lib/vorlagen";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(vorlageBauplaene).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const v = vorlageBauplaene[slug];
  if (!v) return {};
  return { alternates: { canonical: canonical(`${VORLAGEN_PATH}/${slug}`) }, title: v.title, description: v.description };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const v = vorlageBauplaene[slug];
  if (!v) notFound();
  const { src } = await searchParams;
  const source = normalizeSource(src) ?? "vorlagen";
  const token = VORLAGE_TOKEN[v.variant];
  const crumbs = breadcrumbLd([
    { name: "Start", path: "/" },
    { name: "Vorlagen", path: VORLAGEN_PATH },
    { name: v.title, path: `${VORLAGEN_PATH}/${slug}` },
  ]);
  return (
    <>
      {v.variant === "elektro" ? (
        <ElektroBauplanPage
          data={elektroBauplanPage}
          form={<BauplanPdfForm source={source} code={token} copy={elektroBauplanPage.pdf.form} />}
        />
      ) : isReiheSlug(v.variant) ? (
        <ReiheBauplanPage data={reiheNischen[v.variant]} form={<BauplanPdfForm source={source} code={token} />} />
      ) : (
        <BauplanPage data={bauplanPage} form={<BauplanPdfForm source={source} code={token} />} />
      )}
      <JsonLd data={crumbs} />
    </>
  );
}
