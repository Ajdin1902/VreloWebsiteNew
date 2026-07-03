import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Demo } from "./Demo";

describe("Demo", () => {
  it("walks setup → role switch", () => {
    render(<Demo calLink={undefined} />);
    expect(screen.getByText(/Was bietest du an/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Was bietest du an/i), { target: { value: "Baufi" } });
    fireEvent.click(screen.getByRole("button", { name: /Los geht/i }));
    expect(screen.getByText(/dein eigener Kunde/i)).toBeTruthy();
  });
});
