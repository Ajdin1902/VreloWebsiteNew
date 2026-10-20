import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import NotFound from "./not-found";

describe("not-found page", () => {
  it("says the page is missing and links back home", () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector("h1")?.textContent).toBe("Diese Seite gibt es nicht.");
    const home = container.querySelector('a[href="/"]');
    expect(home?.textContent).toContain("Zur Startseite");
  });
});
