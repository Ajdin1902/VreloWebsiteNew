import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProzessCheckSection } from "./ProzessCheckSection";
import { CHECK_TEASER, SAMPLE_ANSWERS } from "@/lib/prozessCheckCta";
import { resultCopy } from "@/lib/prozessCheck";

describe("ProzessCheckSection", () => {
  it("asks the visitor's own question as the h2", () => {
    render(<ProzessCheckSection />);
    expect(screen.getByRole("heading", { level: 2, name: CHECK_TEASER.heading })).toBeInTheDocument();
  });

  it("walks the three steps in order", () => {
    const { container } = render(<ProzessCheckSection />);
    const steps = container.querySelectorAll("ol > li");
    expect(steps).toHaveLength(3);
    CHECK_TEASER.steps.forEach((s, i) => expect(steps[i]).toHaveTextContent(s.title));
  });

  // Review Focus 3: the card must never read as a real result or a promise.
  it("labels the example card visibly as an example", () => {
    render(<ProzessCheckSection />);
    expect(screen.getByText(CHECK_TEASER.exampleLabel)).toBeVisible();
    expect(screen.getByText(CHECK_TEASER.exampleNote)).toBeInTheDocument();
  });

  it("renders the example from the real result logic", () => {
    render(<ProzessCheckSection />);
    const sample = resultCopy(SAMPLE_ANSWERS);
    expect(screen.getByText(sample.headline)).toBeInTheDocument();
    for (const a of sample.topAreas) expect(screen.getByText(a.label)).toBeInTheDocument();
    expect(screen.getByText(sample.topAreas[0].sentence)).toBeInTheDocument();
  });

  it("sends its button to the check with the home-check slug", () => {
    render(<ProzessCheckSection />);
    expect(screen.getByRole("link", { name: "Prozess-Check starten" })).toHaveAttribute(
      "href",
      "/prozess-check?src=home-check",
    );
    expect(screen.getByText("Kostenlos, ohne Login. Dein Ergebnis siehst du sofort.")).toBeInTheDocument();
  });

  it("sits on the petrol band", () => {
    const { container } = render(<ProzessCheckSection />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });
});
