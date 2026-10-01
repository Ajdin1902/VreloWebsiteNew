import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LeistungSubpage, { generateStaticParams, generateMetadata, relatedArticles } from "./page";
import { leistungenPages } from "@/lib/leistungenPages";
import { getAllArticles } from "@/lib/ratgeber";
import { canonical } from "@/lib/site";

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("/leistungen/[slug]", () => {
  it("pre-renders exactly the seven pages", () => {
    expect(generateStaticParams()).toEqual(leistungenPages.map((p) => ({ slug: p.slug })));
  });

  it("sets title, description and canonical per page", async () => {
    const meta = await generateMetadata(params("ki-server"));
    expect(meta.title).toBe("KI-Server");
    expect(meta.alternates?.canonical).toBe(canonical("/leistungen/ki-server"));
  });

  it("renders the five blocks in order", async () => {
    const { container } = render(await LeistungSubpage(params("prozessautomatisierung")));
    expect(screen.getByRole("heading", { level: 1, name: "Prozessautomatisierung" })).toBeInTheDocument();
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual(["Kennst du das?", "Aus der Praxis", "So sieht das aus", "Welche Aufgabe kostet dich am meisten?"]);
  });

  it("puts the one line and the button in the hero, with no separate lead section", async () => {
    const page = leistungenPages[0];
    render(await LeistungSubpage(params(page.slug)));
    const hero = screen.getByRole("heading", { level: 1 }).closest("section")!;
    expect(hero).toHaveTextContent(page.subline);
    expect(hero.querySelector("a[href^='/prozess-check']")).not.toBeNull();
    expect(screen.getAllByText(page.subline)).toHaveLength(1);
  });

  it("shows the audit card and the Förderung note only on KI-Beratung, with the Erstgespräch first", async () => {
    render(await LeistungSubpage(params("ki-beratung")));
    expect(document.getElementById("prozess-audit")).not.toBeNull();
    expect(screen.getByLabelText("Förderung")).toBeInTheDocument();
    // The audit card carries its own quiet „Erstgespräch buchen“ (→ /kontakt), so
    // look for the close's attributed link among all of them.
    const hrefs = screen.getAllByRole("link", { name: "Erstgespräch buchen" }).map((l) => l.getAttribute("href"));
    expect(hrefs).toContain("/kontakt?src=leistung-ki-beratung");
  });

  it("404s an unknown slug", async () => {
    await expect(LeistungSubpage(params("gibt-es-nicht"))).rejects.toThrow();
  });

  it("hides draft Ratgeber articles unless drafts are visible", () => {
    const draft = getAllArticles({ includeDrafts: true }).find((a) => a.draft);
    const live = getAllArticles({ includeDrafts: false })[0];
    const slugs = [live.slug, ...(draft ? [draft.slug] : []), "gibt-es-nicht"];
    expect(relatedArticles(slugs, false)).toEqual([{ slug: live.slug, title: live.title }]);
    if (draft) expect(relatedArticles(slugs, true).map((a) => a.slug)).toContain(draft.slug);
  });

  it("drops a draft article in production and keeps it when drafts are visible (stubbed lookup)", () => {
    const stub = (slug: string) => {
      if (slug === "entwurf") return { slug, title: "Entwurf", draft: true };
      if (slug === "live") return { slug, title: "Live", draft: false };
      throw new Error("not found");
    };
    expect(relatedArticles(["live", "entwurf", "fehlt"], false, stub)).toEqual([{ slug: "live", title: "Live" }]);
    expect(relatedArticles(["live", "entwurf"], true, stub).map((a) => a.slug)).toEqual(["live", "entwurf"]);
  });
});
