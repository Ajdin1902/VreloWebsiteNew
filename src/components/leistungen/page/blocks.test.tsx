import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { PainBlock } from "./PainBlock";
import { LeistungHero } from "./LeistungHero";
import { ProofBlock } from "./ProofBlock";
import { ExampleBlock } from "./ExampleBlock";
import { NoteBlock } from "./NoteBlock";
import { RelatedLinks } from "./RelatedLinks";
import { getLeistungPage } from "@/lib/leistungenPages";

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
    expect(screen.getByText(/Automatisieren/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: p.title })).toBeInTheDocument();
    expect(screen.getByText(p.subline)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Prozess-Check starten/ })).toHaveAttribute(
      "href",
      "/prozess-check?src=leistung-prozessautomatisierung",
    );
    expect(screen.getByRole("link", { name: "Erstgespräch buchen" })).toHaveAttribute("href", "/kontakt");
  });

  it("leads with the Erstgespräch on a kontakt page", () => {
    const p = page("claude");
    render(<LeistungHero page={p} />);
    expect(screen.getByText(/Befähigen/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Erstgespräch buchen/ })).toHaveAttribute("href", "/kontakt?src=leistung-claude");
    expect(screen.getByRole("link", { name: "Erst den Prozess-Check machen" })).toHaveAttribute(
      "href",
      "/prozess-check?src=leistung-claude",
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
    const proof = page("ki-server").proof;
    if (proof.kind !== "case") throw new Error("expected case");
    render(<ProofBlock proof={proof} />);
    expect(screen.getByText(proof.body)).toBeInTheDocument();
    expect(screen.getByText(proof.objection)).toBeInTheDocument();
  });

  it("renders practice points as titled cards", () => {
    const proof = page("claude").proof;
    if (proof.kind !== "practice") throw new Error("expected practice");
    render(<ProofBlock proof={proof} />);
    for (const pt of proof.points) expect(screen.getByRole("heading", { level: 3, name: pt.title })).toBeInTheDocument();
  });
});

describe("ExampleBlock", () => {
  it("shows before, three numbered steps and after", () => {
    const ex = page("ki-beratung").example;
    if (!("steps" in ex)) throw new Error("expected a step run");
    render(<ExampleBlock example={ex} />);
    expect(screen.getByText(ex.before)).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
    expect(list.tagName).toBe("OL");
    expect(screen.getByText(ex.after)).toBeInTheDocument();
  });

  it("labels the before and after cards once each", () => {
    const ex = page("prozessautomatisierung").example;
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
    const note = page("ki-beratung").note!;
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
