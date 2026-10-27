import { render, screen, fireEvent } from "@testing-library/react";
import { vi, it, expect } from "vitest";
const action = vi.hoisted(() => vi.fn(async (): Promise<unknown> => ({ status: "ok" })));
vi.mock("@/app/bauplan/actions", () => ({ submitBauplanRequest: action }));
import { BauplanPdfForm } from "./BauplanPdfForm";
import { normalizeSource } from "@/lib/source";

it("renders the mail field, the hinweis and the Datenschutz link, and shows the success line after submit", async () => {
  render(<BauplanPdfForm source="ag01" code="c1" />);
  expect(screen.getByLabelText("Deine E-Mail-Adresse")).toBeInTheDocument();
  expect(screen.getByText(/nur diese eine Mail/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz");
  expect(document.querySelector('input[name="src"]')).toHaveAttribute("value", "ag01");
  fireEvent.submit(screen.getByRole("button", { name: "Bauplan zuschicken" }).closest("form")!);
  expect(await screen.findByRole("status")).toHaveTextContent(/unterwegs/);
});

it("carries a normalised src and drops junk (the page passes normalizeSource output)", () => {
  expect(normalizeSource("AG01")).toBe("ag01");
  expect(normalizeSource("<script>")).toBeUndefined();
  render(<BauplanPdfForm source={normalizeSource("AG01")} code="c1" />);
  expect(document.querySelector('input[name="src"]')).toHaveAttribute("value", "ag01");
});

it("carries the page code as a hidden field", () => {
  render(<BauplanPdfForm code="agentur-7k3m" />);
  expect(document.querySelector('input[name="code"]')).toHaveAttribute("value", "agentur-7k3m");
});

it("keeps the typed address after an invalid result", async () => {
  action.mockResolvedValueOnce({ status: "invalid", error: "Bitte prüfe die Adresse.", email: "nope@x" });
  render(<BauplanPdfForm code="c1" />);
  fireEvent.submit(screen.getByRole("button", { name: "Bauplan zuschicken" }).closest("form")!);
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.getByLabelText("Deine E-Mail-Adresse")).toHaveValue("nope@x");
});
