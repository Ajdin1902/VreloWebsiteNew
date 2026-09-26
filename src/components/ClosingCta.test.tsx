import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClosingCta } from "./ClosingCta";

describe("ClosingCta", () => {
  it("renders the heading (h2) and lead", () => {
    render(<ClosingCta heading="Los geht es." lead="Schreib mir." src="ratgeber" />);
    expect(screen.getByRole("heading", { level: 2, name: "Los geht es." })).toBeInTheDocument();
    expect(screen.getByText("Schreib mir.")).toBeInTheDocument();
  });

  it("sends the primary button to the check with the caller's slug", () => {
    render(<ClosingCta heading="h" lead="l" src="leistungen-close" />);
    const cta = screen.getByRole("link", { name: "Prozess-Check starten" });
    expect(cta).toHaveAttribute("href", "/prozess-check?src=leistungen-close");
  });

  it("keeps the Erstgespräch as the quiet secondary link", () => {
    render(<ClosingCta heading="h" lead="l" src="ratgeber" />);
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });

  it("flips to /kontakt primary with the check as secondary (FAQ exception)", () => {
    render(<ClosingCta heading="h" lead="l" src="faq" primary="kontakt" />);
    expect(screen.getByRole("link", { name: "Zeit zurückgewinnen" })).toHaveAttribute("href", "/kontakt");
    expect(screen.getByRole("link", { name: "Erst den Prozess-Check machen" })).toHaveAttribute(
      "href",
      "/prozess-check?src=faq",
    );
  });

  it("keeps the ember heading and the navy (inverse) button on the warm band", () => {
    render(<ClosingCta heading="Los." lead="l" src="ratgeber" />);
    expect(screen.getByRole("heading", { level: 2, name: "Los." })).toHaveClass("text-ember");
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveClass("bg-tiefes-wasser");
  });
});
