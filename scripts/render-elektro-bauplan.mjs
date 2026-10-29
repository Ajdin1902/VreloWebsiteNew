// Renders the Elektro-Bauplan PDF for review. Run from the Website repo root: npm run bauplan:elektro
// Offline step on Ajdin's machine, never part of the Vercel build.
//   template : content/bauplan/elektro-bauplan.html
//   renderer : ../Clients/_kit/brand-pdf/render-doc.mjs (sibling repo under the HQ root; puppeteer lives there)
//   gate     : ../Clients/_kit/fahrplan/check-pages.mjs, exactly 6 pages (spec section 3)
//   output   : .preview/elektro-bauplan.pdf (git-ignored review copy)
//   --publish[=<path>]: no new render. Gates the reviewed .preview PDF and copies exactly that file
//              to ../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf (or <path>), so what Ajdin approved is what ships.
// No file under public/ until the landing page exists (spec section 7); then a hashed copy like the Agentur-Bauplan.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PAGES = 6;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = resolve(root, "content/bauplan/elektro-bauplan.html");
const kitDir = resolve(root, "../Clients/_kit");
const renderer = join(kitDir, "brand-pdf/render-doc.mjs");
const gate = join(kitDir, "fahrplan/check-pages.mjs");
const out = resolve(root, ".preview/elektro-bauplan.pdf");
const publishArg = process.argv.find((a) => a === "--publish" || a.startsWith("--publish="));
const shareCopy = publishArg?.startsWith("--publish=")
  ? resolve(publishArg.slice("--publish=".length))
  : resolve(root, "../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf");

for (const f of [renderer, gate]) {
  if (!existsSync(f)) {
    console.error(`Kit file not found: ${f}`);
    process.exit(1);
  }
}

if (publishArg) {
  if (!existsSync(out)) {
    console.error(`No reviewed PDF at ${out}. Run npm run bauplan:elektro first.`);
    process.exit(1);
  }
} else {
  mkdirSync(dirname(out), { recursive: true });
  const run = spawnSync(process.execPath, ["render-doc.mjs", template, out], {
    cwd: dirname(renderer),
    stdio: "inherit",
  });
  if (run.status !== 0 || !existsSync(out)) {
    console.error("Render failed.");
    process.exit(run.status || 1);
  }
}

const check = spawnSync(process.execPath, [gate, out, String(PAGES)], { stdio: "inherit" });
if (check.status !== 0) process.exit(check.status || 1);

if (publishArg) {
  copyFileSync(out, shareCopy);
  console.log(`Published: ${shareCopy}`);
}
