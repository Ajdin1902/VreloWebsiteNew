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
    render(<ChromeGate><p>Kopfzeile</p></ChromeGate>);
    expect(screen.getByText("Kopfzeile")).toBeInTheDocument();
  });

  it("renders its children on /lead-check", () => {
    pathname.current = "/lead-check";
    render(<ChromeGate><p>Kopfzeile</p></ChromeGate>);
    expect(screen.getByText("Kopfzeile")).toBeInTheDocument();
  });

  it("renders nothing on a focus route", () => {
    pathname.current = "/makler";
    const { container } = render(<ChromeGate><p>Kopfzeile</p></ChromeGate>);
    expect(screen.queryByText("Kopfzeile")).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
