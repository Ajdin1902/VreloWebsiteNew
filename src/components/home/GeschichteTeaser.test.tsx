import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GeschichteTeaser } from "./GeschichteTeaser";

describe("GeschichteTeaser", () => {
  it("does not use a heading element for the small eyebrow label", () => {
    render(<GeschichteTeaser />);
    expect(screen.queryByRole("heading", { name: "Die Geschichte" })).toBeNull();
    expect(screen.getByText("Die Geschichte")).toBeInTheDocument();
  });

  it("is a brief mention that links to the full story on Über mich", () => {
    render(<GeschichteTeaser />);
    expect(screen.getByText(/heißt Quelle/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Die ganze Geschichte/ })).toHaveAttribute(
      "href",
      "/ueber-mich",
    );
  });
});
