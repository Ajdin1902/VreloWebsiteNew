import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MerakClose } from "./MerakClose";

describe("MerakClose", () => {
  it("keeps the Merak-Effekt close", () => {
    render(<MerakClose />);
    expect(screen.getByText(/Merak/)).toBeInTheDocument();
  });

  it("names the three-minute first step and sends it to the check", () => {
    const { container } = render(<MerakClose />);
    expect(container.textContent).toMatch(/Der erste Schritt dauert drei Minuten/);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-close",
    );
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });
});
