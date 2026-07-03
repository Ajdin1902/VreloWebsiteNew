import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Chat } from "./Chat";
import type { DemoSeed } from "@/lib/demo/seed";

const seed: DemoSeed = { business: "Baufi", appointmentType: "baufinanzierung", tone: "locker" };

function streamResponse(text: string): Response {
  const body = new ReadableStream({
    start(c) {
      c.enqueue(new TextEncoder().encode(text));
      c.close();
    },
  });
  return new Response(body, { status: 200, headers: { "content-type": "text/plain" } });
}

beforeEach(() => vi.restoreAllMocks());

describe("Chat", () => {
  it("sends a first message and renders the streamed reply", async () => {
    // fresh Response per call — a single reused ReadableStream locks after the first getReader()
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(streamResponse("Hallo, worum geht es?")));
    render(<Chat seed={seed} firstMessage="Hallo" onDone={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/worum geht es/i)).toBeTruthy());
    expect(screen.getByText("Hallo")).toBeTruthy(); // user's own message shown
  });

  it("strips a trailing [ENDE] sentinel from the displayed assistant bubble", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(streamResponse("Bis Donnerstag![ENDE]")));
    render(<Chat seed={seed} firstMessage="Hallo" onDone={vi.fn()} />);
    const bubble = await screen.findByText("Bis Donnerstag!");
    expect(bubble.textContent).toBe("Bis Donnerstag!");
    expect(screen.queryByText(/\[ENDE\]/)).toBeNull();
  });

  it("hands the full transcript up via onDone once [ENDE] is seen", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(streamResponse("Bis Donnerstag![ENDE]")));
    const onDone = vi.fn();
    render(<Chat seed={seed} firstMessage="Hallo" onDone={onDone} />);
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1));
    const history = onDone.mock.calls[0][0];
    expect(Array.isArray(history)).toBe(true);
    expect(history[history.length - 1]).toEqual({ role: "assistant", content: "Bis Donnerstag!" });
  });

  it("renders the assistant bubble with whitespace-pre-line so newlines survive", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(streamResponse("Bis Donnerstag![ENDE]")));
    render(<Chat seed={seed} firstMessage="Hallo" onDone={vi.fn()} />);
    const bubble = await screen.findByText("Bis Donnerstag!");
    expect(bubble.className).toContain("whitespace-pre-line");
  });

  it("calls onDone with the transcript after the turn cap is reached", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(streamResponse("ok")));
    const onDone = vi.fn();
    render(<Chat seed={seed} firstMessage="" onDone={onDone} />);
    for (let i = 0; i < 8; i++) {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: `Nachricht ${i}` } });
      fireEvent.click(screen.getByRole("button", { name: /senden/i }));
      await waitFor(() => expect(screen.getAllByText(/Nachricht/).length).toBeGreaterThan(i));
    }
    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(Array.isArray(onDone.mock.calls[0][0])).toBe(true);
  });
});
