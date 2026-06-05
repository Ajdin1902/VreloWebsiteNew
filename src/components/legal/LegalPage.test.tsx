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
});
