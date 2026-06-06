import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GeschichteTeaser } from "./GeschichteTeaser";

describe("GeschichteTeaser", () => {
  it("does not use a heading element for the small eyebrow label", () => {
    render(<GeschichteTeaser />);
    expect(screen.queryByRole("heading", { name: "Die Geschichte" })).toBeNull();
    expect(screen.getByText("Die Geschichte")).toBeInTheDocument();
  });

  it("keeps the Bosnian source quote", () => {
    render(<GeschichteTeaser />);
    expect(screen.getByText(/Quellen heilig/)).toBeInTheDocument();
  });
});
