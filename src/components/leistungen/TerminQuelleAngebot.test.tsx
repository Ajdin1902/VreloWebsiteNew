import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminQuelleAngebot } from "./TerminQuelleAngebot";
import { terminQuelle } from "@/lib/termin-quelle";

describe("TerminQuelleAngebot", () => {
  it("renders the offer name as a heading and the promise", () => {
    render(<TerminQuelleAngebot />);
    expect(
      screen.getByRole("heading", { name: terminQuelle.name })
    ).toBeInTheDocument();
    expect(screen.getByText(terminQuelle.promise)).toBeInTheDocument();
  });

  it("renders every step of the flow", () => {
    render(<TerminQuelleAngebot />);
    for (const step of terminQuelle.flow) {
      expect(screen.getByText(step)).toBeInTheDocument();
    }
  });

  it("renders the founding-promise note", () => {
    render(<TerminQuelleAngebot />);
    expect(screen.getByText(terminQuelle.foundingNote)).toBeInTheDocument();
  });

  it("renders the CTA as a link to the Kontakt page", () => {
    render(<TerminQuelleAngebot />);
    const cta = screen.getByRole("link", { name: terminQuelle.cta.label });
    expect(cta).toHaveAttribute("href", "/kontakt");
  });

  it("shows no price anywhere (the page stays price-free)", () => {
    const { container } = render(<TerminQuelleAngebot />);
    expect(container.textContent ?? "").not.toMatch(/€|\bEUR\b|\d+\s?Euro/i);
  });
});
