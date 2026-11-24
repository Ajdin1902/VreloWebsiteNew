// The seed flag of pc-research (plan 2 Task 6): only the operator trigger „Seed (Operator)“, which
// pc-seed calls inside n8n, may set it. A seed key in the public webhook body must be ignored, so a
// caller with the secret can never lift the caps or skip the deliver. Runs the exported Plan code.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

type Node = { name: string; type: string; parameters: Record<string, unknown> };
type Wf = { nodes: Node[]; connections: Record<string, { main: { node: string }[][] }>; settings: Record<string, unknown> };
const wf: Wf = JSON.parse(readFileSync(join(process.cwd(), "n8n/prozess-check/workflows/pc-research.json"), "utf8"));
const node = (name: string) => wf.nodes.find((n) => n.name === name)!;
const ziele = (name: string, out: number) => (wf.connections[name]?.main[out] ?? []).map((c) => c.node);

const cfg = JSON.parse(String(node("Config").parameters.jsonOutput));
const planCode = String(node("Plan").parameters.jsCode);

const job = (extra: Record<string, unknown> = {}) => ({
  jobId: "0a6f1c2e-5a7d-4e8f-9a1b-2c3d4e5f0c13", createdAt: "2026-11-24T08:00:00.000Z",
  programme: ["Foo", "Bar"], bereiche: ["anfragen"], stunden: { anfragen: 2 }, nervt: "anfragen", frischeRecherche: true, ...extra,
});

/** Runs the Plan node as n8n would, with the given trigger as the only executed entry. */
function plan(trigger: "Webhook" | "Seed (Operator)", data: unknown) {
  const run: Record<string, { json: unknown }> = { Config: { json: cfg } };
  run[trigger] = trigger === "Webhook" ? { json: { headers: {}, body: data } } : { json: data };
  const $ = (name: string) => ({
    isExecuted: name in run,
    first: () => { if (!(name in run)) throw new Error(`unexecuted ${name}`); return run[name]; },
  });
  const $input = { all: () => [] }; // empty library: every program is unknown
  const DateTime = { now: () => ({ setZone: () => ({ toFormat: () => "24.11.2026" }) }) };
  const out = new Function("$", "$input", "DateTime", planCode)($, $input, DateTime);
  return out[0].json as { seed: boolean; job: Record<string, unknown>; queue: unknown[]; capsGetroffen: string[] };
}

describe("pc-research seed flag", () => {
  it("ignores seed: true on the public webhook and keeps the caps", () => {
    const s = plan("Webhook", job({ seed: true }));
    expect(s.seed).toBe(false);
    expect(s.job).not.toHaveProperty("seed");
    expect(s.queue).toHaveLength(cfg.caps.frischeProgrammeProLead);
    expect(s.capsGetroffen).toContain("programme");
  });
  it("sets seed only on the operator trigger", () => {
    expect(plan("Seed (Operator)", job({ seed: true, programme: ["Foo"] })).seed).toBe(true);
    expect(plan("Seed (Operator)", job({ programme: ["Foo"] })).seed).toBe(false);
  });
  it("still checks the job on the seed path", () => {
    expect(() => plan("Seed (Operator)", job({ seed: true, programme: "Foo" }))).toThrow(/programme/);
  });
  it("wires seed runs to the library only: no synthesis, no deliver", () => {
    expect(node("Seed (Operator)").type).toBe("n8n-nodes-base.executeWorkflowTrigger");
    expect(ziele("Programm offen?", 1)).toEqual(["Seed?"]);
    expect(ziele("Seed?", 0)).toEqual(["Seed abschließen"]);
    expect(ziele("Seed?", 1)).toEqual(["Website lesen?"]);
    expect(wf.connections["Seed abschließen"]).toBeUndefined();
    expect(node("Seed?").parameters).toMatchObject({ conditions: { conditions: [{ leftValue: "={{ $json.seed === true }}" }] } });
  });
  it("lets only the listed caller start the seed trigger", () => {
    expect(wf.settings.callerPolicy).toBe("workflowsFromAList");
    expect(String(wf.settings.callerIds)).toMatch(/^\w+$/);
  });
});
