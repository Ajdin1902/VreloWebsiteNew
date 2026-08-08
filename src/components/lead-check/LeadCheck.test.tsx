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
    expect(screen.getByText(/48\.000/)).toBeInTheDocument();
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

  it("moves focus to the new question when a step advances", () => {
    // Advancing unmounts the button that held focus, dropping it to <body> —
    // a keyboard user then re-tabs from the top of the document, once per
    // question. Six questions, ten chrome controls each. (Rams audit 2026-08-08)
    render(<LeadCheck calLink={undefined} />);
    fireEvent.change(screen.getByLabelText(/Anfragen bekommst du/), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    const heading = screen.getByRole("heading", { level: 2, name: /Wie schnell antwortest du/ });
    expect(document.activeElement).toBe(heading);
    expect(heading).toHaveAttribute("tabindex", "-1");
  });

  it("does not steal focus on first render", () => {
    // Focusing the first question on mount would yank the viewport past the hero
    // the moment someone lands on the page.
    render(<LeadCheck calLink={undefined} />);
    expect(document.activeElement).toBe(document.body);
  });

  it("announces the step counter politely", () => {
    render(<LeadCheck calLink={undefined} />);
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Frage 1 von 6");
    expect(status).toHaveAttribute("aria-live", "polite");
  });

  it("groups the answer options under the question they answer", () => {
    render(<LeadCheck calLink={undefined} />);
    fireEvent.change(screen.getByLabelText(/Anfragen bekommst du/), { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));

    // Without this a screen reader announces five unrelated buttons.
    expect(screen.getByRole("group", { name: /Wie schnell antwortest du/ })).toBeInTheDocument();
  });
});
