import { ServiceHero } from "@/components/leistungen/ServiceHero";
import { leistungGroups, type LeistungPage } from "@/lib/leistungenPages";

// A subpage's hero: the shared ServiceHero filled from the page data. The
// eyebrow names the group, the button follows the page's close.
export function LeistungHero({ page }: { page: LeistungPage }) {
  const group = leistungGroups.find((g) => g.id === page.group)!.label;
  return (
    <ServiceHero
      eyebrow={`Leistungen · ${group}`}
      title={page.title}
      line={page.subline}
      image={page.heroImage}
      primary={page.cta.kind}
      src={page.cta.src}
    />
  );
}
