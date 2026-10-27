import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BauplanPage } from "@/components/bauplan/BauplanPage";
import { isBauplanCode } from "@/lib/bauplan";
import { bauplanPage } from "@/lib/bauplanPage";
import { BauplanPdfForm } from "@/components/bauplan/BauplanPdfForm";
import { normalizeSource } from "@/lib/source";

// The title only exists for a valid code: a wrong code's 404 must not name the page.
export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const robots = { index: false, follow: false };
  return isBauplanCode(code) ? { title: "Bauplan für Agenturen", robots } : { robots };
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
  if (!isBauplanCode(code)) notFound();
  const { src } = await searchParams;
  return <BauplanPage data={bauplanPage} form={<BauplanPdfForm source={normalizeSource(src)} code={code} />} />;
}
