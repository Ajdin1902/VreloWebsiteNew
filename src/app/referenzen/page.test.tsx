import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ReferenzenPage, { metadata } from "./page";
import { referenzen, stimmen, referenzAnchorId } from "@/lib/referenzen";
import { CHECK_CTA } from "@/lib/prozessCheckCta";

const [mdz] = referenzen;

describe("/referenzen", () => {
  it("opens on the agreed hero", () => {
    render(<ReferenzenPage />);
    expect(screen.getByRole("heading", { level: 1, name: "So läuft es heute bei meinen Kunden." })).toBeInTheDocument();
  });

  it("renders one named card per client with its anchor", () => {
    const { container } = render(<ReferenzenPage />);
    for (const r of referenzen) {
      expect(screen.getByRole("heading", { level: 2, name: r.name })).toBeInTheDocument();
      // The compact cards on / and /leistungen link to exactly this id.
      expect(container.querySelector(`#${referenzAnchorId(r.slug)}`)).not.toBeNull();
      for (const b of r.bausteine) expect(screen.getByText(`${b.titel}:`)).toBeInTheDocument();
      expect(screen.getByText(r.resultat)).toBeInTheDocument();
    }
  });

  it("shows the father line and the public facts on the MDZ card", () => {
    render(<ReferenzenPage />);
    expect(screen.getByText(mdz.familie!.lang)).toBeInTheDocument();
    expect(screen.getByText(mdz.fakten!)).toBeInTheDocument();
  });

  it("gathers the quotes at the end under their own heading", () => {
    render(<ReferenzenPage />);
    expect(screen.getByRole("heading", { level: 2, name: "Das sagen meine Kunden." })).toBeInTheDocument();
    for (const s of stimmen) expect(screen.getByText(s.text)).toBeInTheDocument();
    expect(screen.getAllByText("Mirsad Dzafic, MDZ Hausmeisterservice")).toHaveLength(stimmen.length);
  });

  it("ends on the Prozess-Check with the direct path under it", () => {
    render(<ReferenzenPage />);
    expect(screen.getByRole("link", { name: CHECK_CTA.label })).toHaveAttribute("href", "/prozess-check?src=referenzen");
    expect(screen.getByText(CHECK_CTA.microcopy)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: CHECK_CTA.directLabel })).toHaveAttribute("href", "/kontakt");
  });

  it("keeps its description in the search-snippet budget and the layout's share card", () => {
    expect(String(metadata.description).length).toBeLessThanOrEqual(170);
    expect(metadata.openGraph).toBeUndefined();
  });
});
