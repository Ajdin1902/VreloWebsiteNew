import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KarteQrPage, { metadata } from "./page";

describe("KarteQrPage", () => {
  it("is noindex", () => {
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("renders the QR image pointing at the committed SVG", () => {
    render(<KarteQrPage />);
    const img = screen.getByAltText(/QR-Code/);
    expect(img.getAttribute("src")).toBe("/karte-qr.svg");
  });
});
