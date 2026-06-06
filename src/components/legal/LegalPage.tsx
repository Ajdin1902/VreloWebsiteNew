import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { parseInlineLinks } from "@/lib/legal/inline-links";
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
              <p className="mt-2 whitespace-pre-line leading-relaxed text-tinte/90">
                {parseInlineLinks(s.body).map((part, i) =>
                  part.type === "link" ? (
                    <a
                      key={i}
                      href={part.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-vrelo-petrol underline underline-offset-2"
                    >
                      {part.label}
                    </a>
                  ) : (
                    <span key={i}>{part.value}</span>
                  ),
                )}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
