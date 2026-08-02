import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProblemSection } from "./ProblemSection";
import { MidCta } from "./MidCta";
import { Voraussetzungen } from "./Voraussetzungen";
import { WarumIch } from "./WarumIch";
import { Garantie } from "./Garantie";
import { Einwaende } from "./Einwaende";
import { TerminSection } from "./TerminSection";
import { makler } from "@/lib/makler";

describe("ProblemSection", () => {
  it("names both leaks before either product is introduced", () => {
    render(<ProblemSection />);
    for (const leak of makler.problem.leaks) {
      expect(screen.getByRole("heading", { level: 3, name: leak.title })).toBeInTheDocument();
    }
  });
});

describe("MidCta", () => {
  it("asks for the call once, pointing at the booking anchor", () => {
    render(<MidCta />);
    const cta = screen.getByRole("link", { name: makler.cta.label });
    expect(cta).toHaveAttribute("href", "#termin");
  });

  it("carries the friction-reducing note", () => {
    render(<MidCta />);
    expect(screen.getByText(makler.cta.note)).toBeInTheDocument();
  });
});

describe("Voraussetzungen", () => {
  it("states both requirements", () => {
    render(<Voraussetzungen />);
    for (const item of makler.voraussetzungen.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.body)).toBeInTheDocument();
    }
  });

  it("names the server cost and says the server is his", () => {
    const { container } = render(<Voraussetzungen />);
    expect(container.textContent).toContain("rund 30 €");
    expect(container.textContent).toContain("deinem eigenen Konto");
  });
});

describe("WarumIch", () => {
  it("lists the differentiators as headlines only", () => {
    render(<WarumIch />);
    const list = screen.getByRole("list", { name: "Was das für dich bedeutet" });
    // The arrow marker is aria-hidden; the label lives in its own span.
    for (const p of makler.warumIch.points) {
      expect(screen.getByText(p)).toBeInTheDocument();
    }
    expect(list.querySelectorAll("li")).toHaveLength(makler.warumIch.points.length);
  });
});

describe("Garantie", () => {
  it("states all three promises and the founding note", () => {
    render(<Garantie />);
    for (const p of makler.garantie.promises) {
      expect(screen.getByRole("heading", { level: 3, name: p.title })).toBeInTheDocument();
    }
    expect(screen.getByText(makler.garantie.founding.body)).toBeInTheDocument();
  });
});

describe("Einwaende", () => {
  it("renders exactly four objections as disclosures", () => {
    const { container } = render(<Einwaende />);
    expect(container.querySelectorAll("details")).toHaveLength(4);
    expect(makler.einwaende.items).toHaveLength(4);
  });
});

describe("TerminSection", () => {
  it("carries the anchor the header CTA points at", () => {
    const { container } = render(<TerminSection calLink={undefined} />);
    const anchor = container.querySelector("#termin");
    expect(anchor).not.toBeNull();
    // The scroll offset must live on the anchored element itself — CSS
    // scroll-margin-top is not inherited from an ancestor, so it has to
    // co-locate with id="termin" to clear the sticky header on #termin links.
    expect(anchor?.className).toMatch(/\bscroll-mt-/);
  });

  it("shows the calm hint when no scheduler is configured", () => {
    render(<TerminSection calLink={undefined} />);
    expect(screen.getByText(makler.close.fallbackHint)).toBeInTheDocument();
  });

  it("leads straight to booking – no written escape hatch, no hedge heading", () => {
    render(<TerminSection calLink="ajdin19/vrelo-kennenlernen" />);
    // The old "Zum Kontaktformular" fallback and "Lieber direkt sprechen?"
    // prompt are gone; the section heading is the only ask.
    expect(screen.queryByRole("link", { name: /Kontaktformular/i })).toBeNull();
    expect(screen.queryByText(/Lieber direkt sprechen/i)).toBeNull();
    expect(makler.close).not.toHaveProperty("fallback");
    expect(makler.close).not.toHaveProperty("body");
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
  });
});
