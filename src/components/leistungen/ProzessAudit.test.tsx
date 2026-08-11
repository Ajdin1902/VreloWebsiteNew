import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProzessAudit } from "./ProzessAudit";
import { prozessAudit } from "@/lib/prozess-audit";

describe("ProzessAudit", () => {
  it("renders the heading", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("heading", { name: prozessAudit.heading })).toBeInTheDocument();
  });

  it("renders all five handbook inclusions", () => {
    render(<ProzessAudit />);
    for (const item of prozessAudit.deliverables) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("shows the guarantee", () => {
    render(<ProzessAudit />);
    expect(screen.getByText(prozessAudit.guarantee)).toBeInTheDocument();
  });

  it("shows the keep-note (the fahrplan-is-yours reassurance)", () => {
    render(<ProzessAudit />);
    expect(screen.getByText(prozessAudit.keepNote)).toBeInTheDocument();
  });

  it("links the CTA to the free Erstgespräch", () => {
    render(<ProzessAudit />);
    const cta = screen.getByRole("link", { name: prozessAudit.cta.label });
    expect(cta).toHaveAttribute("href", "/kontakt");
  });
});
