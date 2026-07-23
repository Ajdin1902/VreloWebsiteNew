export type NavLink = { href: string; label: string };

export const navLinks: NavLink[] = [
  { href: "/leistungen", label: "Leistungen" },
  { href: "/ueber-mich", label: "Über mich" },
  { href: "/faq", label: "FAQ" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/kontakt", label: "Kontakt" },
];

// Focus routes render without the site header/footer: single-purpose outreach
// pages where every nav link is an exit before the CTA. They bring their own
// minimal chrome. /lead-check and /demo are NOT focus routes — they are
// noindex, but they still sit inside the normal site frame.
export const focusRoutes: string[] = ["/makler"];

// A null pathname (no router context) falls back to "show the chrome" — the
// safe, normal case.
export function isFocusRoute(pathname: string | null): boolean {
  return pathname !== null && focusRoutes.includes(pathname);
}
