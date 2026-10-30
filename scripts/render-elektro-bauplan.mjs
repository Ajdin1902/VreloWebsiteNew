// Renders the Elektro-Bauplan PDF for review. Run from the Website repo root: npm run bauplan:elektro
// Offline step on Ajdin's machine, never part of the Vercel build.
//   template : content/bauplan/elektro-bauplan.html
//   renderer : ../Clients/_kit/brand-pdf/render-doc.mjs (sibling repo under the HQ root; puppeteer lives there)
//   gate     : ../Clients/_kit/fahrplan/check-pages.mjs, exactly 7 pages (6 + the offer page, 2026-10-30)
//   output   : .preview/elektro-bauplan.pdf (git-ignored review copy)
//   --publish[=<path>]: no new render. Gates the reviewed .preview PDF and copies exactly that file
//              to ../Knowledge/Offers/Elektro-Bauplan-Vrelo.pdf (or <path>), so what Ajdin approved is what ships,
//              and to public/bauplan/elektro-bauplan-<first 8 hex of sha256>.pdf for the landing page mail.
//              The hashed name is load-bearing: update ELEKTRO_BAUPLAN_PDF_PATH in src/lib/bauplanEmail.ts with it.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PAGES = 7;
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

  const publicDir = resolve(root, "public/bauplan");
  const hash = createHash("sha256").update(readFileSync(out)).digest("hex").slice(0, 8);
  const name = `elektro-bauplan-${hash}.pdf`;
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(out, join(publicDir, name));
  // Old Elektro PDFs go only after the new one is in place; the Agentur file is never touched.
  for (const f of readdirSync(publicDir)) {
    if (!/^elektro-bauplan-.*\.pdf$/.test(f) || f === name) continue;
    try {
      rmSync(join(publicDir, f));
    } catch (err) {
      console.warn(`Could not delete ${f} (${err.code}). Close it and delete it by hand.`);
    }
  }
  console.log(`public/bauplan/${name}`);
  console.log(`ELEKTRO_BAUPLAN_PDF_PATH = "/bauplan/${name}"`);
}
