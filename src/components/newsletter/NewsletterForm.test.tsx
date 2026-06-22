// src/components/newsletter/NewsletterForm.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsletterForm } from "./NewsletterForm";

describe("NewsletterForm", () => {
  it("renders an email field, a consent link to /datenschutz, and a submit button", () => {
    render(<NewsletterForm />);
    expect(screen.getByLabelText(/E-Mail/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /Datenschutz/i });
    expect(link).toHaveAttribute("href", "/datenschutz");
    expect(screen.getByRole("button", { name: /Anmelden/i })).toBeInTheDocument();
  });

  it("has a visually-hidden honeypot hidden from assistive tech", () => {
    const { container } = render(<NewsletterForm />);
    const hp = container.querySelector('input[name="website"]');
    expect(hp).not.toBeNull();
    expect(hp).toHaveAttribute("tabindex", "-1");
    expect(hp).toHaveAttribute("aria-hidden", "true");
  });

  it("renders the amber card heading in the full variant", () => {
    render(<NewsletterForm />);
    expect(screen.getByRole("heading", { name: /Trag dich ein/i })).toBeInTheDocument();
  });

  it("renders the full variant on an amber card", () => {
    const { container } = render(<NewsletterForm />);
    expect(container.querySelector(".rounded-2xl")).toHaveClass("bg-amber");
  });

  it("renders a compact variant without the card heading", () => {
    const { container } = render(<NewsletterForm compact />);
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(screen.queryByRole("heading", { name: /Trag dich ein/i })).toBeNull();
  });
});
