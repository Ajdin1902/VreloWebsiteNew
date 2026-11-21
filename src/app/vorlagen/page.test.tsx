import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

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

  it("shows the Aufwand-Skala as an ordered list of six stops under the hero", () => {
    params.src = null;
    render(<VorlagenPage />);
    expect(screen.getByRole("heading", { name: "Wer macht die Arbeit?" })).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "Wer macht die Arbeit?" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(6);
    expect(within(list).getByRole("link", { name: "Claude-Gehirn" })).toHaveAttribute("href", "#claude-gehirn");
    expect(within(list).getByRole("link", { name: "Umsetzung" })).toHaveAttribute("href", "/leistungen/prozessautomatisierung");
    expect(screen.getByText("Du machst es selbst")).toBeInTheDocument();
    expect(screen.getByText("Ich mache es für dich")).toBeInTheDocument();
  });

  it("gives the Bauplan groups a jump target for the scale", () => {
    params.src = null;
    render(<VorlagenPage />);
    expect(document.getElementById("gruppe-handwerk")).not.toBeNull();
  });
});
