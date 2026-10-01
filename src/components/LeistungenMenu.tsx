"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { leistungenMenu } from "@/lib/nav";

const linkFocus =
  "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol";

// Desktop „Leistungen“: the label stays a link to the hub, a separate toggle
// opens the grouped panel (click/keyboard, never hover-only). Escape closes and
// returns focus to the toggle; a click outside or focus leaving closes it.
// The panel is positioned against the header <nav> (which is `relative`), so it
// never overflows the viewport at md widths.
export function LeistungenMenu({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: Event) => !wrapRef.current?.contains(e.target as Node);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const onPointer = (e: MouseEvent) => {
      if (outside(e)) setOpen(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (outside(e)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [open]);

  const inSection = pathname?.startsWith("/leistungen") ?? false;

  return (
    <div ref={wrapRef} className="flex items-center gap-1">
      <Link
        href="/leistungen"
        aria-current={pathname === "/leistungen" ? "page" : undefined}
        className={`text-sm transition-colors hover:text-vrelo-petrol ${linkFocus} ${inSection ? "font-semibold text-vrelo-petrol" : "text-tinte"}`}
      >
        Leistungen
      </Link>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Leistungen-Menü"
        aria-expanded={open}
        aria-controls="leistungen-menu"
        onClick={() => setOpen((o) => !o)}
        className={`p-1 text-tinte hover:text-vrelo-petrol ${linkFocus}`}
      >
        <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>

      {open ? (
        <div
          id="leistungen-menu"
          className="absolute inset-x-6 top-full z-50 mx-auto mt-2 grid max-w-3xl gap-6 rounded-2xl border border-faden bg-papier p-6 shadow-deepwater sm:grid-cols-3"
        >
          {leistungenMenu.map((g) => (
            <div key={g.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{g.label}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {g.items.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === it.href ? "page" : undefined}
                      className={`text-sm text-tinte hover:text-vrelo-petrol aria-[current=page]:font-semibold aria-[current=page]:text-vrelo-petrol ${linkFocus}`}
                    >
                      {it.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <Link
            href="/leistungen"
            onClick={() => setOpen(false)}
            className={`text-sm font-semibold text-vrelo-petrol sm:col-span-3 ${linkFocus}`}
          >
            Alle Leistungen <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
