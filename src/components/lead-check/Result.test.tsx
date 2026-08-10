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

  it("mirrors the tips as things the Termin-Quelle does (slow profile)", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    expect(screen.getByText(/Genau das übernimmt die Termin-Quelle/)).toBeInTheDocument();
    expect(screen.getByText(/antwortet auf jede neue Anfrage in unter fünf Minuten/)).toBeInTheDocument();
    expect(screen.getByText(/schlägt einen Termin vor/)).toBeInTheDocument();
    expect(screen.getByText(/fasst sie von selbst nach/)).toBeInTheDocument();
  });

  it("shows the solution mirror for an already-fast profile too", () => {
    render(<Result answers={schnell} result={computeResult(schnell)} calLink={undefined} />);
    expect(screen.getByText(/Genau das übernimmt die Termin-Quelle/)).toBeInTheDocument();
  });

  it("uses German typography in the mirror block (en-dash, no em-dash, no ASCII quote)", () => {
    render(<Result answers={langsam} result={computeResult(langsam)} calLink={undefined} />);
    const heading = screen.getByText(/Genau das übernimmt die Termin-Quelle/);
    const text = heading.closest("div")?.textContent ?? "";
    expect(text).toContain("–"); // spaced en-dash present
    expect(text).not.toContain("—"); // no em-dash
    expect(text).not.toContain('"'); // no ASCII double-quote
  });
});
