import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { impressum } from "@/lib/legal/impressum";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/impressum") },
  title: "Impressum",
  description: "Impressum und Anbieterkennzeichnung von Vrelo.",
};

export default function ImpressumPage() {
  return (
    <>
      <LegalPage doc={impressum} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Impressum", path: "/impressum" }])} />
    </>
  );
}
