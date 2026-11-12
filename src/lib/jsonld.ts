// src/lib/jsonld.ts
import { siteUrl, siteName, linkedinUrl, linkedinProfileUrl } from "./site";
import { faqGroups } from "./faq";
import { KARTE } from "./karte";
import type { Article } from "./ratgeber";

const FOUNDER = "Ajdin Dzafic";

export function professionalServiceLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteName,
    url: siteUrl,
    description: "Maßgeschneiderte Automatisierungen für Betriebe und Unternehmen im DACH-Raum.",
    // Local first (Regensburg/Oberpfalz), DACH as the wider reach. Phone + mail match /kontakt and the Google profile.
    areaServed: [
      { "@type": "City", name: "Regensburg" },
      { "@type": "AdministrativeArea", name: "Oberpfalz" },
      "DE", "AT", "CH",
    ],
    telephone: KARTE.phone,
    email: "kontakt@vrelo-ki.de",
    logo: `${siteUrl}/logo/vrelo-symbol-navy.png`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Dietrich-Bonhoeffer-Straße 2",
      postalCode: "93055",
      addressLocality: "Regensburg",
      addressCountry: "DE",
    },
    founder: { "@type": "Person", name: FOUNDER, sameAs: [linkedinProfileUrl] },
    sameAs: [linkedinUrl],
  };
}

export function personLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: FOUNDER,
    jobTitle: "Gründer",
    worksFor: { "@type": "Organization", name: siteName },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "degree",
      name: "Master of Science (M.Sc.) in Wirtschaftsinformatik",
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: "OTH Regensburg" },
    url: `${siteUrl}/ueber-mich`,
    sameAs: [linkedinProfileUrl],
  };
}

export function faqPageLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((g) => g.entries).map((e) => ({
      "@type": "Question",
      name: e.question,
      acceptedAnswer: { "@type": "Answer", text: `${e.answer.join(". ")}.` },
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

export function serviceLd(page: { slug: string; title: string; metaDescription: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.title,
    serviceType: page.title,
    description: page.metaDescription,
    url: `${siteUrl}/leistungen/${page.slug}`,
    areaServed: ["DE", "AT", "CH"],
    provider: { "@type": "ProfessionalService", name: siteName, url: siteUrl },
  };
}
