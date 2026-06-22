// src/components/newsletter/NewsletterSuccess.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NewsletterSuccess } from "./NewsletterSuccess";

describe("NewsletterSuccess", () => {
  it("shows a thank-you status and the water banner image", () => {
    render(<NewsletterSuccess />);
    expect(screen.getByRole("status")).toHaveTextContent(/Fast geschafft/i);
    expect(screen.getByAltText(/Wasserlauf/i)).toBeInTheDocument();
  });

  it("renders the thank-you heading on-dark (petrol section)", () => {
    render(<NewsletterSuccess />);
    expect(screen.getByText("Fast geschafft.")).toHaveClass("text-papier");
  });
});
