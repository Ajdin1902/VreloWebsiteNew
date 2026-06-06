import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Steps } from "./Steps";

describe("Steps", () => {
  it("renders on a petrol cool band", () => {
    const { container } = render(<Steps />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });

  it("keeps all three steps", () => {
    render(<Steps />);
    expect(screen.getByText("Hinschauen")).toBeInTheDocument();
    expect(screen.getByText("Bauen")).toBeInTheDocument();
    expect(screen.getByText("Fließen")).toBeInTheDocument();
  });
});
