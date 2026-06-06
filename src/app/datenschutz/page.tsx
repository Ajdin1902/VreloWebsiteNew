import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { JsonLd } from "@/components/JsonLd";
import { datenschutz } from "@/lib/legal/datenschutz";
import { breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("/datenschutz") },
  title: "Datenschutz",
  description: "Datenschutzerklärung von Vrelo — wie deine Daten verarbeitet werden.",
};

export default function DatenschutzPage() {
  return (
    <>
      <LegalPage doc={datenschutz} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }, { name: "Datenschutz", path: "/datenschutz" }])} />
    </>
  );
}
