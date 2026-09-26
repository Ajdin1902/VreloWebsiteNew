import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProzessAudit } from "./ProzessAudit";
import { prozessAudit } from "@/lib/prozess-audit";

describe("ProzessAudit", () => {
  it("renders the heading", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("heading", { name: prozessAudit.heading })).toBeInTheDocument();
  });

  it("renders all deliverables", () => {
    render(<ProzessAudit />);
    for (const item of prozessAudit.deliverables) {
      expect(screen.getByText(item)).toBeInTheDocument();
    }
  });

  it("links the primary CTA to the Prozess-Check", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("link", { name: prozessAudit.cta.label })).toHaveAttribute(
      "href",
      "/prozess-check?src=leistungen-audit",
    );
  });

  it("links the quiet secondary path to the booking page", () => {
    render(<ProzessAudit />);
    expect(screen.getByRole("link", { name: prozessAudit.secondary.label })).toHaveAttribute("href", "/kontakt");
  });
});
