import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MobileNav } from "./MobileNav";

afterEach(cleanup);

describe("MobileNav", () => {
  it("is closed initially: trigger shows aria-expanded=false and no dialog", () => {
    render(<MobileNav />);
    expect(screen.getByRole("button", { name: /menü öffnen/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on trigger click and shows the nav links", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Leistungen" })).toBeInTheDocument();
  });

  it("closes on Escape and restores aria-expanded", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: /menü öffnen/i })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("closes when a nav link is activated", () => {
    render(<MobileNav />);
    fireEvent.click(screen.getByRole("button", { name: /menü öffnen/i }));
    fireEvent.click(screen.getByRole("link", { name: "FAQ" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
