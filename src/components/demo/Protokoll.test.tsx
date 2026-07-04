import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Protokoll } from "./Protokoll";
import type { DemoSeed } from "@/lib/demo/seed";
import type { ChatMessage } from "@/lib/demo/prompt";

const seed = { business: "Baufi", appointmentType: "baufinanzierung", tone: "locker" } as DemoSeed;
const transcript: ChatMessage[] = [
  { role: "user", content: "Hallo" },
  { role: "assistant", content: "Guten Tag, Ihr Name?" },
];

function jsonResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

beforeEach(() => vi.restoreAllMocks());

describe("Protokoll", () => {
  it("renders the Terminnotiz and the transcript on a successful summary fetch", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "Baufinanzierung", termin: "Mo 6.7. 10:00", offenePunkte: ["Unterlagen mitbringen"], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Alen")).toBeTruthy();
    expect(screen.getByText("Mo 6.7. 10:00")).toBeTruthy();
    expect(screen.getByText("Unterlagen mitbringen")).toBeTruthy();
    expect(screen.getByText("Hallo")).toBeTruthy();

    const cta = screen.getByRole("link", { name: /reden|kontakt/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });

  it("renders the email row and a simulated confirmation-mail preview when an email is present", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "Baufinanzierung", termin: "Mo 6.7. 10:00", offenePunkte: [], email: "alen@example.de" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect((await screen.findAllByText("alen@example.de")).length).toBeGreaterThan(0);
    expect(screen.getByText(/Bestätigungsmail/i)).toBeTruthy();
    expect(screen.getByText(/automatisch versendet/i)).toBeTruthy();
  });

  it("hides the mail preview when no email was captured", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "Baufinanzierung", termin: "Mo 6.7. 10:00", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Alen")).toBeTruthy();
    expect(screen.queryByText(/Bestätigungsmail/i)).toBeNull();
  });

  it("degrades gracefully to transcript-only when the summary fetch rejects", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("boom"));
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Hallo")).toBeTruthy();
    expect(screen.queryByText("Alen")).toBeNull();
    const cta = screen.getByRole("link", { name: /reden|kontakt/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });

  it("degrades gracefully to transcript-only on a non-200 summary response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 503, json: async () => ({}) } as Response);
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Hallo")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Terminnotiz" })).toBeNull();
    const cta = screen.getByRole("link", { name: /reden|kontakt/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });

  it("skips the Terminnotiz card when the returned summary is empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Hallo")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Terminnotiz" })).toBeNull();
  });
});
