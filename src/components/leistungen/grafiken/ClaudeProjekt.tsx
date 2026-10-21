import { C, line, shape, detail, tidy, Layouts, wideSvg, stackedSvg } from "./shared";

// Claude für Unternehmen (Claude Design, variant A Wissen rein, gleicher Ton
// raus): four knowledge cards feed one shared project, three outputs come out
// in the same style. Product neutral by brief: no Claude logo, no chat bubbles.
// Amber marks the one thing the outputs share, „in eurem Ton“.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kcl-doc">
          <path d="M-22 -30 H9 L22 -17 V30 H-22 Z" style={shape} />
          <path d="M9 -30 V-17 H22" style={{ fill: "none", stroke: "currentColor" }} />
          <path d="M-12 -4 H12 M-12 6 H12 M-12 16 H3" style={detail} />
        </g>
      </defs>
    </svg>
  );
}

const WISSEN = ["Leistungen", "Preise", "Vorlagen", "Regeln für Daten"];
const ERGEBNIS = ["Angebot", "E-Mail", "Zusammenfassung"];
const TON = "in eurem Ton";

/** The shared project: the dark node of the series with its name inside. */
function ProjektNode({ x, y, size, lines }: { x: number; y: number; size: number; lines: string[] }) {
  const cx = x + size / 2;
  const first = y + size / 2 + 5 - (lines.length - 1) * 9;
  return (
    <>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.22} fill={C.wasser} />
      <g fontSize={lines.length > 1 ? 14 : 15} fontWeight="600" fill={C.gletscher} textAnchor="middle">
        {lines.map((l, i) => (
          <text key={l} x={cx} y={first + i * 18}>
            {l}
          </text>
        ))}
      </g>
    </>
  );
}

/** The amber pill the three outputs share. */
function Ton({ cx, y }: { cx: number; y: number }) {
  return (
    <>
      <rect x={cx - 62} y={y} width="124" height="32" rx="16" fill={C.amber} />
      <text x={cx} y={y + 21} fontSize="15" fontWeight="600" fill={C.wasser} textAnchor="middle">
        {TON}
      </text>
    </>
  );
}

function Wide() {
  const inY = [98, 158, 218, 278];
  // Outputs 20 wider than the sketch: the longest label touched the card edge.
  const outY = [102, 182, 262];
  // Cropped to the content: the cards span y 98 to 322.
  return (
    <svg viewBox="0 60 1200 300" className={wideSvg} aria-hidden focusable="false">
      <g style={line}>
        <path d="M300 120 C420 120 430 180 520 180" />
        <path d="M300 180 C420 180 430 200 520 200" />
        <path d="M300 240 C420 240 430 220 520 220" />
        <path d="M300 300 C420 300 430 240 520 240" />
        <path d="M640 190 C710 190 710 130 780 130" />
        <path d="M640 210 H780" />
        <path d="M640 230 C710 230 710 290 780 290" />
        <path d="M1020 102 Q1032 102 1032 114 V198 Q1032 210 1044 210 Q1032 210 1032 222 V306 Q1032 318 1020 318" />
      </g>
      {inY.map((y) => (
        <rect key={y} x="100" y={y} width="200" height="44" rx="10" fill={C.papier} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g fontSize="16" fontWeight="500" fill={C.wasser}>
        {WISSEN.map((w, i) => (
          <text key={w} x="120" y={inY[i] + 28}>
            {w}
          </text>
        ))}
      </g>
      <ProjektNode x={520} y={150} size={120} lines={["Euer Projekt"]} />
      {outY.map((y) => (
        <rect key={y} x="780" y={y} width="220" height="56" rx="12" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g style={{ ...tidy, strokeWidth: 4 }}>
        {outY.map((y) => (
          <use key={y} href="#kcl-doc" transform={`translate(806 ${y + 28}) scale(.42)`} />
        ))}
      </g>
      <g fontSize="16" fontWeight="500" fill={C.wasser}>
        {ERGEBNIS.map((e, i) => (
          <text key={e} x="830" y={outY[i] + 33}>
            {e}
          </text>
        ))}
      </g>
      <Ton cx={1112} y={194} />
    </svg>
  );
}

function Stacked() {
  const inPos: [number, number][] = [[20, 30], [188, 30], [20, 88], [188, 88]];
  const outY = [320, 386, 452];
  return (
    <svg viewBox="0 0 360 610" className={stackedSvg} aria-hidden focusable="false">
      <g style={line}>
        <path d="M96 132 C96 156 166 150 166 170" />
        <path d="M264 132 C264 156 194 150 194 170" />
        <path d="M180 270 V320" />
        <path d="M180 372 V386" />
        <path d="M180 438 V452" />
        <path d="M40 516 Q40 528 52 528 H168 Q180 528 180 540 Q180 528 192 528 H308 Q320 528 320 516" />
      </g>
      {inPos.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="152" height="44" rx="10" fill={C.papier} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g fontSize="15" fontWeight="500" fill={C.wasser}>
        {WISSEN.map((w, i) => (
          <text key={w} x={inPos[i][0] + 16} y={inPos[i][1] + 27}>
            {w}
          </text>
        ))}
      </g>
      <ProjektNode x={130} y={170} size={100} lines={["Euer", "Projekt"]} />
      {outY.map((y) => (
        <rect key={y} x="40" y={y} width="280" height="52" rx="12" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g style={{ ...tidy, strokeWidth: 4 }}>
        {outY.map((y) => (
          <use key={y} href="#kcl-doc" transform={`translate(66 ${y + 26}) scale(.4)`} />
        ))}
      </g>
      <g fontSize="15" fontWeight="500" fill={C.wasser}>
        {ERGEBNIS.map((e, i) => (
          <text key={e} x="90" y={outY[i] + 31}>
            {e}
          </text>
        ))}
      </g>
      <Ton cx={180} y={552} />
    </svg>
  );
}

export function ClaudeProjekt() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
