import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SecondaryLink } from "./SecondaryLink";

describe("SecondaryLink", () => {
  it("renders the prefix as text and only the label as the link", () => {
    render(<SecondaryLink tone="dark" prefix="Lieber direkt reden?" label="Erstgespräch buchen" href="/kontakt" />);
    expect(screen.getByText(/Lieber direkt reden\?/)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Erstgespräch buchen" });
    expect(link).toHaveAttribute("href", "/kontakt");
  });

  it("uses light-on-dark colours for the dark tone", () => {
    render(<SecondaryLink tone="dark" prefix="p" label="l" href="/x" />);
    expect(screen.getByRole("link", { name: "l" })).toHaveClass("text-honig");
  });

  it("uses the deep ember that clears AA on warm bands for the light tone", () => {
    render(<SecondaryLink tone="light" prefix="p" label="l" href="/x" />);
    expect(screen.getByRole("link", { name: "l" })).toHaveClass("text-[#6f4a20]");
  });
});
