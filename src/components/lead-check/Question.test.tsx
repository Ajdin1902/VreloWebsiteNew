// src/components/lead-check/Question.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Question } from "./Question";
import { STEPS } from "@/lib/leadCheck";

const choiceStep = STEPS.find((s) => s.id === "reaktionszeit")!;
const numberStep = STEPS.find((s) => s.id === "anfragenProWoche")!;
const optionalStep = STEPS.find((s) => s.id === "provision")!;

describe("Question", () => {
  it("renders choice options and reports the chosen value", () => {
    const onAnswer = vi.fn();
    render(<Question step={choiceStep} onAnswer={onAnswer} onBack={vi.fn()} showBack={false} />);
    fireEvent.click(screen.getByRole("button", { name: "am selben Tag" }));
    expect(onAnswer).toHaveBeenCalledWith("selberTag");
  });

  it("reports a parsed number from the number step", () => {
    const onAnswer = vi.fn();
    render(<Question step={numberStep} onAnswer={onAnswer} onBack={vi.fn()} showBack={false} />);
    fireEvent.change(screen.getByLabelText(numberStep.label), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(onAnswer).toHaveBeenCalledWith(12);
  });

  it("offers Überspringen on the optional step and reports undefined", () => {
    const onAnswer = vi.fn();
    render(<Question step={optionalStep} onAnswer={onAnswer} onBack={vi.fn()} showBack />);
    fireEvent.click(screen.getByRole("button", { name: "Überspringen" }));
    expect(onAnswer).toHaveBeenCalledWith(undefined);
  });

  it("disables Weiter on a required number step until a value is entered", () => {
    const onAnswer = vi.fn();
    render(<Question step={numberStep} onAnswer={onAnswer} onBack={vi.fn()} showBack={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(onAnswer).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(numberStep.label), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: "Weiter" }));
    expect(onAnswer).toHaveBeenCalledWith(12);
  });
});
