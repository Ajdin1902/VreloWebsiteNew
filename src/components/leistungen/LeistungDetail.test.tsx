import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeistungDetail } from "./LeistungDetail";
import type { Leistung } from "@/lib/leistungen";

const sample: Leistung = {
  slug: "termine",
  title: "Termine & Bestätigungen",
  punchline: "Schluss mit Hinterhertelefonieren.",
  body: "Kurzer Beschreibungstext.",
  outcomes: ["weniger No-Shows", "automatische Erinnerungen"],
};

describe("LeistungDetail", () => {
  it("renders the title as an h2, the punchline and the body", () => {
    render(<LeistungDetail leistung={sample} index={0} />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Termine & Bestätigungen" })
    ).toBeInTheDocument();
    expect(screen.getByText("Schluss mit Hinterhertelefonieren.")).toBeInTheDocument();
    expect(screen.getByText("Kurzer Beschreibungstext.")).toBeInTheDocument();
  });

  it("renders every outcome chip", () => {
    render(<LeistungDetail leistung={sample} index={0} />);
    for (const outcome of sample.outcomes) {
      expect(screen.getByText(outcome)).toBeInTheDocument();
    }
  });

  it("labels the outcome list by the heading id", () => {
    const { container } = render(<LeistungDetail leistung={sample} index={0} />);
    const ul = container.querySelector("ul");
    const h2 = container.querySelector("h2");
    expect(h2?.id).toMatch(/\S/);
    expect(ul?.getAttribute("aria-labelledby")).toBe(h2?.id);
  });

  it("wraps the service in a card-depth panel", () => {
    const { container } = render(<LeistungDetail leistung={sample} index={0} />);
    expect(container.firstElementChild).toHaveClass("card-depth");
  });
});
