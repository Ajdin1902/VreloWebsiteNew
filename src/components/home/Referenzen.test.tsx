import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Referenzen } from "./Referenzen";
import { referenzen } from "@/lib/referenzen";

describe("Referenzen (homepage)", () => {
  it("renders the labelled section with both compact cards", () => {
    render(<Referenzen />);
    expect(screen.getByText("Referenzen")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { name: r.titel })).toBeInTheDocument();
      expect(screen.getByText(r.kompakt)).toBeInTheDocument();
      expect(screen.getByText(r.kennzahl)).toBeInTheDocument();
    }
  });

  it("links to the full references on /leistungen", () => {
    render(<Referenzen />);
    const link = screen.getByRole("link", { name: /Beide Projekte im Detail ansehen/i });
    expect(link).toHaveAttribute("href", "/leistungen#referenzen");
  });
});
