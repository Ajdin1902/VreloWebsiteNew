import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Referenzen } from "./Referenzen";
import { referenzen } from "@/lib/referenzen";

describe("Referenzen (leistungen)", () => {
  it("renders a section heading and both compact cards", () => {
    render(<Referenzen />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { name: r.titel })).toBeInTheDocument();
      expect(screen.getByText(r.kompakt)).toBeInTheDocument();
      expect(screen.queryByText(r.ueberblick)).toBeNull();
    }
  });

  it("links to the full story on /referenzen", () => {
    render(<Referenzen />);
    expect(screen.getByRole("link", { name: /Beide Projekte im Detail ansehen/i })).toHaveAttribute("href", "/referenzen");
  });

  it("keeps the #referenzen anchor", () => {
    const { container } = render(<Referenzen />);
    expect(container.querySelector("#referenzen")).not.toBeNull();
  });
});
