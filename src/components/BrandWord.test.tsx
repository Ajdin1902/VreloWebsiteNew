import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrandWord } from "./BrandWord";

describe("BrandWord", () => {
  it("renders its text content", () => {
    render(<BrandWord>Vrelo</BrandWord>);
    expect(screen.getByText("Vrelo")).toBeInTheDocument();
  });

  it("applies the Fraunces serif + italic classes", () => {
    render(<BrandWord>Merak</BrandWord>);
    const el = screen.getByText("Merak");
    expect(el).toHaveClass("font-serif");
    expect(el).toHaveClass("italic");
  });

  it("merges caller-provided className", () => {
    render(<BrandWord className="text-amber">Vrelo</BrandWord>);
    expect(screen.getByText("Vrelo")).toHaveClass("text-amber");
  });
});
