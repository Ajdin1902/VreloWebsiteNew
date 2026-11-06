// The Bauplan series: one free PDF guide per niche on the shared skeleton
// (spec docs/superpowers/specs/2026-11-06-bauplan-reihe-design.md §4).
import { shk } from "./shk";

export type ReiheSlug = "shk"; // grows per niche

export type ReiheNische = {
  slug: ReiheSlug;
  label: string;
  kicker: string;
  title: string;
  schmerz: string;
  // Primary source only; null when the niche has none (spec §5.3).
  statistik: { zahl: string; satz: string; quelle: string; linkText: string; href: string } | null;
  inhalt: string[];
  mail: { attachmentName: string; readerSubject: string; readerClose: string; internalPrefix: string };
  pdfPath: string;
  template: string;
  pages: number;
  // Every tool or standard the template may name (exact, case-sensitive spelling). The guard
  // checks the template's tools table against it, so the list cannot fall behind the copy.
  knownTools: string[];
  // The subset the research verified as connectable; the guard rejects "Schnittstelle"
  // next to any other known tool.
  verifiedInterfaces: string[];
};

export const reiheNischen: Record<ReiheSlug, ReiheNische> = { shk };
