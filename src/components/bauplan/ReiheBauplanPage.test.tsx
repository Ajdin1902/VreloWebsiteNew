import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";
import { ReiheBauplanPage } from "./ReiheBauplanPage";
import { reiheNischen } from "@/lib/bauplanReihe";
import { abschluss, wochenplan, deckblatt, formular } from "@/lib/bauplanReihe/shared";

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
  // "Kostenlos." belongs to the close only, never twice in a row.
  expect(screen.getByRole("heading", { name: formular.heading })).toBeInTheDocument();
  expect(screen.getAllByText(/Kostenlos/)).toHaveLength(1);
  expect(screen.getByRole("link", { name: abschluss.button })).toHaveAttribute("href", "/kontakt?src=bauplan-shk");
});

it("announces each circled verb as a loss, and only where one exists", () => {
  const { container } = render(<ReiheBauplanPage data={shk} />);
  const items = [...container.querySelectorAll("#schmerz ol > li")];
  expect(items).toHaveLength(shk.auftragsweg.length);
  shk.auftragsweg.forEach((s, i) => {
    const sr = items[i].querySelectorAll(".sr-only");
    expect(sr).toHaveLength(s.verlust ? 1 : 0);
    if (s.verlust) expect(items[i]).toHaveTextContent(`${s.schritt}Verlust: ${s.verlust}`);
  });
  expect(shk.auftragsweg.some((s) => !s.verlust)).toBe(true);
});
