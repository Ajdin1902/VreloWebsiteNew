import { describe, it, expect } from "vitest";
import { darkLinkClass, lightLinkClass } from "./onDarkLink";

describe("link helpers", () => {
  it("darkLinkClass uses gletscher (on-dark)", () => {
    expect(darkLinkClass).toContain("text-gletscher");
  });

  it("lightLinkClass uses navy on the amber cards (petrol fails AA on amber)", () => {
    expect(lightLinkClass).toContain("text-tiefes-wasser");
  });
});
