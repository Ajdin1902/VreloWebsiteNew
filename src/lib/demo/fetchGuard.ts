/** Parse a URL, allowing only http/https and rejecting embedded credentials. */
export function parseHttpUrl(raw: string): URL | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  return u;
}

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const b = Number(p);
    if (b > 255) return null;
    n = n * 256 + b;
  }
  return n >>> 0;
}

function inV4Cidr(ipInt: number, netStr: string, bits: number): boolean {
  const net = ipv4ToInt(netStr);
  if (net === null) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (net & mask);
}

// IPv4 ranges that must never be fetched.
const V4_BLOCKS: readonly [string, number][] = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // CGNAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local (incl. cloud metadata 169.254.169.254)
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
];

function isBlockedV4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  return V4_BLOCKS.some(([net, bits]) => inV4Cidr(n, net, bits));
}

/** True if the given resolved IP (v4 or v6 literal) is in a private/reserved range. */
export function isBlockedIp(ip: string): boolean {
  const raw = ip.toLowerCase().trim();

  // IPv4-mapped IPv6 (::ffff:127.0.0.1) – unwrap and re-check the embedded v4.
  const mapped = raw.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isBlockedV4(mapped[1]);

  if (raw.includes(":")) {
    // IPv6: block loopback, ULA (fc00::/7 → fc/fd prefixes), link-local (fe80::/10).
    if (raw === "::1") return true;
    const head = raw.split(":")[0];
    if (head.startsWith("fc") || head.startsWith("fd")) return true; // fc00::/7
    if (head.startsWith("fe8") || head.startsWith("fe9") || head.startsWith("fea") || head.startsWith("feb")) return true; // fe80::/10
    return false;
  }

  return isBlockedV4(raw);
}
