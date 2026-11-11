import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PainBlock } from "./PainBlock";
import { LeistungHero } from "./LeistungHero";
import { ProofBlock } from "./ProofBlock";
import { ExampleBlock } from "./ExampleBlock";
import { NoteBlock } from "./NoteBlock";
import { RelatedLinks } from "./RelatedLinks";
import { VergleichBlock } from "./VergleichBlock";
import { GrafikBlock } from "./GrafikBlock";
import { AngeboteBlock } from "./AngeboteBlock";
import { SzenenBlock } from "./SzenenBlock";
import { AbschnitteBlock } from "./AbschnitteBlock";
import { EigentumBlock } from "./EigentumBlock";
import { WartungBlock } from "./WartungBlock";
import { getLeistungPage, automatisierungVergleich, EIGENTUM } from "@/lib/leistungenPages";
import { wartungTiers, wartungZeilen } from "@/lib/wartung";

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
  it("shows group, title, the one line and the Prozess-Check on a check page", () => {
    const p = page("prozessautomatisierung");
    render(<LeistungHero page={p} />);
    expect(screen.getByText(/Leistungen · Bauen/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: p.title })).toBeInTheDocument();
    expect(screen.getByText(p.subline)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kostenlose Vorlagen ansehen/ })).toHaveAttribute(
      "href",
      "/vorlagen?src=leistung-prozessautomatisierung",
    );
    expect(screen.queryByRole("link", { name: "Erstgespräch buchen" })).toBeNull();
  });

  it("leads with the Erstgespräch on a kontakt page", () => {
    const base = page("ki-automatisierung");
    const p = { ...base, cta: { ...base.cta, kind: "kontakt" as const } };
    render(<LeistungHero page={p} />);
    expect(screen.getByRole("link", { name: /Erstgespräch buchen/ })).toHaveAttribute("href", "/kontakt?src=leistung-ki-automatisierung");
    expect(screen.getByRole("link", { name: "Erst eine kostenlose Vorlage ansehen" })).toHaveAttribute(
      "href",
      "/vorlagen?src=leistung-ki-automatisierung",
    );
  });
});

describe("ProofBlock", () => {
  it("shows each study figure with a linked source and year, opening in a new tab", () => {
    const proof = page("ki-automatisierung").proof;
    if (proof.kind !== "studies") throw new Error("expected studies");
    render(<ProofBlock proof={proof} />);
    for (const f of proof.figures) {
      expect(screen.getByText(f.figure)).toBeInTheDocument();
      // Two figures may share a source and year (Destatis 2025), so find each
      // link by its URL and check it names the source.
      const link = screen.getAllByRole("link").find((l) => l.getAttribute("href") === f.url)!;
      expect(link).toBeDefined();
      expect(link).toHaveTextContent(`${f.source}, ${f.year}`);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByText(proof.objection)).toBeInTheDocument();
  });

  it("renders a case body", () => {
    const proof = page("betreuung").proof;
    if (proof.kind !== "case") throw new Error("expected case");
    render(<ProofBlock proof={proof} />);
    expect(screen.getByText(proof.body)).toBeInTheDocument();
    expect(screen.getByText(proof.objection)).toBeInTheDocument();
  });

  it("renders practice points as titled cards", () => {
    const proof = page("prozess-audit").proof;
    if (proof.kind !== "practice") throw new Error("expected practice");
    render(<ProofBlock proof={proof} />);
    for (const pt of proof.points) expect(screen.getByRole("heading", { level: 3, name: pt.title })).toBeInTheDocument();
  });
});

describe("ExampleBlock", () => {
  it("shows before, three numbered steps and after", () => {
    const ex = page("betreuung").example!;
    if (!("steps" in ex)) throw new Error("expected a step run");
    render(<ExampleBlock example={ex} />);
    expect(screen.getByText(ex.before)).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(list.tagName).toBe("OL");
    expect(screen.getByText(ex.after)).toBeInTheDocument();
  });

  it("labels the before and after cards once each", () => {
    const ex = page("prozess-audit").example!;
    if (!("steps" in ex)) throw new Error("expected a step run");
    render(<ExampleBlock example={ex} />);
    expect(screen.getAllByText("Vorher")).toHaveLength(1);
    expect(screen.getAllByText("Nachher")).toHaveLength(1);
    expect(screen.getByText(ex.after).closest("[data-nachher]")).not.toBeNull();
  });

  it("renders a video-only example large, with no steps and no extra text", () => {
    const ex = { heading: "So sieht das aus", video: { src: "/video/x.mp4", poster: "/video/x.webp" } };
    const { container } = render(<ExampleBlock example={ex} />);
    expect(screen.getByRole("heading", { level: 2, name: "So sieht das aus" })).toBeInTheDocument();
    expect(container.querySelector("video, img[src='/video/x.webp']")).not.toBeNull();
    expect(container.querySelector("ol")).toBeNull();
    expect(container.querySelector("figcaption")).toBeNull();
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(container.querySelector("figure")).toHaveClass("max-w-2xl");
  });
});

describe("NoteBlock", () => {
  it("renders the note with an external link", () => {
    const note = page("prozess-audit").note!;
    render(<NoteBlock note={note} />);
    expect(screen.getByRole("complementary", { name: note.heading })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: new RegExp(note.link.label) })).toHaveAttribute("href", note.link.href);
  });
});

describe("RelatedLinks", () => {
  it("links each article and renders nothing when empty", () => {
    const { container, rerender } = render(<RelatedLinks articles={[{ slug: "a", title: "Artikel A" }]} />);
    expect(screen.getByRole("link", { name: "Artikel A" })).toHaveAttribute("href", "/ratgeber/a");
    rerender(<RelatedLinks articles={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("VergleichBlock", () => {
  it("shows every row and links only the other page's column", () => {
    render(<VergleichBlock vergleich={automatisierungVergleich} current="prozessautomatisierung" />);
    expect(screen.getByRole("heading", { level: 2, name: automatisierungVergleich.heading })).toBeInTheDocument();
    for (const r of automatisierungVergleich.rows) expect(screen.getByRole("rowheader", { name: r.label })).toBeInTheDocument();
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(new Set(links)).toEqual(new Set(["/leistungen/ki-automatisierung"]));
    expect(screen.getByText(automatisierungVergleich.faustregel)).toBeInTheDocument();
  });
});

describe("GrafikBlock", () => {
  it.each(["prozess-audit", "prozessautomatisierung", "ki-automatisierung", "betreuung"])("%s: shows the heading and exposes the drawing as one labelled image", (slug) => {
    const g = page(slug).grafik!;
    render(<GrafikBlock grafik={g} />);
    expect(screen.getByRole("heading", { level: 2, name: g.heading })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: g.alt })).toBeInTheDocument();
  });
});

// 2026-11-11: the four-page structure.
describe("AngeboteBlock", () => {
  it("shows every card and links the ones with a target", () => {
    const a = page("ki-automatisierung").angebote!;
    render(<AngeboteBlock angebote={a} />);
    expect(screen.getByRole("heading", { level: 2, name: a.heading })).toBeInTheDocument();
    for (const k of a.karten) expect(screen.getByRole("link", { name: new RegExp(k.title) })).toHaveAttribute("href", k.href);
  });

  it("renders cards without a target as plain items", () => {
    const a = page("prozessautomatisierung").angebote!;
    render(<AngeboteBlock angebote={a} />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(screen.getAllByRole("listitem")).toHaveLength(a.karten.length);
  });
});

describe("SzenenBlock", () => {
  it("shows client, before, after and the result only where one is set", () => {
    const s = page("prozessautomatisierung").szenen!;
    render(<SzenenBlock szenen={s} />);
    for (const i of s.items) {
      expect(screen.getByText(i.kunde)).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 3, name: i.titel })).toBeInTheDocument();
      expect(screen.getByText(i.vorher)).toBeInTheDocument();
      expect(screen.getByText(i.nachher)).toBeInTheDocument();
    }
    expect(screen.getAllByText(/gespart$/)).toHaveLength(1);
  });

  it("puts the anchor id and the scroll margin on the same element", () => {
    const { container } = render(<SzenenBlock szenen={page("ki-automatisierung").szenen!} />);
    const el = container.querySelector("#ki-assistenten")!;
    expect(el).toHaveClass("scroll-mt-24");
  });
});

describe("AbschnitteBlock", () => {
  it("renders each former KI page as an anchored section under the sticky header", () => {
    const ab = page("ki-automatisierung").abschnitte!;
    const { container } = render(<AbschnitteBlock abschnitte={ab} />);
    for (const a of ab) {
      const el = container.querySelector(`#${a.id}`)!;
      expect(el, a.id).not.toBeNull();
      expect(el).toHaveClass("scroll-mt-24");
      expect(screen.getByRole("heading", { level: 2, name: a.title })).toBeInTheDocument();
      for (const s of a.absaetze) expect(screen.getByText(s)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("link", { name: "Zum Claude-Gehirn" })).toHaveLength(2);
  });
});

describe("EigentumBlock", () => {
  it("says the build is yours and links to Wartung", () => {
    render(<EigentumBlock />);
    expect(screen.getByText(EIGENTUM.text)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: EIGENTUM.link.label })).toHaveAttribute("href", "/leistungen/betreuung");
  });
});

describe("WartungBlock", () => {
  it("shows three tiers with every row and no price", () => {
    const { container } = render(<WartungBlock />);
    for (const t of wartungTiers) {
      expect(screen.getByRole("heading", { level: 3, name: t.name })).toBeInTheDocument();
      expect(screen.getByText(t.motto)).toBeInTheDocument();
    }
    expect(screen.getAllByText(wartungZeilen[0].label)).toHaveLength(3);
    expect(screen.getByText("Für höchstens zwei Betriebe")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/€|Euro|249|945|9\.900/);
  });
});
