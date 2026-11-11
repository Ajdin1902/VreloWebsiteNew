import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import KiAgentenPage, { metadata } from "./page";
import { KI_AGENTEN, KI_AGENTEN_PATH } from "@/lib/kiAgenten";
import { canonical } from "@/lib/site";

const ringOrder = ["inhaber", "marketing", "vertrieb", "kundenservice", "projektdoku", "buchhaltung"];
const agent = (id: string) => KI_AGENTEN.agenten.find((a) => a.id === id)!;

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
    // Ajdin 2026-11-11: the button stands alone, no hint under it.
    expect(hero.querySelectorAll("a")).toHaveLength(1);
    expect(hero).not.toHaveTextContent("Noch unsicher");
    const close = screen.getByRole("heading", { level: 2, name: KI_AGENTEN.cta.heading }).closest("section")!;
    expect(close.querySelector("a[href='/kontakt?src=agenten']")).not.toBeNull();
  });

  // Ajdin 2026-11-11: Dein Betrieb in the middle, the agents on a ring, the Inhaber-Assistent at 12 o'clock.
  it("places the six agents on a ring around Dein Betrieb, clockwise from the top", () => {
    const { container } = render(<KiAgentenPage />);
    const kreis = container.querySelector("[data-kreis]")!;
    const knoten = [...kreis.querySelectorAll("[data-knoten]")];
    expect(knoten.map((k) => k.getAttribute("data-knoten"))).toEqual(ringOrder);
    knoten.forEach((k, i) => {
      const a = agent(ringOrder[i]);
      expect(k.tagName).toBe("BUTTON");
      expect(k).toHaveTextContent(a.name);
      expect(k).toHaveTextContent(a.ergebnis);
      expect(k.querySelector("li")).toBeNull();
    });
    expect(knoten[0]).toHaveAttribute("data-oberste");
    expect(kreis.querySelectorAll("[data-linie]")).toHaveLength(6);
    const mitte = kreis.querySelector("[data-mitte]")!;
    expect(mitte).toHaveTextContent(KI_AGENTEN.mitte.titel);
    expect(mitte).toHaveTextContent(KI_AGENTEN.mitte.text);
  });

  it("shows an agent's tasks in the middle on click and returns to Dein Betrieb on a second click", () => {
    const { container } = render(<KiAgentenPage />);
    const kreis = container.querySelector("[data-kreis]") as HTMLElement;
    const mitte = kreis.querySelector("[data-mitte]") as HTMLElement;
    const vertrieb = kreis.querySelector("[data-knoten='vertrieb']") as HTMLElement;
    expect(vertrieb).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(vertrieb);
    expect(vertrieb).toHaveAttribute("aria-pressed", "true");
    expect(within(mitte).getByRole("heading", { level: 3, name: agent("vertrieb").name })).toBeInTheDocument();
    expect(within(mitte).getAllByRole("listitem").map((li) => li.textContent)).toEqual(agent("vertrieb").aufgaben);
    expect(mitte).not.toHaveTextContent(KI_AGENTEN.mitte.text);

    fireEvent.click(within(mitte).getByRole("button", { name: KI_AGENTEN.schliessen }));
    expect(mitte).toHaveTextContent(KI_AGENTEN.mitte.text);
    fireEvent.click(vertrieb);
    fireEvent.click(vertrieb);
    expect(vertrieb).toHaveAttribute("aria-pressed", "false");
    expect(mitte).toHaveTextContent(KI_AGENTEN.mitte.titel);
  });

  it("stacks every agent with tasks and result under Dein Betrieb for small screens", () => {
    const { container } = render(<KiAgentenPage />);
    const liste = container.querySelector("[data-liste]")!;
    expect(liste).toHaveTextContent(KI_AGENTEN.mitte.titel);
    const cards = [...liste.querySelectorAll("[data-agent]")];
    expect(cards.map((c) => c.getAttribute("data-agent"))).toEqual(KI_AGENTEN.agenten.map((a) => a.id));
    KI_AGENTEN.agenten.forEach((a, i) => {
      expect(cards[i].querySelector("h3")).toHaveTextContent(a.name);
      expect([...cards[i].querySelectorAll("li")].map((li) => li.textContent)).toEqual(a.aufgaben);
      expect(cards[i]).toHaveTextContent(a.ergebnis);
    });
  });

  it("names no client on the page's agents", () => {
    const { container } = render(<KiAgentenPage />);
    const block = screen.getByRole("heading", { level: 2, name: KI_AGENTEN.heading }).closest("section")!;
    expect(block).not.toHaveTextContent(/Gebaut für|MDZ|Velp/);
    expect(container).toBeTruthy();
  });
});
