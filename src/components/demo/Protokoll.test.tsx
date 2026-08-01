import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Protokoll } from "./Protokoll";
import type { DemoSeed } from "@/lib/demo/seed";
import type { ChatMessage } from "@/lib/demo/prompt";

// Stub the Cal embed – these tests assert our gating and layout, not Cal
// internals. vi.hoisted is required under Vitest v4: a plain top-level const
// referenced inside the factory throws "Cannot access before initialization".
const calMock = vi.hoisted(() => ({ props: null as Record<string, unknown> | null }));
vi.mock("@calcom/embed-react", () => ({
  default: (props: Record<string, unknown>) => {
    calMock.props = props;
    return <div data-testid="cal-embed" />;
  },
}));

const seed = { business: "Baufi", appointmentType: "baufinanzierung", tone: "locker" } as DemoSeed;
const transcript: ChatMessage[] = [
  { role: "user", content: "Hallo" },
  { role: "assistant", content: "Guten Tag, Ihr Name?" },
];

function jsonResponse(body: unknown): Response {
  return { ok: true, json: async () => body } as unknown as Response;
}

// jsdom does not implement scrollIntoView, so there is no property to spy on –
// install the mock on the prototype instead. Kept per-test so assertions never
// see calls from a previous render.
let scrollSpy: ReturnType<typeof vi.fn<(arg?: boolean | ScrollIntoViewOptions) => void>>;

beforeEach(() => {
  vi.restoreAllMocks();
  scrollSpy = vi.fn();
  Element.prototype.scrollIntoView = scrollSpy;
});

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

    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /kontaktformular/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });

  it("renders the email row and a simulated confirmation-mail preview when an email is present", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "Baufinanzierung", termin: "Mo 6.7. 10:00", offenePunkte: [], email: "alen@example.de" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findAllByText("alen@example.de")).toHaveLength(2);
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

  it("renders the Terminnotiz and preview for an email-only note (name/anliegen/termin empty)", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "", anliegen: "", termin: "", offenePunkte: [], email: "only@example.de" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByRole("heading", { name: "Terminnotiz" })).toBeTruthy();
    expect(screen.getAllByText("only@example.de").length).toBeGreaterThan(0);
    expect(screen.getByText(/Bestätigungsmail/i)).toBeTruthy();
  });

  it("degrades gracefully to transcript-only when the summary fetch rejects", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("boom"));
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Hallo")).toBeTruthy();
    expect(screen.queryByText("Alen")).toBeNull();
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /kontaktformular/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });

  it("auto-expands the transcript as fail-safe proof when the summary fetch fails", async () => {
    vi.spyOn(global, "fetch").mockRejectedValue(new Error("boom"));
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    await screen.findByText(/Termin gebucht/i);
    const details = screen.getByText("Hallo").closest("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(true);
  });

  it("degrades gracefully to transcript-only on a non-200 summary response", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 503, json: async () => ({}) } as Response);
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(await screen.findByText("Hallo")).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Terminnotiz" })).toBeNull();
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    const cta = screen.getByRole("link", { name: /kontaktformular/i });
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

  it("scrolls itself into view and focuses its heading on mount", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    const heading = await screen.findByRole("heading", { name: /Das hat dein Kunde gerade erlebt/i });
    expect(document.activeElement).toBe(heading);
  });

  it("scrolls without animation when the visitor prefers reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true } as MediaQueryList);
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(scrollSpy).toHaveBeenCalledWith({ behavior: "auto", block: "start" });
    await screen.findByText("Alen");
  });

  it("does not throw in a browser without scrollIntoView", async () => {
    // The real jsdom baseline: the API is absent. Guards the optional call.
    Reflect.deleteProperty(Element.prototype, "scrollIntoView");
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );

    expect(() =>
      render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />),
    ).not.toThrow();
    await screen.findByText("Alen");
  });

  it("puts the closing CTA above the transcript", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    const cta = screen.getByRole("button", { name: /Termin anzeigen/i });
    const verlauf = screen.getByText("Gespräch nachlesen").closest("details");
    expect(verlauf).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING = the transcript comes after the CTA.
    expect(cta.compareDocumentPosition(verlauf!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // Pins proof above the ask: a refactor hoisting AbschlussCta above the
    // summary would pass every other test while destroying this branch's premise.
    const notiz = screen.getByRole("heading", { name: "Terminnotiz" });
    expect(notiz.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps the transcript inside a collapsed details block", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    const details = screen.getByText("Hallo").closest("details");
    expect(details).not.toBeNull();
    expect(details!.open).toBe(false);
  });

  it("renders no transcript block at all when the transcript is empty", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={[]} />);
    await screen.findByText("Alen");

    expect(screen.queryByText("Gespräch nachlesen")).toBeNull();
  });

  it("offers direct booking without mounting the Cal iframe before the click", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
    // No third-party request on render – the /demo Datenschutz section says so.
    expect(screen.queryByTestId("cal-embed")).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: /Termin anzeigen/i }));
    expect(screen.getByTestId("cal-embed")).toBeInTheDocument();
    expect(calMock.props?.calLink).toBe("https://cal.example/x");
  });

  it("shows the booking CTA while the summary is still loading", () => {
    // A promise that never settles: no state update, so no act() warning, and
    // the component stays pinned in its loading state for the assertion.
    vi.spyOn(global, "fetch").mockReturnValue(new Promise<Response>(() => {}));
    render(<Protokoll calLink="https://cal.example/x" seed={seed} transcript={transcript} />);

    expect(screen.getByText(/Einen Moment/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Termin anzeigen/i })).toBeInTheDocument();
  });

  it("falls back to the Kontakt CTA when no scheduler is configured", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      jsonResponse({ name: "Alen", anliegen: "", termin: "", offenePunkte: [], email: "" }),
    );
    render(<Protokoll calLink={undefined} seed={seed} transcript={transcript} />);
    await screen.findByText("Alen");

    expect(screen.queryByRole("button", { name: /Termin anzeigen/i })).toBeNull();
    const cta = screen.getByRole("link", { name: /reden/i });
    expect(cta.getAttribute("href")).toContain("/kontakt");
  });
});
