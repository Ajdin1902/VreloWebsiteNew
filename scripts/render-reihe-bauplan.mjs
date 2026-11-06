// Renders / publishes one Bauplan of the series. Run: npm run bauplan:reihe -- <slug> [--publish]
// Offline step on Ajdin's machine, never part of the Vercel build. Mirrors render-elektro-bauplan.mjs.
//   HQ root  : process.env.VRELO_HQ, else the parent of this repo (in a git worktree set VRELO_HQ, e.g. C:/Users/ajdin/Vrelo).
//   template : content/bauplan/<slug>-bauplan.html, with {{{REIHE_CSS}}} filled from content/bauplan/reihe.css
//   renderer : <HQ>/Clients/_kit/brand-pdf/render-doc.mjs; gate: <HQ>/Clients/_kit/fahrplan/check-pages.mjs
//   output   : .preview/<slug>-bauplan.pdf (git-ignored review copy)
//   --publish: no render. Gates the reviewed .preview PDF, copies it to <HQ>/Knowledge/Offers/<shareCopy>
//              and public/bauplan/<slug>-bauplan-<sha256 first 8>.pdf, deletes older files of the SAME slug only,
//              prints pdfPath for the niche file (the hashed name is load-bearing).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PROTECTED, staleFiles } from "./reihe-publish-lib.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hq = process.env.VRELO_HQ ? resolve(process.env.VRELO_HQ) : resolve(root, "..");
const config = JSON.parse(readFileSync(resolve(root, "content/bauplan/reihe.json"), "utf8"));
const slug = process.argv.slice(2).find((a) => !a.startsWith("--"));
const publish = process.argv.includes("--publish");

if (!slug || !config[slug]) {
  console.error(`Unknown slug "${slug ?? ""}". Known: ${Object.keys(config).join(", ")}`);
  process.exit(1);
}
const { pages, shareCopy } = config[slug];
const kitDir = join(hq, "Clients/_kit");
const renderer = join(kitDir, "brand-pdf/render-doc.mjs");
const gate = join(kitDir, "fahrplan/check-pages.mjs");
const out = resolve(root, `.preview/${slug}-bauplan.pdf`);
const html = resolve(root, `.preview/${slug}-bauplan.html`);

for (const f of [renderer, gate]) {
  if (!existsSync(f)) {
    console.error(`Kit file not found: ${f} (set VRELO_HQ)`);
    process.exit(1);
  }
}

if (publish) {
  if (!existsSync(out)) {
    console.error(`No reviewed PDF at ${out}. Run npm run bauplan:reihe -- ${slug} first.`);
    process.exit(1);
  }
} else {
  mkdirSync(dirname(out), { recursive: true });
  const css = readFileSync(resolve(root, "content/bauplan/reihe.css"), "utf8");
  const src = readFileSync(resolve(root, `content/bauplan/${slug}-bauplan.html`), "utf8");
  writeFileSync(html, src.replace("{{{REIHE_CSS}}}", () => css));
  const run = spawnSync(process.execPath, ["render-doc.mjs", html, out], { cwd: dirname(renderer), stdio: "inherit" });
  if (run.status !== 0 || !existsSync(out)) {
    console.error("Render failed.");
    process.exit(run.status || 1);
  }
}

const check = spawnSync(process.execPath, [gate, out, String(pages)], { stdio: "inherit" });
if (check.status !== 0) process.exit(check.status || 1);

if (publish) {
  const share = join(hq, "Knowledge/Offers", shareCopy);
  copyFileSync(out, share);
  console.log(`Published: ${share}`);
  const publicDir = resolve(root, "public/bauplan");
  const hash = createHash("sha256").update(readFileSync(out)).digest("hex").slice(0, 8);
  const name = `${slug}-bauplan-${hash}.pdf`;
  if (PROTECTED.includes(name)) {
    console.error(`Refusing to publish: ${name} is a protected file.`);
    process.exit(1);
  }
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(out, join(publicDir, name));
  for (const f of staleFiles(slug, readdirSync(publicDir), name)) {
    try {
      rmSync(join(publicDir, f));
    } catch (err) {
      console.warn(`Could not delete ${f} (${err.code}). Close it and delete it by hand.`);
    }
  }
  console.log(`pdfPath = "/bauplan/${name}"`);
}
