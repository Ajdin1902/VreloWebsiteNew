import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { WennDuBaust } from "./WennDuBaust";
import { wennDuBaust } from "@/lib/leistungen-weg";

function mockMatchMedia(reducedMotion: boolean) {
  vi.stubGlobal(
    "matchMedia",
    (query: string) =>
      ({
        matches: reducedMotion && query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("WennDuBaust", () => {
  it("renders the heading and all six build deliverables", () => {
    render(<WennDuBaust />);
    expect(screen.getByRole("heading", { name: wennDuBaust.heading })).toBeInTheDocument();
    for (const phase of wennDuBaust.phases) {
      expect(screen.getByRole("heading", { name: phase.title })).toBeInTheDocument();
      expect(screen.getByText(phase.text)).toBeInTheDocument();
    }
  });

  it("falls back to the static stack under prefers-reduced-motion", () => {
    mockMatchMedia(true);
    const { container } = render(<WennDuBaust />);
    // The animated stage pins via position: sticky; the static fallback has no
    // sticky element and no tall scroll runway.
    expect(container.querySelector(".sticky")).toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(wennDuBaust.phases.length);
  });

  it("numbers the cards in order", () => {
    render(<WennDuBaust />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText(String(wennDuBaust.phases.length).padStart(2, "0"))).toBeInTheDocument();
  });
});
