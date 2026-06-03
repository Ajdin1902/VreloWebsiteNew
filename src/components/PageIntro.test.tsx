import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageIntro } from "./PageIntro";

describe("PageIntro", () => {
  it("renders the title as an h1 and the lead", () => {
    render(<PageIntro title="Leistungen" lead="Lead-Text." />);
    expect(screen.getByRole("heading", { level: 1, name: "Leistungen" })).toBeInTheDocument();
    expect(screen.getByText("Lead-Text.")).toBeInTheDocument();
  });

  it("renders the eyebrow when provided", () => {
    render(<PageIntro eyebrow="Was ich baue" title="Leistungen" lead="x" />);
    expect(screen.getByText("Was ich baue")).toBeInTheDocument();
  });

  it("omits the eyebrow when not provided (only the lead paragraph remains)", () => {
    const { container } = render(<PageIntro title="Leistungen" lead="x" />);
    expect(screen.queryByText("Was ich baue")).not.toBeInTheDocument();
    expect(container.querySelectorAll("p").length).toBe(1);
  });
});
