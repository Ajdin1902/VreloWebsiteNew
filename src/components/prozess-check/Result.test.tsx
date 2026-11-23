import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Result } from "./Result";
import { RESULT_UI, resultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";
import { FORM_UI } from "@/lib/vorabFahrplan/blocks";

vi.mock("@/app/prozess-check/actions", () => ({ submitVorabFahrplan: vi.fn() }));

const answers: ProzessCheckAnswers = {
  bereiche: ["anfragen", "rechnungen", "daten"],
  stunden: { anfragen: 3, rechnungen: 5, daten: 1 },
  kanaele: ["mail"],
  menge: "5bis20",
  wer: "ich",
  programmeChips: ["Outlook", "Excel"],
  programmeText: "",
  arbeitstag: "",
  arbeitsort: "buero",
  branche: "handwerk",
  team: "6bis20",
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("Result", () => {
  it("shows hours, the top-area profile, the form with consent and the Cal.com link when fitting", () => {
    const { container } = render(<Result answers={answers} copy={resultCopy(answers)} calUrl="https://cal.com/x/30min" />);
    expect(screen.getByText(/9 Stunden/)).toBeInTheDocument();
    // "Rechnungen, Belege ..." appears twice by design here: once as the top
    // area's own label, once in the "nervt" line, since the visitor's pick
    // happens to be the top area too. Assert presence, not uniqueness.
    expect(screen.getAllByText(/Rechnungen, Belege/).length).toBeGreaterThan(0);
    for (const name of ["Name", "Firma", "E-Mail", "Telefon"]) expect(screen.getByRole("textbox", { name })).toBeInTheDocument();
    expect(screen.getByText(FORM_UI.consentAnruf)).toBeInTheDocument();
    expect(screen.getByText(FORM_UI.consentKi)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: FORM_UI.checkbox })).toBeInTheDocument();
    const cal = screen.getByRole("link", { name: "Lieber gleich einen Termin?" });
    expect(cal).toHaveAttribute("href", "https://cal.com/x/30min");
    // Every answer travels as hidden inputs, one per list entry.
    expect(container.querySelectorAll('input[type="hidden"][name="programmeChips"]')).toHaveLength(2);
    expect(container.querySelectorAll('input[type="hidden"][name="bereiche"]')).toHaveLength(3);
    expect(container.querySelector('input[name="h_rechnungen"]')).toHaveValue("5");
  });

  it("carries the source into the Cal.com booking note", () => {
    render(<Result answers={answers} copy={resultCopy(answers)} calUrl="https://cal.com/x/30min" source="brief-handwerk" />);
    expect(screen.getByRole("link", { name: RESULT_UI.calSecondary })).toHaveAttribute(
      "href",
      `https://cal.com/x/30min?notes=${encodeURIComponent("Quelle: brief-handwerk")}`,
    );
  });

  it("shows no Cal.com link without a booking URL", () => {
    render(<Result answers={answers} copy={resultCopy(answers)} calUrl={undefined} />);
    expect(screen.queryByRole("link", { name: RESULT_UI.calSecondary })).not.toBeInTheDocument();
  });

  it("zero hours: no form, the exit text is unchanged", () => {
    const zero: ProzessCheckAnswers = { ...answers, stunden: { anfragen: 0, rechnungen: 0, daten: 0 } };
    render(<Result answers={zero} copy={resultCopy(zero)} calUrl="https://cal.com/x/30min" />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: RESULT_UI.calSecondary })).not.toBeInTheDocument();
    expect(screen.getByText(RESULT_UI.exitLead)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quelle/ })).toBeInTheDocument();
  });

  it("moves focus to the result heading when it appears", () => {
    render(<Result answers={answers} copy={resultCopy(answers)} calUrl={undefined} />);
    expect(document.activeElement).toBe(screen.getByRole("heading", { name: RESULT_UI.resultLabel }));
  });
});
