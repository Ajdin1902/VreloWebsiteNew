// Re-exports the pc-* workflows from server1 into n8n/prozess-check/workflows (README „Re-exporting the workflows“).
// Usage (from the repo root): node n8n/prozess-check/export-workflows.mjs   [outDir name=id ...]
// Writes {name,id,active:false,nodes,connections,settings}; credentials stay {id,name}; no pinData.
// Refuses an active workflow and any file holding a secret-like string. Reads the n8n API URL/key from the
// n8n-mcp entry in ~/.claude.json (the operator laptop) and never prints them.
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const cfg = JSON.parse(readFileSync(join(homedir(), ".claude.json"), "utf8"));
let env;
for (const scope of [cfg, ...Object.values(cfg.projects || {})])
  for (const [k, v] of Object.entries(scope.mcpServers || {})) if (k === "n8n-mcp" && v.env?.N8N_API_KEY) env = v.env;
if (!env) throw new Error("no n8n-mcp env");

const DEFAULT = ["pc-research=rgrZAHzpkZe7BlWM", "pc-error=LHCwSm6lZ4RTJtIi", "pc-sweep=bKNRGEJEeKPcCGuJ", "pc-seed=9dKd5KiXE0QJRPjC"];
const [outDir = "n8n/prozess-check/workflows", ...rest] = process.argv.slice(2);
const pairs = rest.length ? rest : DEFAULT;
for (const p of pairs) {
  const [name, id] = p.split("=");
  const res = await fetch(`${env.N8N_API_URL}/api/v1/workflows/${id}`, { headers: { "X-N8N-API-KEY": env.N8N_API_KEY } });
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const w = await res.json();
  if (w.active) { console.log(`${name}: ACTIVE, refusing to export`); continue; }
  const nodes = w.nodes.map((n) => {
    const m = { ...n };
    if (m.credentials) m.credentials = Object.fromEntries(Object.entries(m.credentials).map(([t, c]) => [t, { id: c.id, name: c.name }]));
    return m;
  });
  const out = { name: w.name, id: w.id, active: false, nodes, connections: w.connections, settings: w.settings };
  const text = JSON.stringify(out, null, 2) + "\n";
  if (/[0-9a-f]{64}/i.test(text) || /sk-ant-/.test(text) || /pinData/.test(text) || text.includes(env.N8N_API_KEY)) {
    console.log(`${name}: secret-like string found, not written`);
    continue;
  }
  writeFileSync(join(outDir, `${name}.json`), text);
  console.log(`${name}: written, ${nodes.length} nodes`);
}
