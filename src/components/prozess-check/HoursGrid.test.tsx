import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HoursGrid } from "./HoursGrid";
import { AREA_LABEL } from "@/lib/prozessCheck";

describe("HoursGrid", () => {
  it("renders one labelled slider per given area, all starting at 0", () => {
    render(<HoursGrid label="x" hint="h" max={10} areas={["anfragen", "orga"]} onSubmit={() => {}} onBack={() => {}} showBack />);
    expect(screen.getAllByRole("slider")).toHaveLength(2);
    expect(screen.getByLabelText(AREA_LABEL.anfragen)).toHaveValue("0");
    expect(screen.getByLabelText(AREA_LABEL.orga)).toHaveValue("0");
  });

  it("submits the entered hours for the given areas only", () => {
    const onSubmit = vi.fn();
    render(<HoursGrid label="x" hint="h" max={10} areas={["anfragen", "rechnungen"]} onSubmit={onSubmit} onBack={() => {}} showBack={false} />);
    fireEvent.change(screen.getByLabelText(AREA_LABEL.rechnungen), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: /Weiter/i }));
    expect(onSubmit).toHaveBeenCalledWith({ anfragen: 0, rechnungen: 5 });
  });

  it("starts from earlier values", () => {
    render(<HoursGrid label="x" hint="h" max={10} areas={["anfragen"]} initial={{ anfragen: 4 }} onSubmit={() => {}} onBack={() => {}} showBack />);
    expect(screen.getByLabelText(AREA_LABEL.anfragen)).toHaveValue("4");
  });
});
