import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqItem } from "./FaqItem";

describe("FaqItem", () => {
  it("renders a native details/summary with the question and answer", () => {
    const { container } = render(
      <FaqItem question="Arbeitest du remote?" answer="Ja, komplett remote." />
    );
    expect(container.querySelector("details")).toBeInTheDocument();
    expect(container.querySelector("summary")).toHaveTextContent("Arbeitest du remote?");
    expect(screen.getByText("Ja, komplett remote.")).toBeInTheDocument();
  });
});
