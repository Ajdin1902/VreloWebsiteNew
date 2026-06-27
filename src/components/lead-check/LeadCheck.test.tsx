// src/components/lead-check/LeadCheck.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeadCheck } from "./LeadCheck";

function answerAll() {
  fireEvent.change(screen.getByLabelText(/Anfragen bekommst du/), { target: { value: "10" } });
  fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
  fireEvent.click(screen.getByRole("button", { name: "am selben Tag" }));
  fireEvent.click(screen.getByRole("button", { name: "manchmal" }));
  fireEvent.click(screen.getByRole("button", { name: "wartet, bis ich Zeit habe" }));
  fireEvent.click(screen.getByRole("button", { name: "einmal" }));
  fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
}

describe("LeadCheck", () => {
  it("walks all 6 steps and shows the gain-led result", () => {
    render(<LeadCheck calLink={undefined} />);
    expect(screen.getByText(/Frage 1 von 6/)).toBeInTheDocument();
    answerAll();
    expect(screen.getByText(/Deine Lead-Reaktion/)).toBeInTheDocument();
    expect(screen.getByText(/168\.000/)).toBeInTheDocument();
    // Skipping the provision step → result is flagged as the default estimate
    expect(screen.getByText(/Gerechnet mit 4\.000/)).toBeInTheDocument();
  });

  it("lets the user go back to a previous step", () => {
    render(<LeadCheck calLink={undefined} />);
    fireEvent.change(screen.getByLabelText(/Anfragen bekommst du/), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(screen.getByText(/Frage 2 von 6/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Zurück/ }));
    expect(screen.getByText(/Frage 1 von 6/)).toBeInTheDocument();
  });
});
