// src/app/opengraph-image.tsx
import { OG_SIZE, renderOg } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vrelo — Durchdachte Automatisierung für kleine Betriebe";

export default function Image() {
  return renderOg({
    eyebrow: "Vrelo",
    title: "Durchdachte Automatisierung für kleine Betriebe.",
  });
}
