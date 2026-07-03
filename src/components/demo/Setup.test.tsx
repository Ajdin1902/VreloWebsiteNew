import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Setup } from "./Setup";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Setup", () => {
  it("shows the PII nudge and submits a typed seed", () => {
    const onReady = vi.fn();
    render(<Setup onReady={onReady} />);
    expect(screen.getByText(/keine echten Kundendaten/i)).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Was bietest du an/i), { target: { value: "Baufi für Familien" } });
    fireEvent.click(screen.getByRole("button", { name: /Los geht/i }));
    expect(onReady).toHaveBeenCalledWith(expect.objectContaining({ business: "Baufi für Familien" }));
  });

  it("prefills fields from the extract endpoint when a URL is applied", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ business: "Aus der Website", appointmentType: "versicherung", tone: "foermlich" }), { status: 200 }),
    );
    render(<Setup onReady={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Website/i), { target: { value: "https://kunde.de" } });
    fireEvent.click(screen.getByRole("button", { name: /übernehmen/i }));
    await waitFor(() => expect((screen.getByLabelText(/Was bietest du an/i) as HTMLTextAreaElement).value).toContain("Aus der Website"));
  });
});
