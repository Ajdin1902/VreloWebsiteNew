import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProzessCheckPage from "./page";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("") }));

describe("/prozess-check", () => {
  it("keeps the question headline", () => {
    render(<ProzessCheckPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Wie viel Zeit frisst der Kleinkram bei dir?" })).toBeInTheDocument();
  });

  // Decision 2026-09-26: the visitor arrives from a button that already said
  // what the check is; the intro paragraph only delayed the first question.
  it("opens straight on the questionnaire, without the intro paragraph", () => {
    const { container } = render(<ProzessCheckPage />);
    expect(container.textContent).not.toContain("schwarz auf weiß");
    expect(screen.getByText("Was machst du?")).toBeInTheDocument();
  });
});
