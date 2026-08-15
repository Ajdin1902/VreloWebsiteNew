import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Steps } from "./Steps";

describe("Steps", () => {
  it("renders on a deep cool band (Spine A karst-gorge source beat)", () => {
    const { container } = render(<Steps />);
    expect(container.querySelector("section")).toHaveClass("bg-tiefes-wasser");
  });

  it("keeps all three steps", () => {
    render(<Steps />);
    expect(screen.getByText("Hinschauen")).toBeInTheDocument();
    expect(screen.getByText("Bauen")).toBeInTheDocument();
    expect(screen.getByText("Fließen")).toBeInTheDocument();
  });

  it("offers the mid-page CTA with the concrete next step", () => {
    render(<Steps />);
    const cta = screen.getByRole("link", { name: "Zeit zurückgewinnen" });
    expect(cta).toHaveAttribute("href", "/kontakt");
    expect(
      screen.getByText(/Kostenloses Erstgespräch – 30 Minuten, unverbindlich/),
    ).toBeInTheDocument();
  });
});
