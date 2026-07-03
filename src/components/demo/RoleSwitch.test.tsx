import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoleSwitch } from "./RoleSwitch";

describe("RoleSwitch", () => {
  it("frames the role switch and starts with a blank message", () => {
    const onStart = vi.fn();
    render(<RoleSwitch onStart={onStart} />);
    expect(screen.getByText(/dein eigener Kunde/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /selbst schreiben/i }));
    expect(onStart).toHaveBeenCalledWith("");
  });
  it("starts with the suggested opener when the chip is used", () => {
    const onStart = vi.fn();
    render(<RoleSwitch onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /Baufinanzierung/i }));
    expect(onStart).toHaveBeenCalledWith(expect.stringContaining("Baufinanzierung"));
  });
});
