import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MaklerFooter } from "./MaklerFooter";

describe("MaklerFooter", () => {
  it("keeps the legally required links reachable", () => {
    render(<MaklerFooter />);
    expect(screen.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/impressum");
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz");
  });

  it("offers a written route as well as the booking", () => {
    render(<MaklerFooter />);
    expect(screen.getByRole("link", { name: "Kontakt" })).toHaveAttribute("href", "/kontakt");
  });
});
