import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProzessCheck } from "./ProzessCheck";
import { AREA_LABEL } from "@/lib/prozessCheck";

// The Cal embed is heavy and network-y; stub it so the wizard test stays a unit.
vi.mock("@/components/kontakt/SchedulerEmbed", () => ({
  SchedulerEmbed: () => <div data-testid="scheduler" />,
}));

function answerChoice(label: string | RegExp) {
  fireEvent.click(screen.getByRole("button", { name: label }));
}

describe("ProzessCheck wizard", () => {
  it("walks all steps and shows the hours result", () => {
    render(<ProzessCheck calLink="https://cal.eu/x" />);

    // Step 1 branche
    answerChoice("Handwerk");
    // Step 2 team
    answerChoice(/2 bis 5/);
    // Step 3 grid: set one slider, submit
    fireEvent.change(screen.getByLabelText(AREA_LABEL.rechnungen), { target: { value: "5" } });
    answerChoice(/Ergebnis zeigen/);
    // Step 4 nervt
    answerChoice(AREA_LABEL.rechnungen);
    // Step 5 abende
    answerChoice(/Ab und zu/);
    // Step 6 versucht
    answerChoice(/Noch nichts/);

    // Result: hours headline (5) + scheduler. The per-area hours readout also
    // says "5 Stunden" when only one slider is set, so match the headline
    // sentence specifically to avoid an ambiguous multi-match.
    expect(screen.getByText(/5 Stunden pro Woche/)).toBeInTheDocument();
    expect(screen.getByTestId("scheduler")).toBeInTheDocument();
  });

  it("shows the honest zero-state when all sliders stay at 0", () => {
    render(<ProzessCheck calLink={undefined} />);
    answerChoice("Handwerk");
    answerChoice(/Ich allein/);
    answerChoice(/Ergebnis zeigen/); // grid untouched → all 0
    answerChoice(AREA_LABEL.anfragen);
    answerChoice(/^Nein$/);
    answerChoice(/Noch nichts/);
    expect(screen.getByText(/gerade noch nicht nötig/i)).toBeInTheDocument();
    expect(screen.queryByTestId("scheduler")).not.toBeInTheDocument();
  });
});
