"use client";
import { useEffect } from "react";

// A deep link like /faq#fallen-laufende-kosten-an lands on a closed <details>:
// the browser scrolls to the question but the answer stays folded. Open it.
export function OpenFaqFromHash() {
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView();
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
