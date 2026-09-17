// One-off asset prep for the printed walk-in flyer (HQ: Knowledge/marketing/flyer/).
// Reproducible + idempotent (overwrites). Run: npm run flyer:assets
// Writes into the HQ folder, not into this repo: the flyer is designed in Claude
// Design and printed, nothing here ships with the site.
//   - assets/flyer-qr.svg        : QR for the printed short URL (vector, place as-is)
//   - assets/flyer-qr.png        : same QR, 2048px fallback
//   - assets/flyer-portrait.jpg  : print-resolution square portrait (real photo)
//   - assets/ logo files         : copied from public/logo/
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import QRCode from "qrcode";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = "C:/Users/ajdin/OneDrive/AJ19/Arbeit/Dokumente/Personal/Dzafic_Ajdin.jpg";
// Printed on paper: this URL can never change (pinned in printRedirects.test.ts).
const FLYER_URL = "https://vrelo-ki.de/flyer";
// Brand: tiefes-wasser on papier. Darkest brand tone = safest scan in print.
const QR_COLOR = { dark: "#0a2538", light: "#f4efe6" };

const out = resolve(root, "../Knowledge/marketing/flyer/assets");
mkdirSync(out, { recursive: true });

// 1. QR — quiet zone of 4 modules (print spec), error correction M.
const qrOpts = { margin: 4, errorCorrectionLevel: "M", color: QR_COLOR };
writeFileSync(resolve(out, "flyer-qr.svg"), await QRCode.toString(FLYER_URL, { ...qrOpts, type: "svg" }));
await QRCode.toFile(resolve(out, "flyer-qr.png"), FLYER_URL, { ...qrOpts, width: 2048 });

// 2. Portrait — largest square the source allows, top-anchored so the face
// stays in frame. 1205px = 102mm at 300dpi, enough for a 45mm circle twice over.
const { width } = await sharp(SRC).metadata();
await sharp(SRC)
  .resize(width, width, { fit: "cover", position: "top" })
  .withMetadata({ density: 300 })
  .jpeg({ quality: 95, chromaSubsampling: "4:4:4" })
  .toFile(resolve(out, "flyer-portrait.jpg"));

// 3. Logo pack.
for (const f of ["vrelo-lockup-navy.png", "vrelo-lockup-paper.png", "vrelo-symbol-navy-amber.svg", "vrelo-symbol-paper-amber.svg"]) {
  copyFileSync(resolve(root, "public/logo", f), resolve(out, f));
}

console.log("flyer assets built →", out);
