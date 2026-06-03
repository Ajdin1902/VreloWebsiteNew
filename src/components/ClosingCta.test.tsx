import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClosingCta } from "./ClosingCta";

describe("ClosingCta", () => {
  it("renders the heading (h2) and lead", () => {
    render(<ClosingCta heading="Los geht es." lead="Schreib mir." />);
    expect(screen.getByRole("heading", { level: 2, name: "Los geht es." })).toBeInTheDocument();
    expect(screen.getByText("Schreib mir.")).toBeInTheDocument();
  });

  it("links the CTA to /kontakt by default", () => {
    render(<ClosingCta heading="h" lead="l" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/kontakt");
  });

  it("respects a custom ctaHref", () => {
    render(<ClosingCta heading="h" lead="l" ctaHref="/newsletter" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/newsletter");
  });
});
