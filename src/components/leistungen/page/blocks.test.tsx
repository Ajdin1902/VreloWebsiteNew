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
import { wartungTiers, wartungZeilen, wartungPreis, WARTUNG_HINWEIS, WARTUNG_PREIS_ZUSATZ } from "@/lib/wartung";

const page = (s: string) => getLeistungPage(s)!;

describe("PainBlock", () => {
  it("lists every moment under its heading and closes with the hours line", () => {
    const p = page("prozessautomatisierung");
    render(<PainBlock pain={p.pain} />);
    expect(screen.getByRole("heading", { level: 2, name: p.pain.heading })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(p.pain.moments.length);
    expect(screen.getByText(p.pain.close)).toBeInTheDocument();
  });

  it("puts the closing line beside the heading, before the list", () => {
    const p = page("betreuung");
    const { container } = render(<PainBlock pain={p.pain} />);
    const close = screen.getByText(p.pain.close);
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

  it("renders no cards where a page has none", () => {
    const { container } = render(<LoesungBlock loesung={page("prozess-audit").loesung} />);
    expect(container.querySelectorAll("h3")).toHaveLength(3);
  });
});

describe("LoesungBlock with the Wartung table", () => {
  it("compares the three tiers in one table: price in the header, one row per detail", () => {
    const { container } = render(<LoesungBlock loesung={page("betreuung").loesung} />);
    const table = container.querySelector("table")!;
    const cols = [...table.querySelectorAll("thead th[scope=col]")];
    expect(cols).toHaveLength(3);
    wartungTiers.forEach((t, i) => {
      expect(cols[i]).toHaveTextContent(t.name);
      expect(cols[i]).toHaveTextContent(wartungPreis(t));
      expect(cols[i]).toHaveTextContent(WARTUNG_PREIS_ZUSATZ);
    });
    expect(cols[2]).toHaveTextContent(wartungTiers[2].grenze!);
    const rows = [...table.querySelectorAll("tbody tr")];
    expect(rows.map((r) => r.querySelector("th[scope=row]")?.textContent)).toEqual(wartungZeilen.map((z) => z.label));
    rows.forEach((r, i) => {
      const cells = [...r.querySelectorAll("td")];
      expect(cells.map((c) => c.textContent)).toEqual(wartungTiers.map((t) => t.zeilen[wartungZeilen[i].id]));
    });
    expect(screen.getByText(WARTUNG_HINWEIS)).toBeInTheDocument();
    expect(container.querySelector("ol")).toBeNull();
  });

  it("stacks the same tiers as cards for small screens", () => {
    const { container } = render(<LoesungBlock loesung={page("betreuung").loesung} />);
    const cards = container.querySelectorAll("[data-wartung-karte]");
    expect(cards).toHaveLength(3);
    wartungTiers.forEach((t, i) => {
      expect(cards[i]).toHaveTextContent(t.name);
      expect(cards[i]).toHaveTextContent(wartungPreis(t));
      for (const z of wartungZeilen) expect(cards[i]).toHaveTextContent(t.zeilen[z.id]);
    });
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
