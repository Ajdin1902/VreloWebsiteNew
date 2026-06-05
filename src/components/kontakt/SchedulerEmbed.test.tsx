// src/components/kontakt/SchedulerEmbed.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SchedulerEmbed } from "./SchedulerEmbed";

// Stub the Cal embed so the test asserts our gating, not Cal internals
vi.mock("@calcom/embed-react", () => ({
  default: () => <div data-testid="cal-embed" />,
}));

describe("SchedulerEmbed", () => {
  it("shows the consent placeholder and does NOT mount Cal before click", () => {
    render(<SchedulerEmbed calLink="vrelo/kennenlernen" />);
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    expect(screen.queryByTestId("cal-embed")).toBeNull();
  });

  it("mounts the Cal embed only after the user clicks", async () => {
    render(<SchedulerEmbed calLink="vrelo/kennenlernen" />);
    await userEvent.click(screen.getByRole("button", { name: /Termin anzeigen/i }));
    expect(screen.getByTestId("cal-embed")).toBeInTheDocument();
  });

  it("shows a calm placeholder (no button) when calLink is missing", () => {
    render(<SchedulerEmbed calLink={undefined} />);
    expect(screen.getByText(/folgt in Kürze/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Termin anzeigen/i })).toBeNull();
  });
});
