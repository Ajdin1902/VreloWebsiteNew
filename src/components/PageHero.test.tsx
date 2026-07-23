import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHero } from "./PageHero";

describe("PageHero", () => {
  it("renders the title as the page H1 and the lead below it", () => {
    render(<PageHero title="Titel" lead="Der Vorspann." src="/images/x.webp" />);
    expect(screen.getByRole("heading", { level: 1, name: "Titel" })).toBeInTheDocument();
    expect(screen.getByText("Der Vorspann.")).toBeInTheDocument();
  });

  it("renders nothing extra when no actions are passed", () => {
    render(<PageHero title="Titel" lead="Der Vorspann." src="/images/x.webp" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders an optional actions slot below the lead", () => {
    render(
      <PageHero
        title="Titel"
        lead="Der Vorspann."
        src="/images/x.webp"
        actions={<a href="#termin">Erstgespräch vereinbaren</a>}
      />,
    );
    expect(screen.getByRole("link", { name: "Erstgespräch vereinbaren" })).toHaveAttribute(
      "href",
      "#termin",
    );
  });
});
