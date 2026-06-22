import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WaterSection } from "./WaterSection";

describe("WaterSection", () => {
  it("renders a petrol section with the flowing-water backdrop and its children", () => {
    const { container } = render(
      <WaterSection>
        <p>Inhalt</p>
      </WaterSection>
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-vrelo-petrol");
    const img = container.querySelector('img[aria-hidden="true"]');
    expect(img?.getAttribute("src")).toContain("fliessen");
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("forwards className to the section", () => {
    const { container } = render(
      <WaterSection className="-mt-24">
        <span>x</span>
      </WaterSection>
    );
    expect(container.querySelector("section")).toHaveClass("-mt-24");
  });
});
