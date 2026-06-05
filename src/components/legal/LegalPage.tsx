import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import type { LegalDoc } from "@/lib/legal/impressum";

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageIntro eyebrow="Rechtliches" title={doc.title} lead={doc.intro} />
      <Section tone="paper">
        <div className="mx-auto max-w-2xl space-y-8">
          {doc.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-serif text-xl font-medium text-tiefes-wasser">{s.heading}</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-tinte/90">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
