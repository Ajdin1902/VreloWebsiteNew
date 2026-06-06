"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navLinks } from "@/lib/nav";
import { BrandLockup } from "@/components/BrandLockup";
import { CTAButton } from "@/components/CTAButton";

// Mobile-only navigation: a burger that opens a full-screen tiefes-wasser drawer.
// Hidden at md+ (the desktop nav in Header takes over). a11y: aria-expanded,
// role=dialog + aria-modal, Esc to close, focus moves in and returns to the
// trigger, body scroll locked while open. The open transition is motion-safe.
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Return focus to the trigger after closing.
  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menü öffnen"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen(true)}
        className="flex flex-col gap-[5px] rounded-sm p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
      >
        <span className="block h-0.5 w-6 bg-tiefes-wasser" />
        <span className="block h-0.5 w-6 bg-tiefes-wasser" />
        <span className="block h-0.5 w-6 bg-tiefes-wasser" />
      </button>

      {open ? (
        <div
          id="mobile-nav-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Hauptnavigation"
          tabIndex={-1}
          className="fixed inset-0 z-[60] flex flex-col bg-tiefes-wasser px-6 py-5 text-gletscher motion-safe:animate-[fade-in_180ms_ease-out] focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <BrandLockup variant="paper" />
            <button
              type="button"
              aria-label="Menü schließen"
              onClick={() => setOpen(false)}
              className="rounded-sm p-2 text-2xl leading-none text-gletscher focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
            >
              ✕
            </button>
          </div>

          <ul className="mt-10 flex flex-col gap-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm py-3 text-lg text-gletscher hover:text-honig focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-tiefes-wasser focus-visible:ring-honig"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <CTAButton href="/kontakt" tone="dark" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
