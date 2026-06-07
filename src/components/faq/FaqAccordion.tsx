import type { FaqGroup } from "@/lib/faq";
import { FaqItem } from "@/components/faq/FaqItem";
import { Reveal } from "@/components/Reveal";

export function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="space-y-12">
      {groups.map((group, i) => (
        <Reveal key={group.theme} delayMs={i * 80}>
          <h2 className="text-sm font-medium uppercase tracking-wider text-stumm">
            {group.theme}
          </h2>
          <div className="mt-4 border-t border-faden">
            {group.entries.map((entry) => (
              <FaqItem key={entry.question} question={entry.question} answer={entry.answer} />
            ))}
          </div>
        </Reveal>
      ))}
    </div>
  );
}
