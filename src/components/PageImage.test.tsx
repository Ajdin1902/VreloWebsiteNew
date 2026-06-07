import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PageImage } from "./PageImage";

describe("PageImage", () => {
  it("uses the default banner sizes when none is given", () => {
    const { container } = render(<PageImage src="/images/x.webp" alt="x" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("sizes")).toBe("(min-width: 1152px) 1104px, 100vw");
  });

  it("applies a custom sizes prop", () => {
    const { container } = render(
      <PageImage src="/images/x.webp" alt="x" sizes="(min-width: 640px) 160px, 100vw" />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("sizes")).toBe("(min-width: 640px) 160px, 100vw");
  });
});
