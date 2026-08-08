import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChromeGate } from "./ChromeGate";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("ChromeGate", () => {
  beforeEach(() => {
    pathname.current = "/";
  });

  it("renders its children on a normal route", () => {
    render(
      <ChromeGate slot="header">
        <p>Kopfzeile</p>
      </ChromeGate>,
    );
    expect(screen.getByText("Kopfzeile")).toBeInTheDocument();
  });

  it("swaps the site chrome for focus chrome on /makler", () => {
    pathname.current = "/makler";
    render(
      <ChromeGate slot="header">
        <p>Kopfzeile</p>
      </ChromeGate>,
    );
    expect(screen.queryByText("Kopfzeile")).not.toBeInTheDocument();
    // The focus header keeps the brand link and the page's one CTA.
    expect(screen.getByLabelText(/Startseite/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Erstgespräch/ }).length).toBeGreaterThan(0);
  });

  it("gives /lead-check focus chrome with no competing header CTA", () => {
    // The lead magnet is the page's own call to action; a header button would
    // just compete with the quiz, and the 19 nav exits it replaces were the
    // reason /lead-check became a focus route (Rams audit, 2026-08-08).
    pathname.current = "/lead-check";
    render(
      <ChromeGate slot="header">
        <p>Kopfzeile</p>
      </ChromeGate>,
    );
    expect(screen.queryByText("Kopfzeile")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Startseite/)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Erstgespräch/ })).not.toBeInTheDocument();
  });

  it("renders the focus footer with a legal navigation landmark", () => {
    pathname.current = "/lead-check";
    render(
      <ChromeGate slot="footer">
        <p>Fußzeile</p>
      </ChromeGate>,
    );
    expect(screen.queryByText("Fußzeile")).not.toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Rechtliches" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Impressum" })).toBeInTheDocument();
  });
});
