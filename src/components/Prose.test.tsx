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

  it("exposes BrandWord to MDX scope", () => {
    expect(proseComponents.BrandWord).toBeTypeOf("function");
  });
});

describe("proseComponents.blockquote (pull-quote)", () => {
  it("renders a centered pull-quote with an amber drop mark and no left stripe", () => {
    const Blockquote = proseComponents.blockquote;
    const { container } = render(
      <Blockquote>
        <p>Ein ruhiger Satz.</p>
      </Blockquote>,
    );
    const bq = container.querySelector("blockquote")!;
    expect(bq).toBeTruthy();
    expect(bq).toHaveClass("text-center");
    expect(bq).not.toHaveClass("border-l");
    expect(bq.querySelector('span[aria-hidden="true"]')).toBeTruthy();
    expect(bq.textContent).toContain("Ein ruhiger Satz.");
  });
});
