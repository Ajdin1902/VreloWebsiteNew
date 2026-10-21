import type { CSSProperties, ReactNode } from "react";

// The shared toolkit of the Leistungs-Grafiken (series rules:
// docs/design/leistungen-grafiken/serie-claude-design-prompts.md, message 0).
// Each drawing is sketched in Claude Design and rebuilt here as inline SVG:
// brand hex values, live text, a wide layout and a stacked one.
export const C = {
  papier: "#F4EFE6",
  wasser: "#0A2538",
  petrol: "#1B5063",
  gletscher: "#DCE7EB",
  faden: "#D4CCBC",
  stumm: "#696359",
  amber: "#D4A24C",
};

// CSS custom properties the icon shapes read (--fill, --detail).
export type IconStyle = CSSProperties & { "--fill"?: string; "--detail"?: string };

/** Connector lines: thin petrol, soft corners. */
export const line = {
  fill: "none",
  stroke: C.petrol,
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;
/** Inputs that are not sorted yet: pale outline, petrol detail. */
export const messy: IconStyle = { color: C.faden, "--detail": C.petrol, strokeLinecap: "round", strokeLinejoin: "round" };
/** Sorted items: petrol outline on a glacier fill. */
export const tidy: IconStyle = { color: C.petrol, "--detail": C.petrol, "--fill": C.gletscher, strokeLinecap: "round", strokeLinejoin: "round" };

/** Fill and detail styles for the outline icons in each drawing's <defs>. */
export const shape = { fill: `var(--fill, ${C.papier})`, stroke: "currentColor" };
export const detail = { fill: "none", stroke: `var(--detail, ${C.petrol})` };

/** The dark rounded square with three lines: the "system" node of the series. */
export function SystemNode({ x, y, size, lineWidth = 2.5 }: { x: number; y: number; size: number; lineWidth?: number }) {
  const pad = size * 0.27;
  const mid = y + size / 2;
  const gap = size / 7;
  return (
    <>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.23} fill={C.wasser} />
      <path
        d={`M${x + pad} ${mid - gap} H${x + size - pad} M${x + pad} ${mid} H${x + size - pad} M${x + pad} ${mid + gap} H${x + size - pad}`}
        stroke={C.gletscher}
        strokeWidth={lineWidth}
        strokeLinecap="round"
      />
    </>
  );
}

/** The amber circle with a check: approved or done. */
export function Approve({ cx, cy, r, checkWidth = 3 }: { cx: number; cy: number; r: number; checkWidth?: number }) {
  const s = r / 30;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <circle r="30" fill={C.amber} />
      <path d="M-14 1 L-4 11 L15 -9" fill="none" stroke={C.wasser} strokeWidth={checkWidth / s} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** A rounded pill with one label (e.g. „mit Quelle“, a question chip). */
export function Pill({
  x, y, w, h, text, size = 14, color = C.stumm,
}: { x: number; y: number; w: number; h: number; text: string; size?: number; color?: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.papier} stroke={C.petrol} strokeWidth="1.5" />
      <text x={x + w / 2} y={y + h / 2 + size * 0.36} fontSize={size} fontWeight="500" fill={color} textAnchor="middle">
        {text}
      </text>
    </>
  );
}

/** Both layouts side by side in the DOM; CSS shows the one that fits. */
export function Layouts({ wide, stacked }: { wide: ReactNode; stacked: ReactNode }) {
  return (
    <>
      {/* The wide layout needs about 1000px to keep its labels readable. */}
      <div className="hidden lg:block">{wide}</div>
      <div className="lg:hidden">{stacked}</div>
    </>
  );
}

export const wideSvg = "block h-auto w-full";
export const stackedSvg = "mx-auto block h-auto w-full max-w-sm";
