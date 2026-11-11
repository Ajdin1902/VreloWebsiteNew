import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeistungSubpage, { generateStaticParams, generateMetadata } from "./page";
import { leistungenPages } from "@/lib/leistungenPages";
import { canonical } from "@/lib/site";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("/leistungen/[slug]", () => {
  it("pre-renders exactly the four pages", () => {
    expect(generateStaticParams()).toEqual(leistungenPages.map((p) => ({ slug: p.slug })));
  });

  it("sets title, description and canonical per page", async () => {
    const meta = await generateMetadata(params("ki-automatisierung"));
    expect(meta.title).toBe("KI-Automatisierung");
    expect(meta.alternates?.canonical).toBe(canonical("/leistungen/ki-automatisierung"));
  });

  // Ajdin 2026-11-11: Hero → Kennst du das? → Lösung → proof → Warum ich → CTA. That is it.
  it.each(leistungenPages.map((p) => [p.slug, p] as const))("%s renders exactly the six blocks in order", async (slug, p) => {
    const { container } = render(await LeistungSubpage(params(slug)));
    expect(screen.getByRole("heading", { level: 1, name: p.title })).toBeInTheDocument();
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual([p.pain.heading, p.loesung.heading, p.szenen.heading, "Warum ich", p.cta.heading]);
    expect(container.textContent).not.toContain("Mehr dazu");
  });

  it("puts the one line and the button in the hero", async () => {
    const page = leistungenPages[0];
    render(await LeistungSubpage(params(page.slug)));
    const hero = screen.getByRole("heading", { level: 1 }).closest("section")!;
    expect(hero).toHaveTextContent(page.subline);
    expect(hero.querySelector("a[href^='/vorlagen']")).not.toBeNull();
    expect(screen.getAllByText(page.subline)).toHaveLength(1);
  });

  it("shows the Wartung tiers with their prices on Betreuung", async () => {
    const { container } = render(await LeistungSubpage(params("betreuung")));
    expect(container.querySelector("table")).not.toBeNull();
    for (const p of ["249 €", "945 €", "9.900 €"]) expect(screen.getAllByText(p).length).toBeGreaterThan(0);
  });

  it("lands the old KI links on their card", async () => {
    const { container } = render(await LeistungSubpage(params("ki-automatisierung")));
    for (const id of ["ki-assistenten", "ki-betriebssystem", "claude", "ki-server", "ki-schulung"])
      expect(container.querySelector(`#${id}`), id).not.toBeNull();
  });

  it("404s an unknown slug", async () => {
    await expect(LeistungSubpage(params("gibt-es-nicht"))).rejects.toThrow();
  });
});
