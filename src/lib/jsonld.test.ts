// src/lib/jsonld.test.ts
import { describe, it, expect } from "vitest";
import {
  professionalServiceLd, personLd, faqPageLd, articleLd, breadcrumbLd,
} from "./jsonld";
import { faqGroups } from "./faq";
import { siteUrl } from "./site";
import type { Article } from "./ratgeber";

describe("jsonld builders", () => {
  it("professionalServiceLd has the right type, name and DACH area", () => {
    const ld = professionalServiceLd();
    expect(ld["@type"]).toBe("ProfessionalService");
    expect(ld.name).toBe("Vrelo");
    expect(ld.areaServed).toEqual(["DE", "AT", "CH"]);
  });

  it("personLd describes the founder", () => {
    expect(personLd()["@type"]).toBe("Person");
  });

  it("faqPageLd has one Question per faq entry", () => {
    const count = faqGroups.flatMap((g) => g.entries).length;
    const ld = faqPageLd();
    expect(ld["@type"]).toBe("FAQPage");
    expect(ld.mainEntity).toHaveLength(count);
    expect(ld.mainEntity[0]["@type"]).toBe("Question");
  });

  it("articleLd maps an article to schema.org Article", () => {
    const a: Article = {
      slug: "x", title: "T", description: "D", date: "2026-05-01",
      tags: [], draft: false, readingMinutes: 3, body: "b",
    };
    const ld = articleLd(a);
    expect(ld["@type"]).toBe("Article");
    expect(ld.headline).toBe("T");
    expect(ld.datePublished).toBe("2026-05-01");
    expect(ld.url).toBe(`${siteUrl}/ratgeber/x`);
  });

  it("breadcrumbLd numbers items from 1 with absolute urls", () => {
    const ld = breadcrumbLd([{ name: "Start", path: "/" }, { name: "Ratgeber", path: "/ratgeber" }]);
    expect(ld["@type"]).toBe("BreadcrumbList");
    expect(ld.itemListElement[0].position).toBe(1);
    expect(ld.itemListElement[1].item).toBe(`${siteUrl}/ratgeber`);
  });
});
