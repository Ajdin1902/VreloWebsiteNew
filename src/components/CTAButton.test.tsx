import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CTAButton } from "./CTAButton";

describe("CTAButton", () => {
  it("links to the given href with the default label", () => {
    render(<CTAButton href="/kontakt" />);
    const link = screen.getByRole("link", { name: "Ruhe gewinnen" });
    expect(link).toHaveAttribute("href", "/kontakt");
  });

  it("offsets the focus ring against papier by default", () => {
    render(<CTAButton href="/x" />);
    expect(screen.getByRole("link")).toHaveClass("focus-visible:ring-offset-papier");
  });

  it("offsets the focus ring against the dark surface when tone='dark'", () => {
    render(<CTAButton href="/x" tone="dark" />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("focus-visible:ring-offset-tiefes-wasser");
    expect(link).not.toHaveClass("focus-visible:ring-offset-papier");
  });

  it("applies the sheen+lift effect class on the primary variant", () => {
    render(<CTAButton href="/x" />);
    expect(screen.getByRole("link")).toHaveClass("cta-fx");
  });

  it("does not apply the effect class on the ghost variant", () => {
    render(<CTAButton href="/x" variant="ghost" />);
    expect(screen.getByRole("link")).not.toHaveClass("cta-fx");
  });
});
