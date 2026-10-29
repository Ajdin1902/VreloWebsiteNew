// Renders the Elektro-Bauplan PDF for review. Run from the Website repo root: npm run bauplan:elektro
// Offline step on Ajdin's machine, never part of the Vercel build.
//   template : content/bauplan/elektro-bauplan.html
//   renderer : ../Clients/_kit/brand-pdf/render-doc.mjs (sibling repo under the HQ root; puppeteer lives there)
//   gate     : ../Clients/_kit/fahrplan/check-pages.mjs, exactly 5 pages (spec section 3)
//   output   : .preview/elektro-bauplan.pdf (git-ignored review copy)
//   --publish: after a passing gate, also copies it to ../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf
// No file under public/ until the landing page exists (spec section 7); then a hashed copy like the Agentur-Bauplan.
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PAGES = 5;
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const template = resolve(root, "content/bauplan/elektro-bauplan.html");
const kitDir = resolve(root, "../Clients/_kit");
const renderer = join(kitDir, "brand-pdf/render-doc.mjs");
const gate = join(kitDir, "fahrplan/check-pages.mjs");
const out = resolve(root, ".preview/elektro-bauplan.pdf");
const shareCopy = resolve(root, "../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf");
const publish = process.argv.includes("--publish");

for (const f of [renderer, gate]) {
  if (!existsSync(f)) {
    console.error(`Kit file not found: ${f}`);
    process.exit(1);
  }
}

mkdirSync(dirname(out), { recursive: true });
const run = spawnSync(process.execPath, ["render-doc.mjs", template, out], {
  cwd: dirname(renderer),
  stdio: "inherit",
});
if (run.status !== 0 || !existsSync(out)) {
  console.error("Render failed.");
  process.exit(run.status || 1);
}

const check = spawnSync(process.execPath, [gate, out, String(PAGES)], { stdio: "inherit" });
if (check.status !== 0) process.exit(check.status || 1);

if (publish) {
  copyFileSync(out, shareCopy);
  console.log(`Published: ${shareCopy}`);
}
