import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentConciergeBlock } from "./DocumentConciergeBlock";
import { makler, type MaklerProduct } from "@/lib/makler";

describe("DocumentConciergeBlock", () => {
  it("names the product and states where the documents live", () => {
    render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    expect(screen.getByRole("heading", { level: 2, name: /Document Concierge/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: makler.documentConcierge.trust!.title })).toBeInTheDocument();
  });

  it("renders the flow as numbered cards while no video exists", () => {
    render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    const list = screen.getByRole("list", { name: "Ablauf" });
    expect(list.querySelectorAll("li")).toHaveLength(makler.documentConcierge.flow!.length);
    expect(document.querySelector("video")).toBeNull();
  });

  it("is honest that the product is built to order, not clickable software", () => {
    render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    expect(screen.getByText(makler.documentConcierge.note!)).toBeInTheDocument();
  });

  it("shows no explanatory body paragraph – the flow cards carry it", () => {
    const { container } = render(<DocumentConciergeBlock product={makler.documentConcierge} />);
    expect(makler.documentConcierge.body).toBeUndefined();
    // A phrase that existed only in the deleted body — a real regression guard.
    expect(container.textContent).not.toContain("20-Sekunden-Formular");
  });

  it("swaps in the loop video once one is configured", () => {
    const withVideo: MaklerProduct = {
      ...makler.documentConcierge,
      demoVideo: { slug: "document-concierge", caption: "Der Ablauf in 30 Sekunden." },
    };
    render(<DocumentConciergeBlock product={withVideo} />);
    const video = document.querySelector("video");
    expect(video).not.toBeNull();
    expect(video?.getAttribute("poster")).toBe("/video/document-concierge-poster.jpg");
    expect(screen.getByText("Der Ablauf in 30 Sekunden.")).toBeInTheDocument();
  });
});
