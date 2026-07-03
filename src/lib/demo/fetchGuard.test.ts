import { describe, it, expect } from "vitest";
import { parseHttpUrl, isBlockedIp } from "./fetchGuard";

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
