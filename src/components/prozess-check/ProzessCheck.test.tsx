import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProzessCheck } from "./ProzessCheck";
import { STEPS } from "@/lib/prozessCheck";

// Click the option with the given visible label, advancing one step.
async function pick(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole("button", { name: label }));
}

// Answer all five questions with the labels that produce category A (strong).
async function answerStrong(user: ReturnType<typeof userEvent.setup>) {
  await pick(user, "Anfragen beantworten und qualifizieren");
  await pick(user, "mehr als 5 Stunden");
  await pick(user, "Anfragen bleiben liegen oder springen ab");
  await pick(user, "Ja, ständig");
  await pick(user, "Noch nicht, ich weiß nicht, wo ich anfangen soll");
}

// Labels that produce category D (too small).
async function answerSmall(user: ReturnType<typeof userEvent.setup>) {
  await pick(user, "Anfragen beantworten und qualifizieren");
  await pick(user, "unter 1 Stunde");
  await pick(user, "Nichts geht verloren, es kostet mich nur Zeit");
  await pick(user, "Nein, das lasse ich im Betrieb");
  await pick(user, "Noch nicht, ich weiß nicht, wo ich anfangen soll");
}

describe("ProzessCheck", () => {
  it("shows the first question and a progress counter", () => {
    render(<ProzessCheck calLink="team/vrelo/kennenlernen" />);
    expect(screen.getByText(`Frage 1 von ${STEPS.length}`)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: STEPS[0].label })).toBeInTheDocument();
  });

  it("A: reaches a fitting result with the scheduler (Termin anzeigen)", async () => {
    const user = userEvent.setup();
    render(<ProzessCheck calLink="team/vrelo/kennenlernen" />);
    await answerStrong(user);
    expect(screen.getByText(/Eine klare Quelle/)).toBeInTheDocument();
    expect(screen.getByText(/Ein Erstgespräch lohnt sich für dich/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Termin anzeigen" })).toBeInTheDocument();
  });

  it("D: honest not-yet result, no scheduler, soft newsletter link", async () => {
    const user = userEvent.setup();
    render(<ProzessCheck calLink="team/vrelo/kennenlernen" />);
    await answerSmall(user);
    expect(screen.getByText(/Noch zu klein/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Termin anzeigen" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Die Quelle/ })).toHaveAttribute("href", "/newsletter");
  });
});
