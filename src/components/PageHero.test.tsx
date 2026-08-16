import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHero } from "./PageHero";

describe("PageHero", () => {
  it("renders the title as the page H1 and the lead below it", () => {
    render(<PageHero title="Titel" lead="Der Vorspann." src="/images/x.webp" />);
    expect(screen.getByRole("heading", { level: 1, name: "Titel" })).toBeInTheDocument();
    expect(screen.getByText("Der Vorspann.")).toBeInTheDocument();
  });

  it("omits the lead deck when no lead is passed", () => {
    render(<PageHero title="Titel" src="/images/x.webp" />);
    expect(screen.getByRole("heading", { level: 1, name: "Titel" })).toBeInTheDocument();
    expect(screen.queryByText("Der Vorspann.")).not.toBeInTheDocument();
  });

  it("renders no links of its own", () => {
    // The hero is title + lead only. The `actions` slot it used to carry was
    // never passed by any of the seven call sites and was removed with the
    // 2026-08-08 audit cleanup; /makler's CTA lives in the focus header.
    render(<PageHero title="Titel" lead="Der Vorspann." src="/images/x.webp" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
