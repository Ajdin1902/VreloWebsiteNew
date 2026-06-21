// src/app/newsletter/bestaetigt/page.tsx
import type { Metadata } from "next";
import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { ConfirmResult } from "@/components/newsletter/ConfirmResult";
import { confirmSubscription } from "@/app/newsletter/confirm";

export const metadata: Metadata = {
  title: "Newsletter bestätigen",
  description: "Bestätigung deiner Newsletter-Anmeldung.",
  robots: { index: false },
};

export default async function NewsletterConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token ? await confirmSubscription(token) : { status: "invalid" as const };
  return (
    <>
      <PageIntro title="Anmeldung bestätigen" />
      {/* Pull up under the intro (stacked paper Sections otherwise double their padding). */}
      <Section tone="paper" className="-mt-24 md:-mt-32">
        <ConfirmResult status={result.status} />
      </Section>
    </>
  );
}
