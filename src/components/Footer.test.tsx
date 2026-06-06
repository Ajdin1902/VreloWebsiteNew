import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the paper-variant brand lockup symbol", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('svg path[fill="#f4efe6"]')).not.toBeNull();
  });
});
