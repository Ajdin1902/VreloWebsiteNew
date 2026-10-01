import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const params = { value: new URLSearchParams() };
vi.mock("next/navigation", () => ({ useSearchParams: () => params.value }));

const seen: { notes?: string }[] = [];
vi.mock("./SchedulerEmbed", () => ({
  SchedulerEmbed: (props: { notes?: string }) => {
    seen.push(props);
    return null;
  },
}));

import { SchedulerFromUrl } from "./SchedulerFromUrl";

describe("SchedulerFromUrl", () => {
  beforeEach(() => {
    seen.length = 0;
  });

  it("passes a valid src into the booking notes", () => {
    params.value = new URLSearchParams("src=leistung-claude");
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBe("Quelle: leistung-claude");
  });

  it("drops junk and overlong src values", () => {
    params.value = new URLSearchParams("src=%3Cscript%3E");
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBeUndefined();
    params.value = new URLSearchParams(`src=${"a".repeat(60)}`);
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBeUndefined();
  });

  it("omits notes when there is no src", () => {
    params.value = new URLSearchParams();
    render(<SchedulerFromUrl calLink="x/y" />);
    expect(seen.at(-1)?.notes).toBeUndefined();
  });
});
