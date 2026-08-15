import { Section } from "@/components/Section";
import type { FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";
import { Reveal } from "@/components/Reveal";
import { SectionBackdrop } from "@/components/SectionBackdrop";

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <>
      {groups.map((group, i) => {
        // Every other theme group is a petrol-dark band (for the three real
        // groups: the middle one), giving the FAQ a light/dark reading rhythm.
        // The first group is pulled up under the paper intro so two stacked
        // paper Sections don't double their py padding into an oversized gap.
        const onDark = i % 2 === 1;
        const labelColor = onDark ? "text-gletscher" : "text-stumm";
        const borderColor = onDark ? "border-gletscher/20" : "border-faden";
        return (
          <Section
            key={group.theme}
            tone={onDark ? "petrol" : "paper"}
            className={[i === 0 ? "-mt-24 md:-mt-32" : "", onDark ? "relative isolate overflow-hidden" : ""]
              .filter(Boolean)
              .join(" ")}
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
