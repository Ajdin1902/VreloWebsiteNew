import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClosingCta } from "./ClosingCta";
import { portraits } from "@/lib/portraits";

describe("ClosingCta", () => {
  it("renders the heading (h2) and lead", () => {
    render(<ClosingCta heading="Los geht es." lead="Schreib mir." src="ratgeber" />);
    expect(screen.getByRole("heading", { level: 2, name: "Los geht es." })).toBeInTheDocument();
    expect(screen.getByText("Schreib mir.")).toBeInTheDocument();
  });

  it("sends the primary button to the check with the caller's slug", () => {
    render(<ClosingCta heading="h" lead="l" src="leistungen-close" />);
    const cta = screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" });
    expect(cta).toHaveAttribute("href", "/vorlagen?src=leistungen-close");
  });

  it("has no Erstgespräch link under the Vorlagen button (Ajdin 2026-11-11)", () => {
    render(<ClosingCta heading="h" lead="l" src="ratgeber" />);
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  // Ajdin 2026-11-11: the Erstgespräch button stands alone, no „Noch unsicher?“ link under it.
  it("flips to /kontakt primary with the button alone (FAQ, KI-Agenten)", () => {
    render(<ClosingCta heading="h" lead="l" src="faq" primary="kontakt" />);
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt?src=faq");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.queryByText(/Noch unsicher/)).toBeNull();
  });

  // 2026-10-01: every close carries the founder's sitting photo.
  it("shows the founder photo beside the close on every caller", () => {
    render(<ClosingCta heading="h" lead="l" src="leistungen-close" />);
    expect(screen.getByRole("img", { name: portraits.sitzend.alt })).toHaveAttribute(
      "src",
      expect.stringContaining("portrait-sitzend"),
    );
    expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toBeInTheDocument();
  });

  it("keeps the ember heading and the navy (inverse) button on the warm band", () => {
    render(<ClosingCta heading="Los." lead="l" src="ratgeber" />);
    expect(screen.getByRole("heading", { level: 2, name: "Los." })).toHaveClass("text-ember");
    expect(screen.getByRole("link", { name: "Kostenlose Vorlagen ansehen" })).toHaveClass("bg-tiefes-wasser");
  });
});
