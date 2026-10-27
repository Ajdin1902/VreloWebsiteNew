import { render, screen, fireEvent } from "@testing-library/react";
import { vi, it, expect } from "vitest";
vi.mock("@/app/bauplan/actions", () => ({ submitBauplanRequest: vi.fn(async () => ({ status: "ok" })) }));
import { BauplanPdfForm } from "./BauplanPdfForm";
import { normalizeSource } from "@/lib/source";

it("renders the mail field, the hinweis and the Datenschutz link, and shows the success line after submit", async () => {
  render(<BauplanPdfForm source="ag01" />);
  expect(screen.getByLabelText("Deine E-Mail-Adresse")).toBeInTheDocument();
  expect(screen.getByText(/nur diese eine Mail/)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/datenschutz");
  expect(document.querySelector('input[name="src"]')).toHaveAttribute("value", "ag01");
  fireEvent.submit(screen.getByRole("button", { name: "PDF zuschicken" }).closest("form")!);
  expect(await screen.findByRole("status")).toHaveTextContent(/unterwegs/);
});

it("carries a normalised src and drops junk (the page passes normalizeSource output)", () => {
  expect(normalizeSource("AG01")).toBe("ag01");
  expect(normalizeSource("<script>")).toBeUndefined();
  render(<BauplanPdfForm source={normalizeSource("AG01")} />);
  expect(document.querySelector('input[name="src"]')).toHaveAttribute("value", "ag01");
});
