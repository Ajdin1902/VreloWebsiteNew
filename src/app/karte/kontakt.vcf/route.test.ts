import { describe, it, expect, vi } from "vitest";

// Decouple from the generated photo bytes.
vi.mock("@/lib/karte-photo", () => ({ KARTE_PHOTO_BASE64: "ZmFrZQ==" }));

import { GET } from "./route";

describe("GET /karte/kontakt.vcf", () => {
  it("returns a vCard with the right headers and body", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toBe("text/vcard; charset=utf-8");
    expect(res.headers.get("content-disposition")).toContain("ajdin-dzafic.vcf");
    const body = await res.text();
    expect(body).toContain("BEGIN:VCARD");
    expect(body).toContain("FN:Ajdin Dzafic");
    expect(body).toContain("PHOTO;ENCODING=b;TYPE=JPEG:ZmFrZQ==");
  });
});
