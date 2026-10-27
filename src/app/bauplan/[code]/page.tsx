import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BauplanPage } from "@/components/bauplan/BauplanPage";
import { isBauplanCode } from "@/lib/bauplan";
import { bauplanPage } from "@/lib/bauplanPage";

export const metadata: Metadata = {
  title: "Bauplan für Agenturen",
  robots: { index: false, follow: false },
};

// The code is read from the env per request, so rotating it needs no rebuild.
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!isBauplanCode(code)) notFound();
  return <BauplanPage data={bauplanPage} />;
}
