import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RoleSwitch } from "./RoleSwitch";
import type { DemoSeed } from "@/lib/demo/seed";

const seed: DemoSeed = { business: "x", appointmentType: "baufinanzierung", tone: "foermlich" };

describe("RoleSwitch", () => {
  it("frames the role switch and starts with a blank message", () => {
    const onStart = vi.fn();
    render(<RoleSwitch seed={seed} onStart={onStart} />);
    expect(screen.getByText(/dein eigener Kunde/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /selbst schreiben/i }));
    expect(onStart).toHaveBeenCalledWith("");
  });
  it("suggests an opener that matches the chosen appointment type", () => {
    const onStart = vi.fn();
    render(<RoleSwitch seed={seed} onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /Baufinanzierung/i }));
    expect(onStart).toHaveBeenCalledWith(expect.stringContaining("Baufinanzierung"));
  });
  it("adapts anrede + anlass for a locker Versicherungs-Check", () => {
    const onStart = vi.fn();
    render(<RoleSwitch seed={{ business: "x", appointmentType: "versicherung", tone: "locker" }} onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /Versicherung/i }));
    const msg = onStart.mock.calls[0][0] as string;
    expect(msg).toMatch(/Versicherung/);
    expect(msg).toMatch(/\bdu\b|\bdir\b|hast du\b/i); // locker → Du-form
  });
});
