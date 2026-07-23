import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminQuelleBlock } from "./TerminQuelleBlock";
import { makler } from "@/lib/makler";

describe("TerminQuelleBlock", () => {
  it("names the product as a section heading", () => {
    render(<TerminQuelleBlock />);
    expect(screen.getByRole("heading", { level: 2, name: /Termin-Quelle/ })).toBeInTheDocument();
  });

  it("shows the mechanism as an ordered list of steps", () => {
    render(<TerminQuelleBlock />);
    const list = screen.getByRole("list", { name: "Ablauf" });
    expect(list.querySelectorAll("li")).toHaveLength(makler.terminQuelle.chips!.length);
  });

  it("invites the visitor into the live demo", () => {
    render(<TerminQuelleBlock />);
    const demo = screen.getByRole("link", { name: makler.terminQuelle.proof!.label });
    expect(demo).toHaveAttribute("href", "/demo");
  });

  it("never shows a price", () => {
    const { container } = render(<TerminQuelleBlock />);
    expect(container.textContent).not.toMatch(/€/);
  });
});
