import { describe, it, expect } from "vitest";
import { submitProzessCheckEmail, type ProzessCheckEmailState } from "./actions";

function fd(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

const idle: ProzessCheckEmailState = { status: "idle" };

// Well-formed base answers (renderedAt far in the past so it isn't "too fast").
const good = {
  renderedAt: "0",
  email: "a@b.de",
  branche: "handwerk",
  team: "6bis20",
  h_anfragen: "3",
  h_rechnungen: "5",
  h_daten: "1",
  h_erinnern: "0",
  h_orga: "0",
  nervt: "rechnungen",
  abende: "staendig",
  versucht: "toolBrach",
};

describe("submitProzessCheckEmail gate", () => {
  it("drops a honeypot hit as a silent ok", async () => {
    const s = await submitProzessCheckEmail(idle, fd({ ...good, website: "bot" }));
    expect(s.status).toBe("ok");
  });
  it("invalidates a bad email", async () => {
    const s = await submitProzessCheckEmail(idle, fd({ ...good, email: "nope" }));
    expect(s.status).toBe("invalid");
  });
  it("rejects a too-fast submit", async () => {
    const s = await submitProzessCheckEmail(idle, fd({ ...good, renderedAt: String(Date.now()) }));
    expect(s.status).toBe("error");
  });
});
