import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WennDuBaust } from "./WennDuBaust";
import { wennDuBaust } from "@/lib/leistungen-weg";

afterEach(cleanup);

describe("WennDuBaust", () => {
  it("renders the heading and all six build deliverables", () => {
    render(<WennDuBaust />);
    expect(screen.getByRole("heading", { name: wennDuBaust.heading })).toBeInTheDocument();
    for (const phase of wennDuBaust.phases) {
      expect(screen.getByRole("heading", { name: phase.title })).toBeInTheDocument();
      expect(screen.getByText(phase.text)).toBeInTheDocument();
    }
  });

  it("renders a plain, non-pinned grid of cards", () => {
    const { container } = render(<WennDuBaust />);
    // The section is a normal padded band now (no sticky scroll pin).
    expect(container.querySelector(".sticky")).toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(wennDuBaust.phases.length);
  });

  it("numbers the cards in order", () => {
    render(<WennDuBaust />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText(String(wennDuBaust.phases.length).padStart(2, "0"))).toBeInTheDocument();
  });
});
