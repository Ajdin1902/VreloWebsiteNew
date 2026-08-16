import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Proof } from "./Proof";
import { referenzen } from "@/lib/referenzen";

describe("Proof", () => {
  it("renders the heading and four value cards", () => {
    render(<Proof />);
    expect(
      screen.getByRole("heading", { name: /Sorgfältig gebaut\. Verlässlich im Betrieb\./i }),
    ).toBeInTheDocument();
    for (const title of [
      "Ein Ansprechpartner.",
      "Praxiserprobt.",
      "Maßgeschneidert statt von der Stange.",
      "Du wartest nichts.",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
  });

  it("renders the two compact reference cards instead of the coming-soon line", () => {
    render(<Proof />);
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { name: r.titel })).toBeInTheDocument();
      expect(screen.getByText(r.kennzahl)).toBeInTheDocument();
    }
    expect(screen.queryByText(/Erste Kundenreferenzen folgen/i)).toBeNull();
  });
});
