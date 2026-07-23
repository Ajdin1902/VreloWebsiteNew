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

  it("keeps the hero CTA and the header CTA on the booking anchor", () => {
    render(<MaklerPage />);
    const ctas = screen.getAllByRole("link", { name: makler.hero.cta.label });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    for (const cta of ctas) expect(cta).toHaveAttribute("href", "#termin");
  });

  it("states the friction-reducing note beside the hero CTA", () => {
    render(<MaklerPage />);
    expect(screen.getByText(makler.hero.ctaNote)).toBeInTheDocument();
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

  it("never shows a price", () => {
    const { container } = render(<MaklerPage />);
    expect(container.textContent).not.toMatch(/€/);
  });
});
