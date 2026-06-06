import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RippleImage } from "./RippleImage";

afterEach(cleanup);

describe("RippleImage", () => {
  it("always renders the static image as the LCP element", () => {
    render(<RippleImage src="/video/ripples-poster.jpg" alt="" />);
    const img = screen.getByTestId("ripple-img") as HTMLImageElement;
    expect(img.getAttribute("src")).toBe("/video/ripples-poster.jpg");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("degrades gracefully when WebGL is unavailable (jsdom): no throw, image present", () => {
    expect(() =>
      render(<RippleImage src="/video/ripples-poster.jpg" alt="Wasser" />),
    ).not.toThrow();
    expect(screen.getByAltText("Wasser")).toBeInTheDocument();
  });
});
