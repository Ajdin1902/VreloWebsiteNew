import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const params = vi.hoisted(() => ({ src: "home-hero" as string | null }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(params.src ? { src: params.src } : {}),
}));

import VorlagenPage from "./page";

describe("/vorlagen", () => {
  it("passes the visitor's src on to the Bauplan and Prozess-Check links", () => {
    params.src = "home-hero";
    render(<VorlagenPage />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute("href", "/prozess-check?src=home-hero");
    const bauplan = screen.getAllByRole("link", { name: "Zum Bauplan" }).map((a) => a.getAttribute("href"));
    expect(bauplan).toContain("/vorlagen/shk-bauplan?src=home-hero");
    expect(screen.getByRole("link", { name: "PDF öffnen" })).toHaveAttribute("href", "/vorlagen/vrelo-ki-betriebssystem.pdf");
  });

  it("keeps the links clean without a src", () => {
    params.src = null;
    render(<VorlagenPage />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute("href", "/prozess-check?src=vorlagen");
  });

  it("closes on the free next step to the Gespräch", () => {
    params.src = null;
    render(<VorlagenPage />);
    expect(screen.getByText("Danach: 30 Minuten Gespräch, dann dein Fahrplan. Kostenlos.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Gespräch buchen" })).toHaveAttribute("href", "/kontakt?src=vorlagen");
  });
});
