import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WasIchBaue } from "./WasIchBaue";

describe("WasIchBaue", () => {
  it("renders on a petrol cool band", () => {
    const { container } = render(<WasIchBaue />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });

  it("uses an amber accent for the link (legible on petrol)", () => {
    render(<WasIchBaue />);
    expect(screen.getByRole("link", { name: /Alle Leistungen ansehen/i })).toHaveClass(
      "text-honig",
    );
  });
});
