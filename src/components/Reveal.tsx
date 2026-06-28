"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType; // rendered tag (default "div") — no extra wrapper
  delayMs?: number; // stagger delay
  className?: string;
  children: ReactNode;
} & Record<string, unknown>; // forward id / aria-* / etc. onto the element

// One-way scroll reveal: fades + rises the element in the first time it enters
// the viewport, then disconnects and stays shown. It must NOT re-hide: the
// hidden state translates the element 28px (globals.css), and IntersectionObserver
// measures the *transformed* box — so re-hiding a section that rests at the leave
// threshold would push it back across the threshold and oscillate endlessly. The
// hidden styling is gated behind html.reveal-ready (set by an inline script in the
// root layout), so without JS everything renders visible (no FOUC, never stuck
// hidden). prefers-reduced-motion shows everything.
export function Reveal({ as, delayMs = 0, className = "", children, ...rest }: RevealProps) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect(); // reveal once — never re-hide (see comment above)
        }
      },
      { threshold: 0.2, rootMargin: "-8% 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      {...rest}
      ref={(node: HTMLElement | null) => {
        ref.current = node;
      }}
      data-shown={shown}
      className={`reveal ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  );
}
