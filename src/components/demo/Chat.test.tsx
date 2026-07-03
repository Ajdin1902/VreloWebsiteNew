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

  it("calls onDone after the turn cap is reached", async () => {
    vi.spyOn(global, "fetch").mockImplementation(() => Promise.resolve(streamResponse("ok")));
    const onDone = vi.fn();
    render(<Chat seed={seed} firstMessage="" onDone={onDone} />);
    for (let i = 0; i < 6; i++) {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: `Nachricht ${i}` } });
      fireEvent.click(screen.getByRole("button", { name: /senden/i }));
      await waitFor(() => expect(screen.getAllByText(/Nachricht/).length).toBeGreaterThan(i));
    }
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });
});
