import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProblemSection } from "./ProblemSection";
import { Bridge } from "./Bridge";
import { WarumIch } from "./WarumIch";
import { Garantie } from "./Garantie";
import { Einwaende } from "./Einwaende";
import { TerminSection } from "./TerminSection";
import { makler } from "@/lib/makler";

describe("ProblemSection", () => {
  it("names both leaks before either product is introduced", () => {
    render(<ProblemSection />);
    for (const leak of makler.problem.leaks) {
      expect(screen.getByRole("heading", { level: 3, name: leak.title })).toBeInTheDocument();
    }
  });
});

describe("Bridge", () => {
  it("frames the second product as the next step", () => {
    render(<Bridge />);
    expect(screen.getByRole("heading", { level: 2, name: makler.bridge.title })).toBeInTheDocument();
  });
});

describe("WarumIch", () => {
  it("lists every differentiator", () => {
    render(<WarumIch />);
    for (const p of makler.warumIch.points) {
      expect(screen.getByRole("heading", { level: 3, name: p.title })).toBeInTheDocument();
    }
  });
});

describe("Garantie", () => {
  it("states all three promises and the founding note", () => {
    render(<Garantie />);
    for (const p of makler.garantie.promises) {
      expect(screen.getByRole("heading", { level: 3, name: p.title })).toBeInTheDocument();
    }
    expect(screen.getByText(makler.garantie.founding.body)).toBeInTheDocument();
  });
});

describe("Einwaende", () => {
  it("renders every objection as a disclosure", () => {
    const { container } = render(<Einwaende />);
    expect(container.querySelectorAll("details")).toHaveLength(makler.einwaende.items.length);
  });
});

describe("TerminSection", () => {
  it("carries the anchor the header CTA points at", () => {
    const { container } = render(<TerminSection calLink={undefined} />);
    const anchor = container.querySelector("#termin");
    expect(anchor).not.toBeNull();
    // The scroll offset must live on the anchored element itself — CSS
    // scroll-margin-top is not inherited from an ancestor, so it has to
    // co-locate with id="termin" to clear the sticky header on #termin links.
    expect(anchor?.className).toMatch(/\bscroll-mt-/);
  });

  it("offers the written route when no scheduler is configured", () => {
    render(<TerminSection calLink={undefined} />);
    expect(screen.getByText(makler.close.fallbackHint)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: makler.close.fallback.label })).toHaveAttribute(
      "href",
      "/kontakt",
    );
  });
});
