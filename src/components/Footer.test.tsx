import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the paper-variant brand lockup symbol", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('svg path[fill="#f4efe6"]')).not.toBeNull();
  });

  it("links the Prozess-Check outside navLinks (it is a focus route)", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Prozess-Check" })).toHaveAttribute("href", "/prozess-check?src=footer");
  });
});
