import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

function frauncesFont(): Buffer {
  // Static (non-variable) TTF required by satori — variable fonts are not supported.
  return fs.readFileSync(path.join(process.cwd(), "src", "app", "_og", "Fraunces-SemiBold-static.ttf"));
}

export function renderOg(opts: { eyebrow: string; title: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#F4EFE6", // papier
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ width: 26, height: 34, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", backgroundColor: "#D4A24C" }} />
          <div style={{ fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#7A7468" }}>
            {opts.eyebrow}
          </div>
        </div>
        <div style={{ fontFamily: "Fraunces", fontSize: 68, lineHeight: 1.1, color: "#0A2538", maxWidth: 1000 }}>
          {opts.title}
        </div>
        <div style={{ fontSize: 30, color: "#1B5063" }}>vrelo · Durchdachte Automatisierung</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Fraunces", data: frauncesFont(), style: "normal", weight: 600 }],
    },
  );
}
