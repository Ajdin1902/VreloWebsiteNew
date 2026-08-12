import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Werkzeuge } from "./Werkzeuge";

const TOOLS = [
  "Outlook",
  "Gmail",
  "Google Kalender",
  "onOffice",
  "HubSpot",
  "Pipedrive",
  "ClickUp",
  "Notion",
  "Google Sheets",
  "sevDesk",
  "lexoffice",
  "DATEV",
];

const LABELS = [
  "E-Mail & Kalender",
  "CRM & Kontakte",
  "Aufgaben & Ablage",
  "Rechnung & Buchhaltung",
];

describe("Werkzeuge", () => {
  it("renders on a petrol band (preserves the cool→warm arc)", () => {
    const { container } = render(<Werkzeuge />);
    expect(container.querySelector("section")).toHaveClass("bg-vrelo-petrol");
  });

  it("renders the reassurance heading", () => {
    render(<Werkzeuge />);
    expect(
      screen.getByRole("heading", { level: 2, name: /Läuft mit den Werkzeugen/i }),
    ).toBeInTheDocument();
  });

  it("renders every cluster label", () => {
    render(<Werkzeuge />);
    for (const label of LABELS) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders every tool name", () => {
    render(<Werkzeuge />);
    for (const tool of TOOLS) {
      expect(screen.getByText(tool)).toBeInTheDocument();
    }
  });

  it("renders the honest catch-all line", () => {
    render(<Werkzeuge />);
    expect(screen.getByText(/Und viele weitere/i)).toBeInTheDocument();
  });

  it("associates each tool list with an existing cluster label (aria-labelledby resolves)", () => {
    const { container } = render(<Werkzeuge />);
    const lists = container.querySelectorAll("ul[aria-labelledby]");
    expect(lists).toHaveLength(4);
    for (const list of lists) {
      const id = list.getAttribute("aria-labelledby");
      expect(id).toBeTruthy();
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});
