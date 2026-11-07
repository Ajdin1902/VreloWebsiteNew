// The Bauplan series: one free PDF guide per niche on the shared skeleton
// (spec docs/superpowers/specs/2026-11-06-bauplan-reihe-design.md §4).
import { gebaeudereinigung } from "./gebaeudereinigung";
import { hausmeister } from "./hausmeister";
import { dach } from "./dach";
import { fliesen } from "./fliesen";
import { maler } from "./maler";
import { schreiner } from "./schreiner";
import { galabau } from "./galabau";
import { spedition } from "./spedition";
import { kurier } from "./kurier";
import { umzug } from "./umzug";
import { architektur } from "./architektur";
import { makler } from "./makler";
import { finanzmakler } from "./finanzmakler";
import { shk } from "./shk";

export type ReiheSlug = "shk" | "gebaeudereinigung" | "hausmeister" | "dach" | "schreiner" | "maler" | "fliesen" | "galabau" | "spedition" | "kurier" | "umzug" | "architektur" | "makler" | "finanzmakler"; // grows per niche

export type ReiheNische = {
  slug: ReiheSlug;
  label: string;
  kicker: string;
  title: string; // the owner's question (cover headline)
  schmerz: string; // pain headline over the auftragsweg flow
  // One job today, first call to invoice; verlust = the circled verb where time is lost.
  auftragsweg: { schritt: string; verlust?: string }[];
  // Primary source only; null when the niche has none (spec §5.3).
  statistik: { zahl: string; satz: string; quelle: string; linkText: string; href: string } | null;
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

export const reiheNischen: Record<ReiheSlug, ReiheNische> = { shk, gebaeudereinigung, hausmeister, dach, schreiner, maler, fliesen, galabau, spedition, kurier, umzug, architektur, makler, finanzmakler };

export const isReiheSlug = (s: string): s is ReiheSlug => Object.hasOwn(reiheNischen, s);
