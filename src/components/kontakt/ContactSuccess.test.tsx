// src/components/kontakt/ContactSuccess.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactSuccess } from "./ContactSuccess";

describe("ContactSuccess", () => {
  it("shows the thank-you headline and two next-step links", () => {
    render(<ContactSuccess />);
    expect(screen.getByText(/ich melde mich/i)).toBeInTheDocument();
    const arbeit = screen.getByRole("link", { name: /Meine Arbeit ansehen/i });
    expect(arbeit).toHaveAttribute("href", "/leistungen");
    const ratgeber = screen.getByRole("link", { name: /Ratgeber lesen/i });
    expect(ratgeber).toHaveAttribute("href", "/ratgeber");
  });

  it("renders the headline on-light (honey card)", () => {
    render(<ContactSuccess />);
    expect(screen.getByText(/ich melde mich/i)).toHaveClass("text-tiefes-wasser");
  });
});
