// src/components/newsletter/ConfirmResult.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfirmResult } from "./ConfirmResult";

describe("ConfirmResult", () => {
  it("shows a success message for ok", () => {
    render(<ConfirmResult status="ok" />);
    expect(screen.getByText(/Bestätigt/i)).toBeInTheDocument();
  });
  it("shows a calm error + link back for invalid", () => {
    render(<ConfirmResult status="invalid" />);
    expect(screen.getByText(/ungültig oder abgelaufen/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Newsletter/i })).toHaveAttribute("href", "/newsletter");
  });
  it("shows a generic error for error", () => {
    render(<ConfirmResult status="error" />);
    expect(screen.getByText(/schiefgelaufen/i)).toBeInTheDocument();
  });
});
