import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardHeading } from "./CardHeading";

describe("CardHeading", () => {
  it("renders the heading on-light (honey card)", () => {
    render(<CardHeading />);
    expect(screen.getByRole("heading", { name: /Schreib mir/i })).toHaveClass(
      "text-tiefes-wasser"
    );
  });
});
