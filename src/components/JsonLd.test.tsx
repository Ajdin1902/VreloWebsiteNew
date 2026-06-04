// src/components/JsonLd.test.tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "./JsonLd";

describe("JsonLd", () => {
  it("renders a ld+json script with the serialized data", () => {
    const { container } = render(<JsonLd data={{ "@type": "Thing", name: "X" }} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    expect(JSON.parse(script!.innerHTML)).toEqual({ "@type": "Thing", name: "X" });
  });
});
