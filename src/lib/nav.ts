export type NavLink = { href: string; label: string };

export const navLinks: NavLink[] = [
  { href: "/leistungen", label: "Leistungen" },
  { href: "/ueber-mich", label: "Über mich" },
  { href: "/faq", label: "FAQ" },
  { href: "/ratgeber", label: "Ratgeber" },
  { href: "/newsletter", label: "Newsletter" },
  { href: "/kontakt", label: "Kontakt" },
];

// Focus routes render without the site nav: single-purpose outreach pages where
// every nav link is an exit before the CTA. They get minimal chrome instead
// (logo + at most one CTA + legal links), rendered by ChromeGate from the root
// layout so <header>/<footer> stay siblings of <main> and keep their banner /
// contentinfo roles.
//
// /lead-check joined them after the 2026-08-08 Rams audit: it carried 19
// navigational exits and a second, competing email capture around a six-question
// task — on the page the Tier-A outreach actually links to. /demo is deliberately
// NOT a focus route: it is a sandbox people are meant to wander out of.
export const focusRoutes: string[] = ["/makler", "/lead-check"];

export type FocusCta = { href: string; label: string; short: string };

// Per-route chrome config. A route with no CTA gets the logo alone — right for
// /lead-check, where the page itself is the call to action and a header button
// would just compete with the quiz.
export const focusChrome: Record<string, { cta?: FocusCta }> = {
  "/makler": {
    cta: { href: "#termin", label: "Erstgespräch vereinbaren", short: "Erstgespräch" },
  },
  "/lead-check": {},
};

// A null pathname (no router context) falls back to "show the chrome" — the
// safe, normal case.
export function isFocusRoute(pathname: string | null): boolean {
  return pathname !== null && focusRoutes.includes(pathname);
}
