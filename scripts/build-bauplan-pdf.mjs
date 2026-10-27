// Renders the Agentur-Bauplan PDF guide. Run from the Website repo root: npm run bauplan:pdf
// Offline step on Ajdin's machine, never part of the Vercel build (spec section 5).
//   template : content/bauplan/agentur-bauplan.html
//   renderer : ../Clients/_kit/brand-pdf/render-doc.mjs (sibling repo under the HQ root; puppeteer lives there)
//   output   : public/bauplan/agentur-bauplan-<first 8 hex of sha256>.pdf (older agentur-bauplan-*.pdf removed)
// Afterwards set BAUPLAN_PDF_PATH in src/lib/bauplanEmail.ts to the printed path.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, renameSync, copyFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = resolve(root, "content/bauplan/agentur-bauplan.html");
const kitDir = resolve(root, "../Clients/_kit/brand-pdf");
const renderer = join(kitDir, "render-doc.mjs");
const outDir = resolve(root, "public/bauplan");

if (!existsSync(renderer)) {
  console.error(`Kit renderer not found: ${renderer}`);
  process.exit(1);
}

const tmp = mkdtempSync(join(tmpdir(), "bauplan-"));
const tmpOut = join(tmp, "agentur-bauplan.pdf");

const run = spawnSync(process.execPath, ["render-doc.mjs", template, tmpOut], { cwd: kitDir, stdio: "inherit" });
if (run.status !== 0 || !existsSync(tmpOut)) {
  console.error("Render failed.");
  rmSync(tmp, { recursive: true, force: true });
  process.exit(run.status || 1);
}

const hash = createHash("sha256").update(readFileSync(tmpOut)).digest("hex").slice(0, 8);
const name = `agentur-bauplan-${hash}.pdf`;
mkdirSync(outDir, { recursive: true });

const dest = join(outDir, name);
try {
  renameSync(tmpOut, dest);
} catch (err) {
  if (err.code !== "EXDEV") throw err;
  copyFileSync(tmpOut, dest); // tmp sits on another drive
}
// Old PDFs go only after the new one is in place.
rmSync(tmp, { recursive: true, force: true });
for (const f of readdirSync(outDir)) {
  if (!/^agentur-bauplan-.*\.pdf$/.test(f) || f === name) continue;
  try {
    rmSync(join(outDir, f));
  } catch (err) {
    // A viewer may hold the old file open; the new one is already written.
    console.warn(`Could not delete ${f} (${err.code}). Close it and delete it by hand.`);
  }
}

const kb = Math.round(statSync(dest).size / 1024);
console.log(`public/bauplan/${name} (${kb} KB)`);
console.log(`BAUPLAN_PDF_PATH = "/bauplan/${name}"`);
