import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Result } from "./Result";
import { resultCopy, type ProzessCheckAnswers } from "@/lib/prozessCheck";

vi.mock("@/components/kontakt/SchedulerEmbed", () => ({
  SchedulerEmbed: () => <div data-testid="scheduler" />,
}));

const answers: ProzessCheckAnswers = {
  branche: "handwerk",
  team: "6bis20",
  stunden: { anfragen: 3, auftraege: 0, rechnungen: 5, daten: 1, erinnern: 0, orga: 0 },
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("Result", () => {
  it("shows hours + top-area profile + scheduler + email form when fitting", () => {
    render(<Result answers={answers} copy={resultCopy(answers)} calLink="https://cal.eu/x" />);
    expect(screen.getByText(/9 Stunden/)).toBeInTheDocument();
    // "Rechnungen, Belege ..." appears twice by design here: once as the top
    // area's own label, once in the "nervt" line, since the visitor's pick
    // happens to be the top area too. Assert presence, not uniqueness.
    expect(screen.getAllByText(/Rechnungen, Belege/).length).toBeGreaterThan(0);
    expect(screen.getByTestId("scheduler")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /mail/i })).toBeInTheDocument();
  });

  it("shows the soft exit and no scheduler on the zero-state", () => {
    const zero: ProzessCheckAnswers = { ...answers, stunden: { anfragen: 0, auftraege: 0, rechnungen: 0, daten: 0, erinnern: 0, orga: 0 } };
    render(<Result answers={zero} copy={resultCopy(zero)} calLink={undefined} />);
    expect(screen.queryByTestId("scheduler")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Quelle/ })).toBeInTheDocument();
  });
});
