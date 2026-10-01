import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import UeberMichPage from "./page";
import { portraits } from "@/lib/portraits";

describe("/ueber-mich", () => {
  it("shows the standing portrait beside the intro", () => {
    render(<UeberMichPage />);
    expect(screen.getByRole("img", { name: portraits.stehend.alt })).toBeInTheDocument();
  });

  it("shows the sitting portrait in the closing section", () => {
    render(<UeberMichPage />);
    const sitting = screen.getByRole("img", { name: portraits.sitzend.alt });
    const close = screen.getByRole("heading", { level: 2, name: "Fang klein an." }).closest("section");
    expect(close?.contains(sitting)).toBe(true);
  });

  it("carries no AI-imagery note any more (removed 2026-10-01)", () => {
    const { container } = render(<UeberMichPage />);
    expect(container.textContent).not.toMatch(/mit KI erzeugt/);
  });

  it("closes on the Prozess-Check with the ueber-mich slug", () => {
    render(<UeberMichPage />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=ueber-mich",
    );
  });
});
