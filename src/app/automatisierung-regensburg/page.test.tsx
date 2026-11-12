import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RegensburgPage, { metadata } from "./page";
import { REGENSBURG } from "@/lib/regensburg";
import { canonical } from "@/lib/site";

describe("/automatisierung-regensburg", () => {
  it("sets title, description and canonical only (layout keeps the share card)", () => {
    expect(metadata.title).toBe(REGENSBURG.meta.title);
    expect(metadata.description).toBe(REGENSBURG.meta.description);
    expect(metadata.alternates?.canonical).toBe(canonical("/automatisierung-regensburg"));
    expect(metadata.openGraph).toBeUndefined();
  });

  it("renders the hero title as the one H1 and every block heading", () => {
    render(<RegensburgPage />);
    expect(screen.getByRole("heading", { level: 1, name: REGENSBURG.hero.title })).toBeInTheDocument();
    for (const b of REGENSBURG.bloecke)
      expect(screen.getByRole("heading", { level: 2, name: b.heading })).toBeInTheDocument();
  });

  it("links the references", () => {
    render(<RegensburgPage />);
    expect(screen.getByRole("link", { name: "Zu den Referenzen" })).toHaveAttribute("href", "/referenzen");
  });
});
