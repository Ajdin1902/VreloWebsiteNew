import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Proof } from "./Proof";

describe("Proof", () => {
  it("renders the heading, four value cards, and the references footnote", () => {
    render(<Proof />);
    expect(
      screen.getByRole("heading", { name: /Ruhig gebaut\. Verlässlich im Betrieb\./i }),
    ).toBeInTheDocument();
    for (const title of [
      "Ein Ansprechpartner.",
      "Praxiserprobt.",
      "Maßgeschneidert statt von der Stange.",
      "Du wartest nichts.",
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByText(/Erste Kundenreferenzen folgen/i)).toBeInTheDocument();
  });

  it("does not show the old apologetic placeholder line", () => {
    render(<Proof />);
    expect(screen.queryByText(/Echte Referenzen folgen in Kürze/i)).toBeNull();
  });
});
