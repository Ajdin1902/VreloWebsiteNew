// src/components/kontakt/SchedulerEmbed.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SchedulerEmbed } from "./SchedulerEmbed";

// Stub the Cal embed so the test asserts our gating + props, not Cal internals.
// vi.hoisted lets the factory share state with the test body despite hoisting.
const mock = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));
vi.mock("@calcom/embed-react", () => ({
  default: (props: Record<string, unknown>) => {
    mock.props = props;
    return <div data-testid="cal-embed" />;
  },
}));

describe("SchedulerEmbed", () => {
  it("shows the consent placeholder and does NOT mount Cal before click", () => {
    render(<SchedulerEmbed calLink="ajdin19/vrelo-kennenlernen" />);
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    expect(screen.queryByTestId("cal-embed")).toBeNull();
  });

  it("renders on-dark (papier heading) so it reads on the petrol water", () => {
    render(<SchedulerEmbed calLink="ajdin19/vrelo-kennenlernen" />);
    expect(screen.getByText(/Lieber direkt sprechen/i)).toHaveClass("text-papier");
  });

  it("mounts the Cal embed only after the user clicks", async () => {
    render(<SchedulerEmbed calLink="ajdin19/vrelo-kennenlernen" />);
    await userEvent.click(screen.getByRole("button", { name: /Termin anzeigen/i }));
    expect(screen.getByTestId("cal-embed")).toBeInTheDocument();
  });

  it("points the embed at the EU data region (cal.eu), not the default cal.com", async () => {
    render(<SchedulerEmbed calLink="ajdin19/vrelo-kennenlernen" />);
    await userEvent.click(screen.getByRole("button", { name: /Termin anzeigen/i }));
    expect(mock.props?.calLink).toBe("ajdin19/vrelo-kennenlernen");
    expect(mock.props?.calOrigin).toBe("https://cal.eu");
  });

  it("shows a calm placeholder (no button) when calLink is missing", () => {
    render(<SchedulerEmbed calLink={undefined} />);
    expect(screen.getByText(/folgt in Kürze/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Termin anzeigen/i })).toBeNull();
  });

  it("keeps the Kontakt wording when no hint is passed", () => {
    render(<SchedulerEmbed calLink={undefined} />);
    expect(screen.getByText(/über das Formular unten/i)).toBeInTheDocument();
  });

  it("lets a page override the not-configured hint", () => {
    render(<SchedulerEmbed calLink={undefined} fallbackHint="Schreib mir über das Kontaktformular." />);
    expect(screen.getByText("Schreib mir über das Kontaktformular.")).toBeInTheDocument();
    expect(screen.queryByText(/über das Formular unten/i)).not.toBeInTheDocument();
  });
});
