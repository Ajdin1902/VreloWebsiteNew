import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MerakClose } from "./MerakClose";

describe("MerakClose", () => {
  it("keeps the Merak-Effekt close", () => {
    render(<MerakClose />);
    expect(screen.getByText(/Merak/)).toBeInTheDocument();
  });

  it("adds a quiet note of continuity (the beginning of a working relationship)", () => {
    const { container } = render(<MerakClose />);
    expect(container.textContent).toMatch(/Anfang|Zusammenarbeit|in Ruhe/i);
  });
});
