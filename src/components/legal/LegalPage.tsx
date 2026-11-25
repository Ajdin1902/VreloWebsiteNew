import { PageIntro } from "@/components/PageIntro";
import { Section } from "@/components/Section";
import { parseInlineLinks } from "@/lib/legal/inline-links";
import type { LegalDoc } from "@/lib/legal/impressum";

function Body({ text }: { text: string }) {
  return (
    <p className="mt-2 whitespace-pre-line leading-relaxed text-tinte/90">
      {parseInlineLinks(text).map((part, i) =>
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
  );
}

export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageIntro eyebrow="Rechtliches" title={doc.title} lead={doc.intro} />
      <Section tone="paper">
        <div className="mx-auto max-w-2xl space-y-8">
          {doc.sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-serif text-xl font-medium text-tiefes-wasser">{s.heading}</h2>
              <Body text={s.body} />
              {s.subsections?.map((sub) => (
                <div key={sub.heading} className="mt-5">
                  <h3 className="font-serif text-lg font-medium text-tiefes-wasser">{sub.heading}</h3>
                  <Body text={sub.body} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
