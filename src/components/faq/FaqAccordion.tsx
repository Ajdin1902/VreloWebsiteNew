import { Section } from "@/components/Section";
import type { FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";
import { Reveal } from "@/components/Reveal";

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
            className={i === 0 ? "-mt-24 md:-mt-32" : ""}
          >
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
