import { describe, it, expect, vi } from "vitest";
import dns from "node:dns/promises";
import { parseHttpUrl, isBlockedIp, assertResolvesPublic, extractReadableText, MAX_FETCH_BYTES } from "./fetchGuard";

describe("parseHttpUrl", () => {
  it("accepts http/https", () => {
    expect(parseHttpUrl("https://example.de/x")?.hostname).toBe("example.de");
    expect(parseHttpUrl("http://example.de")?.hostname).toBe("example.de");
  });
  it("rejects non-http schemes", () => {
    expect(parseHttpUrl("file:///etc/passwd")).toBeNull();
    expect(parseHttpUrl("gopher://x")).toBeNull();
    expect(parseHttpUrl("data:text/html,x")).toBeNull();
    expect(parseHttpUrl("ftp://x")).toBeNull();
  });
  it("rejects embedded credentials (userinfo)", () => {
    expect(parseHttpUrl("http://user@169.254.169.254/")).toBeNull();
  });
  it("returns null on garbage", () => {
    expect(parseHttpUrl("not a url")).toBeNull();
  });
});

describe("isBlockedIp", () => {
  it("blocks IPv4 loopback / private / link-local / cgnat", () => {
    for (const ip of ["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0"]) {
      expect(isBlockedIp(ip), ip).toBe(true);
    }
  });
  it("blocks IPv6 loopback / ULA / link-local", () => {
    for (const ip of ["::1", "fc00::1", "fe80::1", "fd00:ec2::254"]) {
      expect(isBlockedIp(ip), ip).toBe(true);
    }
  });
  it("blocks IPv4-mapped IPv6 that wraps a private v4", () => {
    expect(isBlockedIp("::ffff:127.0.0.1")).toBe(true);
    expect(isBlockedIp("::ffff:169.254.169.254")).toBe(true);
  });
  it("allows ordinary public addresses", () => {
    expect(isBlockedIp("93.184.216.34")).toBe(false); // example.com
    expect(isBlockedIp("2606:2800:220:1:248:1893:25c8:1946")).toBe(false);
  });
  it("blocks IPv4-mapped IPv6 in canonical hex form (the form the URL parser emits)", () => {
    expect(isBlockedIp("::ffff:7f00:1")).toBe(true); // 127.0.0.1
    expect(isBlockedIp("::ffff:a9fe:a9fe")).toBe(true); // 169.254.169.254 (cloud metadata)
  });
  it("blocks NAT64 and 6to4 forms that embed a private/loopback v4", () => {
    expect(isBlockedIp("64:ff9b::7f00:1")).toBe(true); // NAT64 -> 127.0.0.1
    expect(isBlockedIp("2002:7f00:1::")).toBe(true); // 6to4 -> 127.0.0.x
  });
  it("blocks the unspecified address and deprecated IPv4-compatible loopback", () => {
    expect(isBlockedIp("::")).toBe(true);
    expect(isBlockedIp("::1")).toBe(true);
  });
});

describe("assertResolvesPublic", () => {
  it("resolves and returns a vetted public IP", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([{ address: "93.184.216.34", family: 4 }] as never);
    await expect(assertResolvesPublic("example.de")).resolves.toBe("93.184.216.34");
  });
  it("throws when the hostname resolves to a private IP", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([{ address: "169.254.169.254", family: 4 }] as never);
    await expect(assertResolvesPublic("evil.example")).rejects.toThrow();
  });
  it("throws when ANY resolved IP is private (mixed A records)", async () => {
    vi.spyOn(dns, "lookup").mockResolvedValueOnce([
      { address: "93.184.216.34", family: 4 },
      { address: "127.0.0.1", family: 4 },
    ] as never);
    await expect(assertResolvesPublic("evil.example")).rejects.toThrow();
  });
});

describe("extractReadableText", () => {
  it("strips tags, scripts, styles and collapses whitespace", () => {
    const html = "<html><head><style>.x{color:red}</style><script>alert(1)</script></head><body><h1>Baufi</h1>\n\n<p>für  Familien</p></body></html>";
    const text = extractReadableText(html);
    expect(text).toContain("Baufi");
    expect(text).toContain("für Familien");
    expect(text).not.toContain("alert");
    expect(text).not.toContain("color:red");
  });
  it("caps output length", () => {
    const html = "<p>" + "a ".repeat(20000) + "</p>";
    expect(extractReadableText(html).length).toBeLessThanOrEqual(MAX_FETCH_BYTES);
  });
});
