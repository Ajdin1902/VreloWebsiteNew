"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

type LazyVideoProps = {
  mp4: string;
  webm?: string;
  poster: string;
  className?: string;
  aspect?: string;
};

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Client-only read of the reduced-motion preference, hydration-safe: the server
// snapshot is always false (so the <video> renders to match SSR), then React
// swaps to the real client value after hydration without a mismatch warning.
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(REDUCED_MOTION_QUERY);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false
  );
}

// Reusable lazy video: motion-safe, poster-fallback, plays only while in view.
// Layout (sizing/object-fit) is owned by the parent via className/aspect.
export function LazyVideo({
  mp4,
  webm,
  poster,
  className = "",
  aspect = "",
}: LazyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const posterOnly = usePrefersReducedMotion();

  useEffect(() => {
    if (posterOnly) return;
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void el.play().catch(() => {});
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [posterOnly]);

  const boxClass = [aspect, className].filter(Boolean).join(" ");

  if (posterOnly) {
    // Decorative still; the narrative meaning lives in adjacent text.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poster} alt="" aria-hidden="true" className={boxClass} />;
  }

  return (
    <video
      ref={videoRef}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      className={boxClass}
    >
      {webm ? <source src={webm} type="video/webm" /> : null}
      <source src={mp4} type="video/mp4" />
    </video>
  );
}
