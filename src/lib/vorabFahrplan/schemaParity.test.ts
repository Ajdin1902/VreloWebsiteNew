// The n8n JSON Schemas (n8n/prozess-check/schemas) must not drift from the zod contract
// the deliver endpoint parses with, nor from the pc_tools table they are written into.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { AREA_IDS } from "@/lib/prozessCheck";
import { ResearchResultSchema } from "./research";

type Json = { type?: string; properties?: Record<string, Json>; required?: string[]; additionalProperties?: boolean; items?: Json; enum?: string[] };
const dir = join(process.cwd(), "n8n/prozess-check/schemas");
const load = (f: string): Json => JSON.parse(readFileSync(join(dir, f), "utf8"));

// Run data n8n writes into the dossier after the synthesis call; the model never sees them.
const N8N_SETZT: Record<string, string[]> = { dossier: ["kostenUsd", "capsGetroffen"] };

const sorted = (xs: readonly string[]) => [...xs].sort();

/** Walks zod and JSON Schema side by side: same keys, same required set, same enums. */
function vergleiche(zs: z.ZodType, js: Json, pfad: string): void {
  while (zs instanceof z.ZodOptional || zs instanceof z.ZodDefault) zs = zs.unwrap() as z.ZodType;
  if (zs instanceof z.ZodObject) {
    expect(js.type, pfad).toBe("object");
    expect(js.additionalProperties, `${pfad}: additionalProperties`).toBe(false);
    const shape = zs.shape as Record<string, z.ZodType>;
    const keys = Object.keys(shape).filter((k) => !(N8N_SETZT[pfad] ?? []).includes(k));
    expect(sorted(Object.keys(js.properties ?? {})), `${pfad}: keys`).toEqual(sorted(keys));
    const pflicht = keys.filter((k) => !(shape[k] instanceof z.ZodOptional));
    expect(sorted(js.required ?? []), `${pfad}: required`).toEqual(sorted(pflicht));
    for (const k of keys) vergleiche(shape[k], js.properties![k], `${pfad}.${k}`);
  } else if (zs instanceof z.ZodArray) {
    expect(js.type, pfad).toBe("array");
    vergleiche(zs.element as z.ZodType, js.items!, `${pfad}[]`);
  } else if (zs instanceof z.ZodEnum) {
    expect(js.type, pfad).toBe("string");
    expect(sorted(js.enum ?? []), `${pfad}: enum`).toEqual(sorted(zs.options as string[]));
  } else if (zs instanceof z.ZodString) expect(js.type, pfad).toBe("string");
  else if (zs instanceof z.ZodNumber) expect(js.type, pfad).toBe("number");
  else if (zs instanceof z.ZodBoolean) expect(js.type, pfad).toBe("boolean");
  else throw new Error(`${pfad}: zod type not covered by the parity test`);
}

/** Structured outputs reject objects without additionalProperties: false (claude-api docs). */
function alleObjekteGeschlossen(js: Json, pfad: string): void {
  if (js.type === "object") expect(js.additionalProperties, pfad).toBe(false);
  for (const [k, v] of Object.entries(js.properties ?? {})) alleObjekteGeschlossen(v, `${pfad}.${k}`);
  if (js.items) alleObjekteGeschlossen(js.items, `${pfad}[]`);
}

describe("synthese.output.json", () => {
  const js = load("synthese.output.json");

  it("asks the model for pdf and dossier only, both required", () => {
    expect(js.additionalProperties).toBe(false);
    expect(sorted(Object.keys(js.properties ?? {}))).toEqual(["dossier", "pdf"]);
    expect(sorted(js.required ?? [])).toEqual(["dossier", "pdf"]);
  });

  it("matches ResearchResultSchema.pdf and .dossier key by key", () => {
    vergleiche(ResearchResultSchema.shape.pdf, js.properties!.pdf, "pdf");
    vergleiche(ResearchResultSchema.shape.dossier, js.properties!.dossier, "dossier");
  });
});

describe("programm.output.json and pc_tools.json", () => {
  const js = load("programm.output.json");
  const tabellen = JSON.parse(readFileSync(join(dir, "pc_tools.json"), "utf8")) as {
    pc_tools: { columns: { name: string; setBy: "modell" | "n8n" }[] };
  };

  it("closes every object", () => alleObjekteGeschlossen(js, "programm"));

  it("asks the model for exactly the pc_tools columns the model fills", () => {
    const vomModell = tabellen.pc_tools.columns.filter((c) => c.setBy === "modell").map((c) => c.name);
    expect(sorted(Object.keys(js.properties ?? {}))).toEqual(sorted(vomModell));
    expect(sorted(js.required ?? [])).toEqual(sorted(vomModell));
  });

  it("uses the website's area ids for bordmittel", () => {
    expect(sorted(js.properties!.bordmittel.items!.properties!.bereich.enum ?? [])).toEqual(sorted(AREA_IDS));
  });
});
