import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Proof } from "./Proof";

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

  it("no longer carries the references (they live in their own section now)", () => {
    render(<Proof />);
    expect(screen.queryByText(/Erste Kundenreferenzen folgen/i)).toBeNull();
    expect(screen.queryByText("Referenzen")).toBeNull();
  });
});
