import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("renders the paper-variant brand lockup symbol", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('svg path[fill="#f4efe6"]')).not.toBeNull();
  });

  it("links the Prozess-Check outside navLinks (it is a focus route)", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Vorlagen" })).toHaveAttribute("href", "/vorlagen?src=footer");
  });

  it("links the local Regensburg page so it is never orphaned", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "Automatisierung in Regensburg" })).toHaveAttribute(
      "href",
      "/automatisierung-regensburg",
    );
  });

  it("still links the newsletter after it left the top nav", () => {
    render(<Footer />);
    const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(hrefs).toContain("/newsletter");
  });

  it("links the founder's own LinkedIn profile, opening in a new tab", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Ajdin Dzafic auf LinkedIn" });
    expect(link).toHaveAttribute("href", "https://www.linkedin.com/in/ajdin-dzafic-776964233/");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("links the Vrelo LinkedIn page, opening in a new tab", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: "Vrelo auf LinkedIn" });
    expect(link).toHaveAttribute("href", "https://www.linkedin.com/company/vrelo-ki/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(link.getAttribute("rel")).toContain("noreferrer");
    // Label-in-name (WCAG 2.5.3): the visible word is part of the accessible name.
    expect(link).toHaveTextContent("LinkedIn");
  });
});
