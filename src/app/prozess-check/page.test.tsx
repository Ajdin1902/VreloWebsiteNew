import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProzessCheckPage, { metadata } from "./page";

vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams("") }));

describe("/prozess-check", () => {
  it("keeps the question headline", () => {
    render(<ProzessCheckPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Wie viel Zeit frisst der Kleinkram bei dir?" })).toBeInTheDocument();
  });

  // v2: the wizard opens on its own short intro screen, then question 1.
  it("opens on the wizard intro, without the old intro paragraph", () => {
    const { container } = render(<ProzessCheckPage />);
    expect(container.textContent).not.toContain("schwarz auf weiß");
    expect(screen.getByText("Dein Vorab-Fahrplan in 5 Minuten")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Los geht's" })).toBeInTheDocument();
  });

  it("says under the hero and in the meta that the Vorab-Fahrplan comes as a PDF by mail", () => {
    render(<ProzessCheckPage />);
    expect(screen.getByText("Ein paar Fragen, danach kommt dein Vorab-Fahrplan als PDF per Mail.")).toBeInTheDocument();
    expect(String(metadata.description)).toContain("Vorab-Fahrplan als PDF per Mail");
  });

  it("uses the compact hero so the first answers are on the first screen", () => {
    const { container } = render(<ProzessCheckPage />);
    expect(container.querySelector("section")).toHaveClass("min-h-[34vh]");
  });
});
