import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReferenzCard } from "./ReferenzCard";
import { referenzen } from "@/lib/referenzen";

const [mdz, velp] = referenzen;

describe("ReferenzCard", () => {
  it("shows name, place and the family tie in the eyebrow for MDZ", () => {
    render(<ReferenzCard referenz={mdz} />);
    expect(screen.getByText("MDZ Hausmeisterservice · Regensburg · Betrieb meines Vaters")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: mdz.titel })).toBeInTheDocument();
    expect(screen.getByText(mdz.kompakt)).toBeInTheDocument();
    expect(screen.getByText(mdz.kennzahl)).toBeInTheDocument();
    expect(screen.getByText(mdz.kennzahlLabel)).toBeInTheDocument();
  });

  it("shows no family tie for Velp", () => {
    render(<ReferenzCard referenz={velp} />);
    expect(screen.getByText("Velp · Marketingagentur · Regensburg")).toBeInTheDocument();
    expect(screen.queryByText(/Betrieb meines Vaters/)).toBeNull();
  });

  it("links the headline to the client's card on /referenzen", () => {
    render(<ReferenzCard referenz={mdz} />);
    expect(screen.getByRole("link", { name: mdz.titel })).toHaveAttribute("href", "/referenzen#referenz-mdz");
  });

  it("leaves the long story to /referenzen", () => {
    render(<ReferenzCard referenz={mdz} />);
    expect(screen.queryByText(mdz.problem)).toBeNull();
    expect(screen.queryByText(mdz.laeuft)).toBeNull();
  });
});
