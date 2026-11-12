import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqItem } from "./FaqItem";

describe("FaqItem", () => {
  it("renders a native details/summary with the question and the answer as bullets", () => {
    const { container } = render(
      <FaqItem question="Arbeitest du remote?" answer={["Ja, komplett remote", "Kurze Calls"]} />
    );
    expect(container.querySelector("details")).toBeInTheDocument();
    expect(container.querySelector("summary")).toHaveTextContent("Arbeitest du remote?");
    expect([...container.querySelectorAll("ul li")].map((li) => li.textContent)).toEqual(["Ja, komplett remote", "Kurze Calls"]);
    expect(screen.getByText("Kurze Calls")).toBeInTheDocument();
  });

  it("uses on-dark classes when onDark is set", () => {
    const { container } = render(
      <FaqItem question="Frage?" answer={["Antwort"]} onDark />
    );
    expect(container.querySelector("summary")).toHaveClass("text-papier");
    expect(container.querySelector("ul")).toHaveClass("text-gletscher");
  });

  it("uses light-page classes by default", () => {
    const { container } = render(<FaqItem question="Frage?" answer={["Antwort"]} />);
    expect(container.querySelector("summary")).toHaveClass("text-tiefes-wasser");
    expect(container.querySelector("ul")).toHaveClass("text-tinte");
  });
});
