// src/lib/jsonld.ts
import { siteUrl, siteName } from "./site";
import { faqGroups } from "./faq";
import type { Article } from "./ratgeber";

const FOUNDER = "Ajdin Džafić";

export function professionalServiceLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteName,
    url: siteUrl,
    description: "Maßgeschneiderte Automatisierungen für kleine Betriebe im DACH-Raum.",
    areaServed: ["DE", "AT", "CH"],
    founder: { "@type": "Person", name: FOUNDER },
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER,
    jobTitle: "Gründer",
    worksFor: { "@type": "Organization", name: siteName },
    url: `${siteUrl}/ueber-mich`,
  };
}

export function faqPageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.entries).map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: e.answer },
    })),
  };
}

export function articleLd(a: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.description,
    datePublished: a.date,
    author: { "@type": "Person", name: FOUNDER },
    publisher: { "@type": "Organization", name: siteName },
    image: `${siteUrl}/ratgeber/${a.slug}/opengraph-image`,
    url: `${siteUrl}/ratgeber/${a.slug}`,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${siteUrl}${it.path}`,
    })),
  };
}
