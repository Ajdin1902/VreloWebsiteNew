import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Reveal } from "./Reveal";

// Capture the IntersectionObserver callback so tests can drive enter/exit,
// mirroring the LazyVideo test's approach.
let ioCallback: IntersectionObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

beforeEach(() => {
  observe.mockClear();
  disconnect.mockClear();
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = vi
    .fn()
    .mockImplementation(function (cb: IntersectionObserverCallback) {
      ioCallback = cb;
      return { observe, disconnect, unobserve: vi.fn(), takeRecords: vi.fn() };
    });
});

describe("Reveal", () => {
  it("renders children inside a div by default with the reveal class", () => {
    const { container } = render(<Reveal>Inhalt</Reveal>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("reveal");
    expect(screen.getByText("Inhalt")).toBeInTheDocument();
  });

  it("renders the given tag via `as` and merges className", () => {
    const { container } = render(
      <Reveal as="h2" className="text-3xl">Titel</Reveal>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.tagName).toBe("H2");
    expect(el).toHaveClass("reveal");
    expect(el).toHaveClass("text-3xl");
  });

  it("forwards arbitrary props (e.g. aria-labelledby) onto the element", () => {
    const { container } = render(
      <Reveal as="ul" aria-labelledby="x">item</Reveal>,
    );
    expect(container.firstElementChild).toHaveAttribute("aria-labelledby", "x");
  });

  it("applies the stagger via transition-delay", () => {
    const { container } = render(<Reveal delayMs={160}>x</Reveal>);
    expect(container.firstElementChild as HTMLElement).toHaveStyle({
      transitionDelay: "160ms",
    });
  });

  it("toggles data-shown two-way as it enters and leaves the viewport", () => {
    const { container } = render(<Reveal>x</Reveal>);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("data-shown", "false");

    act(() => {
      ioCallback(
        [{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(el).toHaveAttribute("data-shown", "true");

    act(() => {
      ioCallback(
        [{ isIntersecting: false, target: el } as unknown as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(el).toHaveAttribute("data-shown", "false");
  });
});
