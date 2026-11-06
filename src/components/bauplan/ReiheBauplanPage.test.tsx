import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { ReiheBauplanPage } from "./ReiheBauplanPage";
import { reiheNischen } from "@/lib/bauplanReihe";
import { abschluss, wochenplan, deckblatt } from "@/lib/bauplanReihe/shared";

const shk = reiheNischen.shk;

it("renders the question, the job flow with circled verbs, the caption and the form slot", () => {
  const { container } = render(<ReiheBauplanPage data={shk} form={<div data-testid="slot" />} />);
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(shk.title);
  expect(screen.getByText(shk.schmerz)).toBeInTheDocument();
  for (const s of shk.auftragsweg) {
    expect(screen.getByText(s.schritt)).toBeInTheDocument();
    if (s.verlust) expect(screen.getByText(s.verlust)).toBeInTheDocument();
  }
  expect(screen.getByText(deckblatt.kreisSatz)).toBeInTheDocument();
  expect(container.querySelector("#pdf")).toContainElement(screen.getByTestId("slot"));
});

it("shows the statistic with a visible source link", () => {
  render(<ReiheBauplanPage data={shk} />);
  expect(screen.getByText(shk.statistik!.zahl)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: shk.statistik!.linkText })).toHaveAttribute("href", shk.statistik!.href);
});

it("omits the statistic block when the niche has none", () => {
  render(<ReiheBauplanPage data={{ ...shk, statistik: null }} />);
  expect(screen.queryByTestId("statistik")).toBeNull();
  expect(screen.queryByRole("link", { name: shk.statistik!.linkText })).toBeNull();
});

it("lists the five days and closes with the contact button", () => {
  render(<ReiheBauplanPage data={shk} />);
  expect(screen.getByText(wochenplan.heading)).toBeInTheDocument();
  for (const t of wochenplan.tage) expect(screen.getByText(t)).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: abschluss.heading })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: abschluss.button })).toHaveAttribute("href", "/kontakt?src=bauplan-shk");
});
