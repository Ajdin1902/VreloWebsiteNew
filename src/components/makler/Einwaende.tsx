import { Section } from "@/components/Section";
import { FaqItem } from "@/components/faq/FaqItem";
import { makler } from "@/lib/makler";

// Objections woven in as a calm accordion just before the close, not as a
// fear block. FaqItem is the site's existing disclosure primitive.
export function Einwaende() {
  const e = makler.einwaende;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-[44rem]">
        <h2 className="text-balance text-center text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {e.title}
        </h2>
        <div className="mt-10">
          {e.items.map((item) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </Section>
  );
}
