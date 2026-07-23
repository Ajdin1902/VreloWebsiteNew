import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MaklerPage, { metadata } from "./page";
import { makler } from "@/lib/makler";

describe("/makler", () => {
  it("is excluded from search engines", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("leads with the pain headline as the only H1", () => {
    render(<MaklerPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(makler.hero.title);
  });

  it("asks for nothing in the hero – the CTA comes after the first product", () => {
    const { container } = render(<MaklerPage />);
    const h1 = screen.getByRole("heading", { level: 1 });
    const problemHeading = screen.getByRole("heading", { level: 2, name: makler.problem.title });
    const firstInPageCta = [...container.querySelectorAll('a[href="#termin"]')].find(
      (a) => !a.closest("header"),
    );
    expect(firstInPageCta).toBeTruthy();
    // The first non-header CTA must sit after the pain section, not beside the H1.
    expect(
      problemHeading.compareDocumentPosition(firstInPageCta!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(h1.closest("section")?.querySelector('a[href="#termin"]')).toBeNull();
  });

  it("runs the sections in the agreed order", () => {
    render(<MaklerPage />);
    const headings = screen
      .getAllByRole("heading", { level: 2 })
      .map((h) => h.textContent?.trim());
    expect(headings).toEqual([
      makler.problem.title,
      makler.terminQuelle.name,
      makler.documentConcierge.name,
      makler.voraussetzungen.title,
      makler.warumIch.title,
      makler.garantie.title,
      makler.einwaende.title,
      makler.close.title,
    ]);
  });

  it("carries both products and the demo link", () => {
    render(<MaklerPage />);
    expect(screen.getByRole("heading", { level: 2, name: /Termin-Quelle/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: /Document Concierge/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: makler.terminQuelle.proof!.label })).toHaveAttribute(
      "href",
      "/demo",
    );
  });

  it("brings its own minimal chrome and no site navigation", () => {
    render(<MaklerPage />);
    expect(screen.getByRole("link", { name: "Impressum" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Ratgeber" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Newsletter" })).not.toBeInTheDocument();
  });

  it("shows the server cost once and no Vrelo price", () => {
    const { container } = render(<MaklerPage />);
    const text = container.textContent ?? "";
    expect(text.match(/€/g) ?? []).toHaveLength(1);
    expect(text).toContain("unter 10 €");
    expect(text).not.toMatch(/netto|\/\s*Monat|pro Monat/i);
  });
});
