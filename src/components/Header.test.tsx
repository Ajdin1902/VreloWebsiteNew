import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

vi.mock("next/navigation", () => ({ usePathname: () => "/leistungen" }));

describe("Header", () => {
  it("renders the brand lockup wordmark", () => {
    render(<Header />);
    expect(screen.getAllByText("Vrelo").length).toBeGreaterThanOrEqual(1);
  });

  it("marks the current route as active (aria-current)", () => {
    render(<Header />);
    const active = screen.getByRole("link", { name: "Leistungen" });
    expect(active).toHaveAttribute("aria-current", "page");
  });

  it("includes the mobile menu trigger", () => {
    render(<Header />);
    expect(screen.getByRole("button", { name: /menü öffnen/i })).toBeInTheDocument();
  });

  it("keeps a compact CTA reachable on mobile (one tap, outside the drawer)", () => {
    render(<Header />);
    const compact = screen.getByRole("link", { name: "Erstgespräch" });
    expect(compact).toHaveAttribute("href", "/kontakt");
  });
});
