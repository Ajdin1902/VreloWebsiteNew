import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PainBlock } from "./PainBlock";
import { LeistungHero } from "./LeistungHero";
import { LoesungBlock } from "./LoesungBlock";
import { SzenenBlock } from "./SzenenBlock";
import { WarumBlock } from "./WarumBlock";
import { getLeistungPage } from "@/lib/leistungenPages";
import { GARANTIE } from "@/lib/garantie";
import { faqHref } from "@/lib/faq";
import { wartungTiers, wartungZeilen, wartungPreis, WARTUNG_HINWEIS, WARTUNG_PREIS_ZUSATZ, WARTUNG_PREIS_LABEL } from "@/lib/wartung";

const page = (s: string) => getLeistungPage(s)!;

describe("PainBlock", () => {
  it("lists every moment under its heading and closes with the hours line", () => {
    const pain = page("prozessautomatisierung").pain!;
    render(<PainBlock pain={pain} />);
    expect(screen.getByRole("heading", { level: 2, name: pain.heading })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(pain.moments.length);
    expect(screen.getByText(pain.close)).toBeInTheDocument();
  });

  it("puts the closing line beside the heading, before the list", () => {
    const pain = page("prozessautomatisierung").pain!;
    const { container } = render(<PainBlock pain={pain} />);
    const close = screen.getByText(pain.close);
    const list = container.querySelector("ul")!;
    expect(close.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

describe("LeistungHero", () => {
  it("shows group, title, the one line and the Vorlagen button alone", () => {
    const p = page("prozessautomatisierung");
    render(<LeistungHero page={p} />);
    expect(screen.getByText(/Leistungen · Bauen/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: p.title })).toBeInTheDocument();
    expect(screen.getByText(p.subline)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kostenlose Vorlagen ansehen/ })).toHaveAttribute(
      "href",
      "/vorlagen?src=leistung-prozessautomatisierung",
    );
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("LoesungBlock", () => {
  it("shows the three numbered steps in order", () => {
    const l = page("prozessautomatisierung").loesung;
    const { container } = render(<LoesungBlock loesung={l} />);
    expect(screen.getByRole("heading", { level: 2, name: l.heading })).toBeInTheDocument();
    const steps = container.querySelectorAll("ol > li");
    expect(steps).toHaveLength(3);
    l.schritte!.forEach((s, i) => {
      expect(steps[i]).toHaveTextContent(String(i + 1));
      expect(steps[i]).toHaveTextContent(s.title);
      expect(steps[i]).toHaveTextContent(s.text);
    });
  });

  it("puts each KI card's anchor and scroll margin on the same element", () => {
    const l = page("ki-automatisierung").loesung;
    const { container } = render(<LoesungBlock loesung={l} />);
    expect(screen.getByRole("heading", { level: 3, name: l.kartenHeading })).toBeInTheDocument();
    for (const k of l.karten!) {
      const el = container.querySelector(`#${k.id}`)!;
      expect(el, k.id).toHaveClass("scroll-mt-24");
      expect(el).toHaveTextContent(k.title);
      expect(el).toHaveTextContent(k.kurz);
      // A Reveal's hidden offset would skew where the 308 anchor lands (header overlap).
      expect(el.closest("[data-shown]"), k.id).toBeNull();
    }
  });

  // Ajdin 2026-11-11: the KI-Assistenten card leads to the agent examples page.
  it("links the KI-Assistenten card to the agent examples", () => {
    const { container } = render(<LoesungBlock loesung={page("ki-automatisierung").loesung} />);
    const links = [...container.querySelectorAll("li a")];
    expect(links.map((a) => [a.closest("li")?.id, a.getAttribute("href")])).toEqual([["ki-assistenten", "/leistungen/ki-agenten"]]);
  });

  it("renders no cards where a page has none", () => {
    const { container } = render(<LoesungBlock loesung={page("prozess-audit").loesung} />);
    expect(container.querySelectorAll("h3")).toHaveLength(3);
  });
});

describe("LoesungBlock with the Wartung table", () => {
  // Ajdin 2026-11-12: four tiers, prices back in the last row, Partner on request.
  it("compares the four tiers in one table: one row per detail, prices in the last row", () => {
    const { container } = render(<LoesungBlock loesung={page("betreuung").loesung} />);
    const table = container.querySelector("table")!;
    const cols = [...table.querySelectorAll("thead th[scope=col]")];
    expect(cols).toHaveLength(4);
    wartungTiers.forEach((t, i) => {
      expect(cols[i]).toHaveTextContent(t.name);
      expect(cols[i]).toHaveTextContent(t.motto);
      expect(cols[i]).not.toHaveTextContent(wartungPreis(t));
    });
    const preisRow = table.querySelector("tbody tr:last-child")!;
    expect(preisRow).toHaveAttribute("data-preis");
    expect(preisRow.previousElementSibling).toHaveAttribute("data-ergebnis");
    expect(preisRow.querySelector("th[scope=row]")).toHaveTextContent(WARTUNG_PREIS_LABEL);
    const zellen = [...preisRow.querySelectorAll("td")];
    expect(zellen.map((z) => z.querySelector("[data-betrag]")?.textContent)).toEqual(["95 €", "249 €", "945 €", "Auf Anfrage"]);
    zellen.slice(0, 3).forEach((z) => expect(z).toHaveTextContent(WARTUNG_PREIS_ZUSATZ));
    expect(zellen[3]).not.toHaveTextContent(WARTUNG_PREIS_ZUSATZ);
    expect(zellen[3]).toHaveTextContent(wartungTiers[3].grenze!);
    expect(table).not.toHaveTextContent(/undefined|NaN|9\.900/);
    const rows = [...table.querySelectorAll("tbody tr:not([data-preis])")];
    expect(rows.map((r) => r.querySelector("th[scope=row]")?.textContent)).toEqual(wartungZeilen.map((z) => z.label));
    rows.forEach((r, i) => {
      const cells = [...r.querySelectorAll("td")];
      cells.forEach((c, j) => {
        const items = wartungTiers[j].zeilen[wartungZeilen[i].id];
        // Ergebnis is the highlighted row: headline plus sentence, no bullets.
        if (wartungZeilen[i].id === "ergebnis") {
          expect(r).toHaveAttribute("data-ergebnis");
          expect(c.querySelector("li")).toBeNull();
          expect([...c.querySelectorAll("p")].map((p) => p.textContent)).toEqual(items);
        }
        // Several lines read as bullets; a single line stays plain text.
        else if (items.length > 1) expect([...c.querySelectorAll("li")].map((li) => li.textContent)).toEqual(items);
        else {
          expect(c.querySelector("li")).toBeNull();
          expect(c.textContent).toBe(items[0]);
        }
      });
    });
    expect(screen.getByText(WARTUNG_HINWEIS)).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeNull();
  });

  // Four columns are too tight on a tablet: the table only from lg, cards below.
  it("shows the table from lg up and cards below", () => {
    const { container } = render(<LoesungBlock loesung={page("betreuung").loesung} />);
    const tableWrap = container.querySelector("table")!.parentElement!;
    expect(tableWrap).toHaveClass("hidden", "lg:block");
    expect(container.querySelector("[data-wartung-karte]")!.parentElement).toHaveClass("lg:hidden");
  });

  it("stacks the same tiers as cards for small screens, price after Ergebnis", () => {
    const { container } = render(<LoesungBlock loesung={page("betreuung").loesung} />);
    const cards = container.querySelectorAll("[data-wartung-karte]");
    expect(cards).toHaveLength(4);
    wartungTiers.forEach((t, i) => {
      expect(cards[i]).toHaveTextContent(t.name);
      expect(cards[i]).toHaveTextContent(t.motto);
      for (const z of wartungZeilen) for (const item of t.zeilen[z.id]) expect(cards[i]).toHaveTextContent(item);
      expect(cards[i].querySelector("[data-ergebnis] li")).toBeNull();
      expect(cards[i].querySelector("h3")).not.toHaveTextContent(wartungPreis(t));
      const preis = cards[i].querySelector("[data-preis]")!;
      expect(preis).toHaveTextContent(wartungPreis(t));
      expect(cards[i].querySelector("[data-ergebnis]")!.compareDocumentPosition(preis) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    expect(cards[3]).not.toHaveTextContent("€");
    expect(cards[3].querySelector("[data-preis]")).toHaveTextContent(wartungTiers[3].grenze!);
  });

  // Ajdin 2026-11-12: most clients take Minimum or Basis, so no tier is pushed.
  it("marks no tier as the suggested one", () => {
    const { container } = render(<LoesungBlock loesung={page("betreuung").loesung} />);
    expect(container.querySelector("table .bg-sonnenlicht, table .border-vrelo-petrol, table .bg-vrelo-petrol")).toBeNull();
    const klassen = [...container.querySelectorAll("[data-wartung-karte]")].map((k) => k.className);
    expect(new Set(klassen).size).toBe(1);
  });
});

describe("SzenenBlock", () => {
  it("shows client, before, after and every confirmed result", () => {
    const s = page("prozessautomatisierung").szenen;
    render(<SzenenBlock szenen={s} />);
    for (const i of s.items) {
      expect(screen.getByText(i.kunde)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: i.titel })).toBeInTheDocument();
      expect(screen.getByText(i.vorher)).toBeInTheDocument();
      expect(screen.getByText(i.nachher)).toBeInTheDocument();
    }
    expect(screen.getByText("Rund 4 Stunden Buchhaltung im Monat gespart")).toBeInTheDocument();
    expect(screen.getByText("Rund 5 Stunden pro Kunde gespart")).toBeInTheDocument();
  });
});

describe("WarumBlock", () => {
  it("shows three points and links the guarantee to its FAQ conditions", () => {
    const w = page("prozessautomatisierung").warum;
    render(<WarumBlock warum={w} />);
    expect(screen.getByRole("heading", { level: 2, name: "Warum ich" })).toBeInTheDocument();
    for (const x of w) expect(screen.getByRole("heading", { level: 3, name: x.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: GARANTIE.faqLink })).toHaveAttribute("href", faqHref(GARANTIE.faqFrage));
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
