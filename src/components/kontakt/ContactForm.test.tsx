// src/components/kontakt/ContactForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactForm } from "./ContactForm";

describe("ContactForm", () => {
  it("renders all fields, a consent link to /datenschutz, and a submit button", () => {
    render(<ContactForm />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Was frisst gerade deine Zeit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Betrieb/i)).toBeInTheDocument();
    const consentLink = screen.getByRole("link", { name: /Datenschutz/i });
    expect(consentLink).toHaveAttribute("href", "/datenschutz");
    expect(screen.getByRole("button", { name: /senden/i })).toBeInTheDocument();
  });

  it("includes a visually-hidden honeypot field not exposed to assistive tech", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector('input[name="website"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
  });
});
