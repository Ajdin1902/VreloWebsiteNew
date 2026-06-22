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

  it("uses on-dark classes when onDark is set", () => {
    const { container } = render(
      <FaqItem question="Frage?" answer="Antwort." onDark />
    );
    expect(container.querySelector("summary")).toHaveClass("text-papier");
    expect(container.querySelector("p")).toHaveClass("text-gletscher");
  });

  it("uses light-page classes by default", () => {
    const { container } = render(<FaqItem question="Frage?" answer="Antwort." />);
    expect(container.querySelector("summary")).toHaveClass("text-tiefes-wasser");
    expect(container.querySelector("p")).toHaveClass("text-tinte");
  });
});
