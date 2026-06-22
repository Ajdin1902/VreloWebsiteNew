import { describe, it, expect } from "vitest";
import { darkLinkClass, lightLinkClass } from "./onDarkLink";

describe("link helpers", () => {
  it("darkLinkClass uses gletscher (on-dark)", () => {
    expect(darkLinkClass).toContain("text-gletscher");
  });

  it("lightLinkClass uses petrol (on-light honey cards)", () => {
    expect(lightLinkClass).toContain("text-vrelo-petrol");
  });
});
