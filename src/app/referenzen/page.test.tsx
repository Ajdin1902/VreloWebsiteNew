import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReferenzenPage, { metadata } from "./page";
import { referenzen, referenzAnchorId } from "@/lib/referenzen";
import { CHECK_CTA } from "@/lib/prozessCheckCta";

const [mdz] = referenzen;

describe("/referenzen", () => {
  it("opens on the agreed hero and goes straight to the cards", () => {
    render(<ReferenzenPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Das sagen die Kunden." })).toBeInTheDocument();
    expect(screen.queryByText(/Zwei Betriebe aus Regensburg/)).toBeNull();
  });

  it("renders one card per client: logo heading, intro, problem and result bullets, tools, anchor", () => {
    const { container } = render(<ReferenzenPage />);
    for (const r of referenzen) {
      // The logo carries the name, so the heading's accessible name is the logo's alt.
      expect(screen.getByRole("heading", { level: 2, name: r.name })).toBeInTheDocument();
      // The compact cards on / and /leistungen link to exactly this id.
      expect(container.querySelector(`#${referenzAnchorId(r.slug)}`)).not.toBeNull();
      expect(screen.getByText(r.intro)).toBeInTheDocument();
      for (const t of [...r.problem, ...r.ergebnis]) expect(screen.getByText(t)).toBeInTheDocument();
      for (const w of r.werkzeuge) expect(screen.getAllByText(w).length).toBeGreaterThan(0);
    }
    for (const beat of ["Das Problem", "Das Ergebnis"]) {
      expect(screen.getAllByText(beat)).toHaveLength(referenzen.length);
    }
  });

  it("draws the Velp chain as one labelled graphic", () => {
    render(<ReferenzenPage />);
    expect(screen.getByRole("img", { name: /HubSpot.*ClickUp/ })).toBeInTheDocument();
  });

  it("shows the father line on the MDZ card and ends it on Mirsad's quote", () => {
    const { container } = render(<ReferenzenPage />);
    expect(screen.getByText(mdz.familie!.lang)).toBeInTheDocument();
    const card = container.querySelector(`#${referenzAnchorId(mdz.slug)}`)!;
    const quote = card.querySelector("blockquote");
    expect(quote).toHaveTextContent(mdz.stimme!.text);
    expect(card.lastElementChild?.contains(quote)).toBe(true);
  });

  it("ends on the Prozess-Check with the direct path under it", () => {
    render(<ReferenzenPage />);
    expect(screen.getByRole("link", { name: CHECK_CTA.label })).toHaveAttribute("href", "/prozess-check?src=referenzen");
    expect(screen.getByRole("link", { name: CHECK_CTA.directLabel })).toHaveAttribute("href", "/kontakt");
  });

  it("keeps its description in the search-snippet budget and the layout's share card", () => {
    expect(String(metadata.description).length).toBeLessThanOrEqual(170);
    expect(metadata.openGraph).toBeUndefined();
  });

  it("never names MDZ in the search and share snippet without the family tie", () => {
    // The description is also og:description (layout sets none), so it travels
    // off-page in every shared link (UWG §5, spec anti-goal).
    const desc = String(metadata.description);
    if (/MDZ/.test(desc)) expect(desc).toMatch(/Vater/);
  });
});
