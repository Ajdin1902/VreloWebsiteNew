import { C, line, shape, detail, Layouts, wideSvg, stackedSvg, type IconStyle } from "./shared";

// KI-Server (Claude Design, variant A Verschachtelte Rahmen): a dashed frame
// for the EU, inside it a solid frame for the client's own server. Upload, KI
// check and folder stay inside; the only line that leaves is the request for
// missing documents, back to the client's own customer. Amber marks the key.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kis-env">
          <rect x="-32" y="-22" width="64" height="44" rx="7" style={shape} />
          <path d="M-26 -15 L0 4 L26 -15" style={detail} />
        </g>
        <g id="kis-doc">
          <path d="M-22 -30 H9 L22 -17 V30 H-22 Z" style={shape} />
          <path d="M9 -30 V-17 H22" style={{ fill: "none", stroke: "currentColor" }} />
          <path d="M-12 -4 H12 M-12 6 H12 M-12 16 H3" style={detail} />
        </g>
        <g id="kis-folder">
          <path d="M-26 -16 Q-26 -20 -22 -20 H-9 L-4 -14 H22 Q26 -14 26 -10 V18 Q26 22 22 22 H-22 Q-26 22 -26 18 Z" style={shape} />
          <path d="M-26 -6 H26" style={detail} />
        </g>
        <g id="kis-key">
          <circle cx="-9" cy="0" r="8" fill={C.amber} />
          <circle cx="-9" cy="0" r="3" fill={C.gletscher} />
          <path d="M-2 0 H15 M11 0 V6 M15 0 V5" fill="none" stroke={C.amber} strokeWidth="3" strokeLinecap="round" />
        </g>
      </defs>
    </svg>
  );
}

const icon: IconStyle = { color: C.petrol, "--detail": C.petrol, strokeLinecap: "round", strokeLinejoin: "round" };

/** The two frames: dashed EU boundary, solid server owned by the client. */
function Frames({ outer, inner, euLabel, keyAt: k, owner }: {
  outer: [number, number, number, number, number];
  inner: [number, number, number, number, number];
  euLabel: [number, number];
  keyAt: [number, number];
  owner: { name: [number, number]; sub: [number, number] };
}) {
  return (
    <>
      <rect x={outer[0]} y={outer[1]} width={outer[2]} height={outer[3]} rx={outer[4]} fill="none" stroke={C.petrol} strokeWidth="1.5" strokeDasharray="6 6" />
      <text x={euLabel[0]} y={euLabel[1]} fontSize="16" fontWeight="600" fill={C.wasser}>
        Innerhalb der EU
      </text>
      <rect x={inner[0]} y={inner[1]} width={inner[2]} height={inner[3]} rx={inner[4]} fill={C.gletscher} stroke={C.petrol} strokeWidth="2" />
      <use href="#kis-key" transform={`translate(${k[0]} ${k[1]})`} />
      <text x={owner.name[0]} y={owner.name[1]} fontSize="16" fontWeight="600" fill={C.wasser}>
        Dein Server
      </text>
      <text x={owner.sub[0]} y={owner.sub[1]} fontSize="14" fontWeight="500" fill={C.stumm}>
        auf deinen Namen
      </text>
    </>
  );
}

/** The KI node with its label inside. */
function KiNode({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.23} fill={C.wasser} />
      <text x={x + size / 2} y={y + size / 2 + 5} fontSize="15" fontWeight="600" fill={C.gletscher} textAnchor="middle">
        KI prüft
      </text>
    </>
  );
}

function Wide() {
  // The request leaves on the right (Ajdin 2026-10-21): frames sit left, the
  // envelope at the right edge, the line crosses the EU boundary at x 900.
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <Frames
        outer={[40, 30, 860, 360, 24]}
        inner={[100, 90, 750, 260, 20]}
        euLabel={[64, 62]}
        keyAt={[138, 122]}
        owner={{ name: [162, 127], sub: [266, 127] }}
      />
      <g style={line}>
        <path d="M272 225 H430" />
        <path d="M526 225 H645" />
        <path d="M478 273 V360 Q478 370 488 370 H950 Q960 370 960 360 V240 Q960 230 970 230 H1004" />
        <path d="M997 224 L1004 230 L997 236" />
      </g>
      <g style={{ ...icon, strokeWidth: 1.8 }}>
        <use href="#kis-doc" transform="translate(250 225)" />
        <use href="#kis-folder" transform="translate(672 225)" />
      </g>
      <KiNode x={430} y={177} size={96} />
      <g fontSize="16" fontWeight="500" fill={C.wasser} textAnchor="middle">
        <text x="250" y="286">Unterlagen hochladen</text>
        <text x="672" y="286">Dein Ordner</text>
        <text x="1054" y="277">Fehlendes nachfragen</text>
      </g>
      <use href="#kis-env" transform="translate(1054 230) scale(.55)" style={{ ...icon, strokeWidth: 3.2 }} />
    </svg>
  );
}

function Stacked() {
  return (
    <svg viewBox="0 0 360 640" className={stackedSvg} aria-hidden focusable="false">
      <use href="#kis-env" transform="translate(300 52) scale(.5)" style={{ ...icon, strokeWidth: 3.4 }} />
      <text x="276" y="57" fontSize="14" fontWeight="500" fill={C.wasser} textAnchor="end">
        Fehlendes nachfragen
      </text>
      <Frames
        outer={[12, 100, 336, 524, 22]}
        inner={[32, 150, 296, 454, 18]}
        euLabel={[28, 128]}
        keyAt={[62, 182]}
        owner={{ name: [84, 187], sub: [84, 207] }}
      />
      <g style={line}>
        <path d="M180 318 V340" />
        <path d="M180 436 V470" />
        <path d="M228 388 H290 Q300 388 300 378 V72" />
        <path d="M294 79 L300 72 L306 79" />
      </g>
      <g style={{ ...icon, strokeWidth: 2.2 }}>
        <use href="#kis-doc" transform="translate(180 262) scale(.8)" />
        <use href="#kis-folder" transform="translate(180 492) scale(.8)" />
      </g>
      <KiNode x={132} y={340} size={96} />
      <g fontSize="14" fontWeight="500" fill={C.wasser} textAnchor="middle">
        <text x="180" y="308">Unterlagen hochladen</text>
        <text x="180" y="538">Dein Ordner</text>
      </g>
    </svg>
  );
}

export function KiServerRahmen() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
