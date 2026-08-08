// src/components/lead-check/Result.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Result } from "./Result";
import { computeResult, type LeadCheckAnswers } from "@/lib/leadCheck";

const langsam: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "selberTag",
  abendsWochenende: "manchmal",
  imTermin: "wartet",
  nachfassen: "einmal",
  provision: 4000,
};
const schnell: LeadCheckAnswers = {
  anfragenProWoche: 10,
  reaktionszeit: "unter5min",
  abendsWochenende: "immer",
  imTermin: "automatisch",
  nachfassen: "mehrmals",
};

describe("Result", () => {
  it("leads with the € upside for a slow profile", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    expect(screen.getByText(/48\.000/)).toBeInTheDocument();
    expect(screen.getByText(/Deine Lead-Reaktion/)).toBeInTheDocument();
  });

  it("does not invent a € promise for an already-fast profile", () => {
    render(<Result answers={schnell} result={computeResult(schnell)} calLink={undefined} />);
    expect(screen.getByText(/schon schnell/)).toBeInTheDocument();
  });

  it("shows the calculation disclosure", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    expect(screen.getByText(/Wie wir rechnen/)).toBeInTheDocument();
  });
});
