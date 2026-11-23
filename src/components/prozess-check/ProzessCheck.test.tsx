import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProzessCheck } from "./ProzessCheck";
import { AREA_LABEL, QUESTION_COUNT } from "@/lib/prozessCheck";

// The Cal embed is heavy and network-y; stub it so the wizard test stays a unit.
vi.mock("@/components/kontakt/SchedulerEmbed", () => ({
  SchedulerEmbed: () => <div data-testid="scheduler" />,
}));

const click = (name: string | RegExp, role = "button") => fireEvent.click(screen.getByRole(role, { name }));
const pick = (...ids: (keyof typeof AREA_LABEL)[]) => ids.forEach((id) => click(AREA_LABEL[id], "checkbox"));

function startAndPick(...ids: (keyof typeof AREA_LABEL)[]) {
  click("Los geht's");
  pick(...ids);
  click("Weiter");
}

/** From the Aufgabe step to the end, skipping the optional steps. */
function finishFromAufgabe() {
  click("Mail", "checkbox");
  click("Bis 5", "radio");
  click("Ich selbst", "radio");
  click("Weiter"); // aufgabe
  click("Weiter"); // programme
  click("Überspringen"); // arbeitstag
  click(/^Nein$/); // abende
  click(/Noch nichts/);
  click("Handwerk");
  click(/Ich allein/);
  click(/^Im Büro$/);
  click("Überspringen"); // website
}

describe("ProzessCheck wizard", () => {
  it("starts on the intro and its button opens question 1", () => {
    render(<ProzessCheck calLink={undefined} />);
    expect(screen.getByText("Dein Vorab-Fahrplan in 5 Minuten")).toBeInTheDocument();
    click("Los geht's");
    expect(screen.getByText("Wo möchtest du Hilfe?")).toBeInTheDocument();
  });

  it("moves focus into the new step after Los geht's and after Weiter", () => {
    render(<ProzessCheck calLink={undefined} />);
    expect(document.activeElement).toBe(document.body);
    click("Los geht's");
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toContainElement(screen.getByText("Wo möchtest du Hilfe?"));
    pick("anfragen");
    click("Weiter");
    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toContainElement(screen.getByText("Wo geht deine Zeit hin?"));
  });

  it("disables Weiter until an area is picked", () => {
    render(<ProzessCheck calLink={undefined} />);
    click("Los geht's");
    expect(screen.getByRole("button", { name: "Weiter" })).toBeDisabled();
    pick("anfragen");
    expect(screen.getByRole("button", { name: "Weiter" })).toBeEnabled();
  });

  it("asks hours only for picked areas", () => {
    render(<ProzessCheck calLink={undefined} />);
    startAndPick("anfragen", "rechnungen");
    expect(screen.getAllByRole("slider")).toHaveLength(2);
  });

  it("progress counts the conditional step", () => {
    render(<ProzessCheck calLink={undefined} />);
    startAndPick("anfragen");
    expect(screen.getByRole("status")).toHaveTextContent(`Frage 2 von ${QUESTION_COUNT - 1}`);
  });

  it("dropping an area drops its hours and nervt", () => {
    render(<ProzessCheck calLink={undefined} />);
    startAndPick("anfragen", "rechnungen");
    fireEvent.change(screen.getByLabelText(AREA_LABEL.anfragen), { target: { value: "4" } });
    fireEvent.change(screen.getByLabelText(AREA_LABEL.rechnungen), { target: { value: "6" } });
    click("Weiter");
    click(AREA_LABEL.rechnungen); // nervt = rechnungen
    // back: aufgabe -> nervt -> stunden -> bereiche
    click("← Zurück");
    click("← Zurück");
    click("← Zurück");
    pick("rechnungen"); // unpick
    click("Weiter");
    click("Weiter"); // hours of the single area (anfragen, kept at 4)
    finishFromAufgabe();
    expect(screen.queryByText(/Rechnungen, Belege/)).not.toBeInTheDocument();
    expect(screen.getByText(/4 Stunden pro Woche/)).toBeInTheDocument();
    // nervt was set to the single remaining area
    expect(screen.getAllByText(/Anfragen beantworten/).length).toBeGreaterThan(0);
  });

  it("asks nervt again when it was dropped and two areas remain", () => {
    render(<ProzessCheck calLink={undefined} />);
    startAndPick("anfragen", "rechnungen");
    click("Weiter");
    click(AREA_LABEL.rechnungen);
    click("← Zurück");
    click("← Zurück");
    click("← Zurück");
    pick("rechnungen", "daten"); // unpick rechnungen, add daten
    click("Weiter");
    click("Weiter");
    expect(screen.getByText("Was nervt am meisten?")).toBeInTheDocument();
  });

  it("optional steps can be skipped", () => {
    render(<ProzessCheck calLink={undefined} />);
    startAndPick("anfragen");
    click("Weiter"); // hours
    click("Mail", "checkbox");
    click("Bis 5", "radio");
    click("Ich selbst", "radio");
    click("Weiter");
    click("Weiter");
    expect(screen.getByText("Dein Arbeitstag")).toBeInTheDocument();
    click("Überspringen");
    click(/^Nein$/);
    click(/Noch nichts/);
    click("Handwerk");
    click(/Ich allein/);
    click(/^Im Büro$/);
    expect(screen.getByText("Deine Website")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Überspringen" })).toBeInTheDocument();
  });

  it("one area at zero hours ends on the honest exit without a form", () => {
    render(<ProzessCheck calLink={undefined} />);
    startAndPick("anfragen");
    click("Weiter"); // hours stay 0
    finishFromAufgabe();
    expect(screen.getByText(/gerade noch nicht nötig/i)).toBeInTheDocument();
    expect(screen.queryByTestId("scheduler")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: /mail/i })).not.toBeInTheDocument();
  });
});
