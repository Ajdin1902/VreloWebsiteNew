import { Section } from "@/components/Section";
import { faqAnchor, type FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";
import { OpenFaqFromHash } from "@/components/faq/OpenFaqFromHash";
import { Reveal } from "@/components/Reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <>
      <OpenFaqFromHash />
      {groups.map((group, i) => {
        // Every other theme group is a petrol-dark band (for the three real
        // groups: the middle one), giving the FAQ a light/dark reading rhythm.
        const onDark = i % 2 === 1;
        const labelColor = onDark ? "text-gletscher" : "text-stumm";
        const borderColor = onDark ? "border-gletscher/20" : "border-faden";
        return (
          <Section
            key={group.theme}
            tone={onDark ? "petrol" : "paper"}
            dense
            className={onDark ? "relative isolate overflow-hidden" : undefined}
          >
            {/* Petrol bands carry the calm water texture (subpage rule: dark =
                image, paper = paper). Text sits directly on it, so the tint stays
                heavy (0.65) — the texture is grain under the petrol, not a scene. */}
            {onDark ? (
              <SectionBackdrop src="/images/section-texture.webp" tintRgb="27 80 99" tintOpacity={0.65} />
            ) : null}
            <Reveal>
              <h2 className={`text-sm font-medium uppercase tracking-wider ${labelColor}`}>
                {group.theme}
              </h2>
              <div className={`mt-4 border-t ${borderColor}`}>
                {group.entries.map((entry) => (
                  <FaqItem
                    key={entry.question}
                    id={faqAnchor(entry.question)}
                    question={entry.question}
                    answer={entry.answer}
                    onDark={onDark}
                  />
                ))}
              </div>
            </Reveal>
          </Section>
        );
      })}
    </>
  );
}
