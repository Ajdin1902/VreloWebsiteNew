import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BauplanPage } from "@/components/bauplan/BauplanPage";
import { ElektroBauplanPage } from "@/components/bauplan/ElektroBauplanPage";
import { bauplanVariant, type BauplanVariant } from "@/lib/bauplan";
import { bauplanPage } from "@/lib/bauplanPage";
import { elektroBauplanPage } from "@/lib/elektroBauplanPage";
import { BauplanPdfForm } from "@/components/bauplan/BauplanPdfForm";
import { normalizeSource } from "@/lib/source";

const TITLE: Record<BauplanVariant, string> = {
  agentur: "Bauplan für Agenturen",
  elektro: "Bauplan für Elektrobetriebe",
};

// The title only exists for a valid code: a wrong code's 404 must not name the page.
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const robots = { index: false, follow: false };
  const variant = bauplanVariant(code);
  return variant ? { title: TITLE[variant], robots } : { robots };
}

// The code is read from the env per request, so rotating it needs no rebuild.
export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code } = await params;
  const variant = bauplanVariant(code);
  if (!variant) notFound();
  const { src } = await searchParams;
  const source = normalizeSource(src);
  if (variant === "elektro") {
    return (
      <ElektroBauplanPage
        data={elektroBauplanPage}
        form={<BauplanPdfForm source={source} code={code} copy={elektroBauplanPage.pdf.form} />}
      />
    );
  }
  return <BauplanPage data={bauplanPage} form={<BauplanPdfForm source={source} code={code} />} />;
}
