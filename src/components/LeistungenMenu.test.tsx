import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LeistungenMenu } from "./LeistungenMenu";

const toggle = () => screen.getByRole("button", { name: "Leistungen-Menü" });

describe("LeistungenMenu", () => {
  it("keeps Leistungen a link to the hub and the panel closed by default", () => {
    render(<LeistungenMenu pathname="/" />);
    expect(screen.getByRole("link", { name: "Leistungen" })).toHaveAttribute("href", "/leistungen");
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "KI-Schulung" })).toBeNull();
  });

  it("opens on click with all seven services and an overview link", () => {
    render(<LeistungenMenu pathname="/" />);
    fireEvent.click(toggle());
    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "KI-Schulung" })).toHaveAttribute("href", "/leistungen/ki-schulung");
    expect(screen.getByRole("link", { name: /Alle Leistungen/ })).toHaveAttribute("href", "/leistungen");
  });

  it("closes on Escape and returns focus to the toggle", () => {
    render(<LeistungenMenu pathname="/" />);
    fireEvent.click(toggle());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(toggle()).toHaveFocus();
  });

  it("closes on a click outside and when focus leaves", () => {
    render(
      <div>
        <LeistungenMenu pathname="/" />
        <button type="button">draußen</button>
      </div>,
    );
    fireEvent.click(toggle());
    fireEvent.mouseDown(screen.getByRole("button", { name: "draußen" }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle());
    fireEvent.focusIn(screen.getByRole("button", { name: "draußen" }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the current subpage and highlights the section", () => {
    render(<LeistungenMenu pathname="/leistungen/claude" />);
    expect(screen.getByRole("link", { name: "Leistungen" })).toHaveClass("text-vrelo-petrol");
    fireEvent.click(toggle());
    expect(screen.getByRole("link", { name: "Claude für Unternehmen" })).toHaveAttribute("aria-current", "page");
  });

  it("closes when the route changes (Header persists across navigation)", () => {
    const { rerender } = render(<LeistungenMenu pathname="/" />);
    fireEvent.click(toggle());
    rerender(<LeistungenMenu pathname="/leistungen" />);
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when the hub label itself is clicked", () => {
    render(<LeistungenMenu pathname="/" />);
    fireEvent.click(toggle());
    fireEvent.click(screen.getByRole("link", { name: "Leistungen" }));
    expect(toggle()).toHaveAttribute("aria-expanded", "false");
  });
});
