// The content shape of the Vorab-Fahrplan PDF. The fallback (fallback.ts) fills it
// from fixed blocks; the research run (Plan 2) fills the same shape.
import type { AreaId } from "@/lib/prozessCheck";

export type Quelle = { n: number; url: string; abgerufen: string /* dd.mm.yyyy */ };
export type Schritt = {
  rang: "Zuerst" | "Danach" | "Später";
  bereich: AreaId;
  titel: string;          // ≤ 40
  idee: string;           // ≤ 260
  mitProgrammen?: string; // ≤ 180, research only
  tipp?: string;          // ≤ 180, Zuerst only
  quellen: number[];      // ids into VorabFahrplan.quellen
};
export type ProgrammZeile = { name: string; zeilen: string[] /* ≤ 3 × ≤ 160 */; quellen: number[] };
export type VorabFahrplan = {
  firma: string; name: string; datum: string;
  stundenZeile: string;   // "Rund 9 Stunden pro Woche · 52 Arbeitstage im Jahr"
  stundenProWoche: number; // total hours per week, drives the mail headline
  arbeitstag?: string;    // quoted
  zeitVerteilung: { label: string; stunden: number; satz: string }[]; // ≤ 3
  aufgabeZeile: string;   // "kommt per Mail rein · 20 bis 50 pro Woche · macht das Büro"
  schritte: Schritt[];    // 1..3
  programme: ProgrammZeile[]; // empty in fallback
  quellen: Quelle[];      // empty in fallback, except tip sources
  recherchiert: boolean;  // false in fallback: no KI footer, no page 2
};
export const LIMITS: { titel: 40; idee: 260; mitProgrammen: 180; tipp: 180; programmZeile: 160; arbeitstag: 500 } = {
  titel: 40,
  idee: 260,
  mitProgrammen: 180,
  tipp: 180,
  programmZeile: 160,
  arbeitstag: 500,
};
