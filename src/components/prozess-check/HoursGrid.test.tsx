import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HoursGrid } from "./HoursGrid";
import { AREA_IDS, AREA_LABEL } from "@/lib/prozessCheck";

describe("HoursGrid", () => {
  it("renders one labelled slider per area, all starting at 0", () => {
    render(<HoursGrid label="Wo geht deine Zeit hin?" hint="h" max={10} onSubmit={() => {}} onBack={() => {}} showBack />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(AREA_IDS.length);
    for (const id of AREA_IDS) {
      expect(screen.getByLabelText(AREA_LABEL[id])).toHaveValue("0");
    }
  });

  it("submits the entered hours per area", () => {
    const onSubmit = vi.fn();
    render(<HoursGrid label="x" hint="h" max={10} onSubmit={onSubmit} onBack={() => {}} showBack={false} />);
    fireEvent.change(screen.getByLabelText(AREA_LABEL.rechnungen), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText(AREA_LABEL.anfragen), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: /Weiter/i }));
    expect(onSubmit).toHaveBeenCalledWith({ anfragen: 3, auftraege: 0, rechnungen: 5, daten: 0, erinnern: 0, orga: 0 });
  });
});
