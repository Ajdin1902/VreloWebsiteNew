import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "./Section";

describe("Section", () => {
  it("renders children", () => {
    render(<Section>Inhalt</Section>);
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("defaults to the paper tone (Papier background, not white)", () => {
    const { container } = render(<Section>x</Section>);
    expect(container.querySelector("section")).toHaveClass("bg-papier");
  });

  it("applies the cool tone classes", () => {
    const { container } = render(<Section tone="cool">x</Section>);
    expect(container.querySelector("section")).toHaveClass("bg-tiefes-wasser");
  });

  it("applies the warm tone classes", () => {
    const { container } = render(<Section tone="warm">x</Section>);
    expect(container.querySelector("section")).toHaveClass("bg-sonnenlicht");
  });

  it("merges className and sets id", () => {
    const { container } = render(
      <Section className="border-t" id="proof">x</Section>
    );
    const el = container.querySelector("section");
    expect(el).toHaveClass("border-t");
    expect(el).toHaveAttribute("id", "proof");
  });

  it("renders the gletscher tint instead of papier when tint is set", () => {
    const { container } = render(<Section tint>x</Section>);
    const el = container.querySelector("section");
    expect(el).toHaveClass("bg-gletscher/30");
    expect(el).not.toHaveClass("bg-papier");
  });

  it("keeps the readable text color when tinted", () => {
    const { container } = render(<Section tint>x</Section>);
    expect(container.querySelector("section")).toHaveClass("text-tinte");
  });
});
