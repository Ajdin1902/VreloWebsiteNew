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

/**
 * Parse an IPv6 literal (optional %zone, optional embedded IPv4 tail, `::`
 * compression) into 16 raw bytes, or null if it is not a valid IPv6 address.
 */
function ipv6ToBytes(input: string): Uint8Array | null {
  let s = input.trim().toLowerCase();
  const pct = s.indexOf("%");
  if (pct !== -1) s = s.slice(0, pct); // strip zone id
  if (s === "") return null;

  // Convert a trailing embedded IPv4 (dotted-quad) into two hex groups.
  const tail = s.match(/^(.*:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (tail) {
    const v4 = ipv4ToInt(tail[2]);
    if (v4 === null) return null;
    const hi = ((v4 >>> 16) & 0xffff).toString(16);
    const lo = (v4 & 0xffff).toString(16);
    s = `${tail[1]}${hi}:${lo}`;
  }

  const halves = s.split("::");
  if (halves.length > 2) return null;

  const parseGroups = (part: string): number[] | null => {
    if (part === "") return [];
    const out: number[] = [];
    for (const g of part.split(":")) {
      if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
      out.push(parseInt(g, 16));
    }
    return out;
  };

  let hextets: number[];
  if (halves.length === 2) {
    const head = parseGroups(halves[0]);
    const rest = parseGroups(halves[1]);
    if (head === null || rest === null) return null;
    const missing = 8 - head.length - rest.length;
    if (missing < 1) return null; // "::" must stand for at least one zero group
    hextets = [...head, ...new Array(missing).fill(0), ...rest];
  } else {
    const all = parseGroups(s);
    if (all === null) return null;
    hextets = all;
  }
  if (hextets.length !== 8) return null;

  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    bytes[2 * i] = (hextets[i] >>> 8) & 0xff;
    bytes[2 * i + 1] = hextets[i] & 0xff;
  }
  return bytes;
}

const dot = (b: Uint8Array, o: number): string => `${b[o]}.${b[o + 1]}.${b[o + 2]}.${b[o + 3]}`;
const allZero = (b: Uint8Array, from: number, to: number): boolean => {
  for (let i = from; i < to; i++) if (b[i] !== 0) return false;
  return true;
};

/** True if the given resolved IP (v4 or v6 literal) is in a private/reserved range. */
export function isBlockedIp(ip: string): boolean {
  const raw = ip.trim().toLowerCase();

  if (!raw.includes(":")) return isBlockedV4(raw);

  const b = ipv6ToBytes(raw);
  if (b === null) return true; // unparseable v6 → fail closed

  // IPv4-mapped (::ffff:0:0/96) → check the embedded v4.
  if (allZero(b, 0, 10) && b[10] === 0xff && b[11] === 0xff) return isBlockedV4(dot(b, 12));
  // IPv4-compatible / loopback / unspecified (first 96 bits zero) → embedded v4 (covers ::, ::1).
  if (allZero(b, 0, 12)) return isBlockedV4(dot(b, 12));
  // NAT64 well-known prefix 64:ff9b::/96 → embedded v4 in the low 32 bits.
  if (b[0] === 0x00 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && allZero(b, 4, 12)) return isBlockedV4(dot(b, 12));
  // 6to4 2002::/16 → embedded v4 in bytes 2..5.
  if (b[0] === 0x20 && b[1] === 0x02) return isBlockedV4(dot(b, 2));
  // ULA fc00::/7
  if ((b[0] & 0xfe) === 0xfc) return true;
  // Link-local fe80::/10
  if (b[0] === 0xfe && (b[1] & 0xc0) === 0x80) return true;

  return false;
}
