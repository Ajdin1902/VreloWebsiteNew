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
    expect(screen.getByText(/Neue Aufträge erfassen und weitergeben/i)).toBeInTheDocument();
    expect(screen.getByText(/Rechnungen schreiben und nachfassen/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Daten von einem System ins nächste übertragen/i),
    ).toBeInTheDocument();
  });

  it("bridges to the Prozess-Check with exactly one link", () => {
    render(<Problem />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/prozess-check");
  });

  it("wraps the task list in a card-depth panel", () => {
    const { container } = render(<Problem />);
    const panel = container.querySelector(".card-depth");
    expect(panel).not.toBeNull();
    expect(panel?.querySelectorAll("li")).toHaveLength(4);
  });
});
