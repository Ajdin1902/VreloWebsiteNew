// src/components/Prose.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { proseComponents } from "./Prose";

describe("proseComponents", () => {
  it("styles h2 with the Fraunces serif token", () => {
    const H2 = proseComponents.h2;
    render(<H2>Überschrift</H2>);
    const el = screen.getByText("Überschrift");
    expect(el.tagName).toBe("H2");
    expect(el).toHaveClass("font-serif");
  });

  it("styles links with the petrol token", () => {
    const A = proseComponents.a;
    render(<A href="/x">Link</A>);
    expect(screen.getByText("Link")).toHaveClass("text-vrelo-petrol");
  });

  it("styles blockquote in ember italic", () => {
    const BQ = proseComponents.blockquote;
    render(<BQ>Zitat</BQ>);
    const el = screen.getByText("Zitat");
    expect(el.tagName).toBe("BLOCKQUOTE");
    expect(el).toHaveClass("text-ember");
    expect(el).toHaveClass("italic");
  });

  it("exposes BrandWord to MDX scope", () => {
    expect(proseComponents.BrandWord).toBeTypeOf("function");
  });
});
