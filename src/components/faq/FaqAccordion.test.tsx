import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FaqAccordion } from "./FaqAccordion";
import type { FaqGroup } from "@/lib/faq";

const groups: FaqGroup[] = [
  {
    theme: "Zusammenarbeit",
    entries: [
      { question: "Frage A?", answer: "Antwort A." },
      { question: "Frage B?", answer: "Antwort B." },
    ],
  },
  {
    theme: "Kosten",
    entries: [{ question: "Frage C?", answer: "Antwort C." }],
  },
];

describe("FaqAccordion", () => {
  it("renders each theme heading", () => {
    render(<FaqAccordion groups={groups} />);
    expect(screen.getByRole("heading", { name: "Zusammenarbeit" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kosten" })).toBeInTheDocument();
  });

  it("renders every question across all groups as a details element", () => {
    const { container } = render(<FaqAccordion groups={groups} />);
    expect(container.querySelectorAll("details").length).toBe(3);
    expect(screen.getByText("Frage A?")).toBeInTheDocument();
    expect(screen.getByText("Frage C?")).toBeInTheDocument();
  });

  it("renders the middle group on a petrol section, the others on paper", () => {
    const three: FaqGroup[] = [
      { theme: "Eins", entries: [{ question: "F1?", answer: "A1." }] },
      { theme: "Zwei", entries: [{ question: "F2?", answer: "A2." }] },
      { theme: "Drei", entries: [{ question: "F3?", answer: "A3." }] },
    ];
    const { container } = render(<FaqAccordion groups={three} />);
    const sections = container.querySelectorAll("section");
    expect(sections).toHaveLength(3);
    expect(sections[0]).toHaveClass("bg-papier");
    expect(sections[1]).toHaveClass("bg-vrelo-petrol");
    expect(sections[2]).toHaveClass("bg-papier");
  });
});
