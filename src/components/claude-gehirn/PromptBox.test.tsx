// src/components/claude-gehirn/PromptBox.test.tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromptBox } from "./PromptBox";

const labels = {
  boxLabel: "Der Text zum Einfügen",
  copyLabel: "Text kopieren",
  copiedLabel: "Kopiert.",
  failedLabel: "Von Hand kopieren.",
  hintLabel: "Der Button kopiert den ganzen Text.",
};
const text = "Zeile eins\nZeile zwei";

function setClipboard(value: unknown) {
  Object.defineProperty(navigator, "clipboard", { value, configurable: true });
}

afterEach(() => setClipboard(undefined));

describe("PromptBox", () => {
  it("shows the full text, wrapping instead of scrolling sideways", () => {
    render(<PromptBox text={text} {...labels} />);
    const box = screen.getByLabelText(labels.boxLabel);
    expect(box.textContent).toBe(text);
    expect(box.className).toContain("whitespace-pre-wrap");
    expect(box.className).toContain("break-words");
  });

  it("copies the exact text and confirms", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard({ writeText });
    render(<PromptBox text={text} {...labels} />);
    fireEvent.click(screen.getByRole("button", { name: labels.copyLabel }));
    expect(await screen.findByText(labels.copiedLabel)).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(text);
  });

  it("falls back to a visible hand-copy hint when the clipboard is missing", async () => {
    setClipboard(undefined);
    render(<PromptBox text={text} {...labels} />);
    fireEvent.click(screen.getByRole("button", { name: labels.copyLabel }));
    expect(await screen.findByText(labels.failedLabel)).toBeInTheDocument();
  });

  it("falls back when the browser refuses permission", async () => {
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error("denied")) });
    render(<PromptBox text={text} {...labels} />);
    fireEvent.click(screen.getByRole("button", { name: labels.copyLabel }));
    expect(await screen.findByText(labels.failedLabel)).toBeInTheDocument();
  });

  it("says before any click that the button copies the whole text", () => {
    render(<PromptBox text={text} {...labels} />);
    expect(screen.getByRole("status")).toHaveTextContent(labels.hintLabel);
  });

  it("stays short so the next section shows in the first screen (Ajdin 2026-10-04)", () => {
    render(<PromptBox text={text} {...labels} />);
    expect(screen.getByLabelText(labels.boxLabel).className).toContain("max-h-48");
  });

  it("announces the result politely", () => {
    render(<PromptBox text={text} {...labels} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
