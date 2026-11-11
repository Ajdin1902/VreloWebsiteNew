import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KiAgentenPage, { metadata } from "./page";
import { KI_AGENTEN, KI_AGENTEN_PATH } from "@/lib/kiAgenten";
import { canonical } from "@/lib/site";

// Ajdin 2026-11-11: a separate page with one agent per department as KI-Agenten examples.
describe("/leistungen/ki-agenten", () => {
  it("sets title, description and canonical", () => {
    expect(metadata.title).toBe(KI_AGENTEN.title);
    expect(metadata.description).toBe(KI_AGENTEN.metaDescription);
    expect(metadata.alternates?.canonical).toBe(canonical(KI_AGENTEN_PATH));
  });

  it("runs hero, the agents, Warum ich and the close, nothing else", () => {
    const { container } = render(<KiAgentenPage />);
    expect(screen.getByRole("heading", { level: 1, name: KI_AGENTEN.title })).toBeInTheDocument();
    const h2s = [...container.querySelectorAll("h2")].map((h) => h.textContent?.trim());
    expect(h2s).toEqual([KI_AGENTEN.heading, "Warum ich", KI_AGENTEN.cta.heading]);
  });

  it("books the 30-minute call from hero and close with src=agenten", () => {
    render(<KiAgentenPage />);
    const hero = screen.getByRole("heading", { level: 1 }).closest("section")!;
    expect(hero.querySelector("a[href='/kontakt?src=agenten']")).not.toBeNull();
    const close = screen.getByRole("heading", { level: 2, name: KI_AGENTEN.cta.heading }).closest("section")!;
    expect(close.querySelector("a[href='/kontakt?src=agenten']")).not.toBeNull();
  });

  it("shows every agent with its tasks, its result and, where built, the client", () => {
    const { container } = render(<KiAgentenPage />);
    const cards = [...container.querySelectorAll("[data-agent]")];
    expect(cards.map((c) => c.getAttribute("data-agent"))).toEqual(KI_AGENTEN.agenten.map((a) => a.id));
    KI_AGENTEN.agenten.forEach((a, i) => {
      const card = cards[i];
      expect(card.querySelector("h3")).toHaveTextContent(a.name);
      expect([...card.querySelectorAll("li")].map((li) => li.textContent)).toEqual(a.aufgaben);
      expect(card).toHaveTextContent(a.ergebnis);
      if (a.gebautFuer) expect(card).toHaveTextContent(`${KI_AGENTEN.gebautPrefix} ${a.gebautFuer}`);
      else expect(card).not.toHaveTextContent(KI_AGENTEN.gebautPrefix);
    });
  });

  it("sets the Inhaber-Assistent apart as the top floor, across the full width", () => {
    const { container } = render(<KiAgentenPage />);
    const top = container.querySelector("[data-agent='inhaber']")!;
    expect(top).toHaveAttribute("data-oberste");
    expect(top).toHaveClass("md:col-span-2", "lg:col-span-6");
  });
});
