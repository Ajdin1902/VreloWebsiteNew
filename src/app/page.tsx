import { Hero } from "@/components/Hero";
import { Problem } from "@/components/home/Problem";
import { WasIchBaue } from "@/components/home/WasIchBaue";
import { Werkzeuge } from "@/components/home/Werkzeuge";
import { Steps } from "@/components/home/Steps";
import { Proof } from "@/components/home/Proof";
import { Referenzen } from "@/components/home/Referenzen";
import { MerakClose } from "@/components/home/MerakClose";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { professionalServiceLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: canonical("") },
};

export default function Home() {
  return (
    <>
      <Hero />
      <Problem />
      <WasIchBaue />
      <Werkzeuge />
      <Steps />
      <Proof />
      <Referenzen />
      <MerakClose />
      <JsonLd data={professionalServiceLd()} />
      <JsonLd data={breadcrumbLd([{ name: "Start", path: "/" }])} />
    </>
  );
}
