import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Referenzen } from "./Referenzen";
import { referenzen } from "@/lib/referenzen";

describe("Referenzen (leistungen)", () => {
  it("renders a section heading and both full reference cards", () => {
    render(<Referenzen />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { name: r.titel })).toBeInTheDocument();
      expect(screen.getByText(r.problem)).toBeInTheDocument();
    }
  });

  it("drops the old 'coming soon' placeholder", () => {
    render(<Referenzen />);
    expect(screen.queryByText(/Bald: Stimmen aus echten Betrieben/i)).toBeNull();
  });
});
