import { Section } from "@/components/Section";

export function PageIntro({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
}) {
  return (
    <Section tone="paper">
      {eyebrow ? (
        <p className="text-sm font-medium uppercase tracking-wider text-stumm">{eyebrow}</p>
      ) : null}
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-tiefes-wasser md:text-5xl">
        {title}
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-tinte">{lead}</p>
    </Section>
  );
}
