import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BauplanPage } from "@/components/bauplan/BauplanPage";
import { isBauplanCode } from "@/lib/bauplan";
import { bauplanPage } from "@/lib/bauplanPage";
import { BauplanPdfForm } from "@/components/bauplan/BauplanPdfForm";
import { normalizeSource } from "@/lib/source";

export const metadata: Metadata = {
  title: "Bauplan für Agenturen",
  robots: { index: false, follow: false },
};

// The code is read from the env per request, so rotating it needs no rebuild.
export const dynamic = "force-dynamic";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { code } = await params;
  if (!isBauplanCode(code)) notFound();
  const { src } = await searchParams;
  return <BauplanPage data={bauplanPage} form={<BauplanPdfForm source={normalizeSource(src)} />} />;
}
