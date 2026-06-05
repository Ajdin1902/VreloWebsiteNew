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

  it("escapes '<' so a </script> in the data cannot break out of the tag", () => {
    const data = { "@type": "Article", headline: "Achtung </script><img src=x>" };
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    // raw markup must not contain a literal closing-script sequence
    expect(script.innerHTML).not.toContain("</script>");
    expect(script.innerHTML).toContain("\\u003c");
    // and it still parses back to the original value (< -> <)
    expect(JSON.parse(script.innerHTML)).toEqual(data);
  });
});
