import { describe, it, expect, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { LazyVideo } from "./LazyVideo";

let ioCallback: IntersectionObserverCallback;
const observe = vi.fn();
const disconnect = vi.fn();

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  observe.mockClear();
  disconnect.mockClear();
  (globalThis as unknown as { IntersectionObserver: unknown }).IntersectionObserver = vi
    .fn()
    .mockImplementation(function (cb: IntersectionObserverCallback) {
      ioCallback = cb;
      return { observe, disconnect, unobserve: vi.fn(), takeRecords: vi.fn() };
    });
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: vi.fn().mockResolvedValue(undefined),
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value: vi.fn(),
  });
});

describe("LazyVideo", () => {
  it("renders only the poster image under prefers-reduced-motion", () => {
    setReducedMotion(true);
    const { container } = render(
      <LazyVideo mp4="/video/quelle.mp4" poster="/video/quelle-poster.jpg" />
    );
    expect(container.querySelector("video")).not.toBeInTheDocument();
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "/video/quelle-poster.jpg"
    );
  });

  it("renders a decorative video with poster and webm-then-mp4 sources", () => {
    setReducedMotion(false);
    const { container } = render(
      <LazyVideo
        mp4="/video/quelle.mp4"
        webm="/video/quelle.webm"
        poster="/video/quelle-poster.jpg"
      />
    );
    const video = container.querySelector("video");
    expect(video).toHaveAttribute("poster", "/video/quelle-poster.jpg");
    expect(video).toHaveAttribute("aria-hidden", "true");
    const sources = container.querySelectorAll("source");
    expect(sources[0]).toHaveAttribute("type", "video/webm");
    expect(sources[1]).toHaveAttribute("type", "video/mp4");
  });

  it("plays when scrolled into view and pauses when out of view", () => {
    setReducedMotion(false);
    const { container } = render(
      <LazyVideo mp4="/video/quelle.mp4" poster="/video/quelle-poster.jpg" />
    );
    const video = container.querySelector("video") as HTMLVideoElement;
    ioCallback(
      [{ isIntersecting: true, target: video } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(video.play).toHaveBeenCalled();
    ioCallback(
      [{ isIntersecting: false, target: video } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
    expect(video.pause).toHaveBeenCalled();
  });
});
