import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Problem } from "./Problem";

describe("Problem", () => {
  it("renders the heading and all four recurring tasks", () => {
    render(<Problem />);
    expect(
      screen.getByRole("heading", { name: /Kleinkram frisst deinen Tag/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Aus Kundenanfragen Termine buchen/i)).toBeInTheDocument();
    expect(screen.getByText(/Fehlenden Unterlagen hinterherlaufen/i)).toBeInTheDocument();
    expect(screen.getByText(/Rechnungen schreiben und nachfassen/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Daten von einem System ins nächste übertragen/i),
    ).toBeInTheDocument();
  });

  it("wraps the task list in a card-depth panel", () => {
    const { container } = render(<Problem />);
    const panel = container.querySelector(".card-depth");
    expect(panel).not.toBeNull();
    expect(panel?.querySelectorAll("li")).toHaveLength(4);
  });
});
