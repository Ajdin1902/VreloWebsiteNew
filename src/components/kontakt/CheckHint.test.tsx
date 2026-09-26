import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CheckHint } from "./CheckHint";

describe("CheckHint", () => {
  it("offers the undecided the Prozess-Check with the kontakt slug", () => {
    const { container } = render(<CheckHint />);
    expect(container.textContent).toBe(
      "Noch unsicher, ob sich ein Gespräch lohnt? Der Prozess-Check zeigt es dir in drei Minuten.",
    );
    expect(screen.getByRole("link", { name: "Der Prozess-Check" })).toHaveAttribute(
      "href",
      "/prozess-check?src=kontakt",
    );
  });
});
