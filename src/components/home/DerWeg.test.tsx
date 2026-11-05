import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DerWeg } from "./DerWeg";
import { questionCountPhrase } from "@/lib/prozessCheckCta";
import { STEPS } from "@/lib/prozessCheck";

describe("DerWeg", () => {
  it("names the three free steps in order and starts on the Prozess-Check", () => {
    render(<DerWeg />);
    expect(screen.getByRole("heading", { level: 2, name: /Kostenlos/ })).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Prozess-Check",
      "Prozess-Audit",
      "Fahrplan",
    ]);
    // The question count follows the quiz, like the FAQ.
    expect(screen.getByText(new RegExp(questionCountPhrase(STEPS.length)))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute("href", "/prozess-check?src=home-weg");
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });
});
