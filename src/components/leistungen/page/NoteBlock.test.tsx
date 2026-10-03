// src/components/leistungen/page/NoteBlock.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoteBlock } from "./NoteBlock";

describe("NoteBlock", () => {
  it("opens external links in a new tab and says so", () => {
    render(<NoteBlock note={{ heading: "H", body: "B", link: { label: "Extern", href: "https://example.org/" } }} />);
    const a = screen.getByRole("link", { name: /Extern/ });
    expect(a).toHaveAttribute("target", "_blank");
    expect(a).toHaveTextContent("öffnet in neuem Tab");
  });

  it("keeps internal links in the same tab, without the new-tab hint", () => {
    render(<NoteBlock note={{ heading: "H", body: "B", link: { label: "Intern", href: "/claude-gehirn" } }} />);
    const a = screen.getByRole("link", { name: "Intern" });
    expect(a).not.toHaveAttribute("target");
    expect(a).toHaveAttribute("href", "/claude-gehirn");
    expect(a).not.toHaveTextContent("öffnet in neuem Tab");
  });
});
