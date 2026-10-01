import { CompactHero } from "@/components/CompactHero";
import { leistungGroups, type LeistungPage } from "@/lib/leistungenPages";

// A subpage's hero: the shared CompactHero filled from the page data. The
// eyebrow names the group, the button follows the page's close.
export function LeistungHero({ page }: { page: LeistungPage }) {
  const group = leistungGroups.find((g) => g.id === page.group)!.label;
  return (
    <CompactHero
      eyebrow={`Leistungen · ${group}`}
      title={page.title}
      line={page.subline}
      image={page.heroImage}
      cta={{ primary: page.cta.kind, src: page.cta.src }}
    />
  );
}
