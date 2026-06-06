// src/components/legal/LegalPage.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LegalPage } from "./LegalPage";

describe("LegalPage", () => {
  it("renders the title and each section heading", () => {
    render(
      <LegalPage
        doc={{
          title: "Test-Titel",
          intro: "Intro-Text",
          sections: [{ heading: "Abschnitt A", body: "Inhalt A" }],
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Test-Titel" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Abschnitt A" })).toBeInTheDocument();
    expect(screen.getByText("Inhalt A")).toBeInTheDocument();
  });

  it("renders a markdown link in a section body as an external anchor", () => {
    render(
      <LegalPage
        doc={{
          title: "T",
          intro: "i",
          sections: [{ heading: "H", body: "siehe [Vrelo](https://example.de) hier" }],
        }}
      />,
    );
    const link = screen.getByRole("link", { name: "Vrelo" });
    expect(link).toHaveAttribute("href", "https://example.de");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("still renders plain bodies as text (no link)", () => {
    render(
      <LegalPage doc={{ title: "T", intro: "i", sections: [{ heading: "H", body: "nur Text" }] }} />,
    );
    expect(screen.getByText("nur Text")).toBeInTheDocument();
  });
});
