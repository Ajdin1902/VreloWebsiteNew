import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReferenzCard } from "./ReferenzCard";
import { referenzen } from "@/lib/referenzen";

const agentur = referenzen[0];

describe("ReferenzCard", () => {
  it("full variant shows label, title, all three beats, the ergebnis and the number", () => {
    render(<ReferenzCard referenz={agentur} variant="full" />);
    expect(screen.getByText(agentur.label)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: agentur.titel })).toBeInTheDocument();
    for (const beat of ["Das Problem", "Gebaut", "Läuft"]) {
      expect(screen.getByText(beat)).toBeInTheDocument();
    }
    expect(screen.getByText(agentur.problem)).toBeInTheDocument();
    expect(screen.getByText(agentur.ergebnis)).toBeInTheDocument();
    expect(screen.getByText(agentur.kennzahl)).toBeInTheDocument();
    expect(screen.getByText(agentur.kennzahlLabel)).toBeInTheDocument();
  });

  it("compact variant shows title, the kompakt summary and number but omits the beats and ergebnis", () => {
    render(<ReferenzCard referenz={agentur} variant="compact" />);
    expect(screen.getByRole("heading", { name: agentur.titel })).toBeInTheDocument();
    expect(screen.getByText(agentur.kompakt)).toBeInTheDocument();
    expect(screen.getByText(agentur.kennzahl)).toBeInTheDocument();
    expect(screen.queryByText("Das Problem")).toBeNull();
    expect(screen.queryByText(agentur.problem)).toBeNull();
    expect(screen.queryByText(agentur.gebaut)).toBeNull();
    expect(screen.queryByText(agentur.laeuft)).toBeNull();
    expect(screen.queryByText(agentur.ergebnis)).toBeNull();
  });
});
