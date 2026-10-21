import { C, line, messy, tidy, shape, detail, SystemNode, Approve, Layouts, wideSvg, stackedSvg } from "./shared";

// KI-Automatisierung (Claude Design, variant A Fluss): three inputs in different
// shapes flow into the KI and leave as identical cards, then you approve.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kif-env">
          <rect x="-32" y="-22" width="64" height="44" rx="7" style={shape} />
          <path d="M-26 -15 L0 4 L26 -15" style={detail} />
        </g>
        <g id="kif-doc">
          <path d="M-22 -30 H9 L22 -17 V30 H-22 Z" style={shape} />
          <path d="M9 -30 V-17 H22" style={{ fill: "none", stroke: "currentColor" }} />
          <path d="M-12 -4 H12 M-12 6 H12 M-12 16 H3" style={detail} />
        </g>
        <g id="kif-voice">
          <path
            d="M-20 -20 H20 A12 12 0 0 1 32 -8 V8 A12 12 0 0 1 20 20 H-6 L-20 31 L-17 20 H-20 A12 12 0 0 1 -32 8 V-8 A12 12 0 0 1 -20 -20 Z"
            style={shape}
          />
          <path d="M-18 -3 V3 M-12 -8 V8 M-6 -12 V12 M0 -6 V6 M6 -10 V10 M12 -6 V6 M18 -2 V2" style={detail} />
        </g>
      </defs>
    </svg>
  );
}

const FIELDS = [
  ["Absender", "Anliegen", "Datum"],
  ["Lieferant", "Betrag", "Datum"],
  ["Kunde", "Anliegen", "Datum"],
];

function Wide() {
  const rows = [122, 210, 298];
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <g fontSize="20" fontWeight="600" fill={C.wasser} textAnchor="middle">
        <text x="150" y="48">Kommt rein</text>
        <text x="640" y="48">KI liest und sortiert</text>
        <text x="1030" y="48">Du gibst frei</text>
      </g>
      <g style={line}>
        <path d="M180 126 C300 126 330 196 430 196" />
        <path d="M208 232 C300 232 340 210 430 210" />
        <path d="M168 330 C300 330 330 224 430 224" />
        <path d="M526 196 H560 Q572 196 572 184 V134 Q572 122 584 122 H620" />
        <path d="M526 210 H620" />
        <path d="M526 224 H560 Q572 224 572 236 V286 Q572 298 584 298 H620" />
        <path d="M850 122 H950 Q962 122 962 134 V198 Q962 210 974 210 H1000" />
        <path d="M850 210 H1000" />
        <path d="M850 298 H950 Q962 298 962 286 V222 Q962 210 974 210 H1000" />
        <path d="M1060 210 H1150" />
      </g>
      <g style={{ ...messy, strokeWidth: 2 }}>
        <use href="#kif-env" transform="translate(140 128) rotate(-7)" />
        <use href="#kif-doc" transform="translate(178 232) rotate(5)" />
        <use href="#kif-voice" transform="translate(128 328) rotate(-4)" />
      </g>
      <g fontSize="16" fontWeight="500" fill={C.stumm} textAnchor="middle">
        <text x="140" y="182">E-Mail</text>
        <text x="178" y="292">Rechnung.pdf</text>
        <text x="128" y="394">Sprachnachricht</text>
      </g>
      <SystemNode x={430} y={162} size={96} />
      {rows.map((cy) => (
        <rect key={cy} x="620" y={cy - 36} width="230" height="72" rx="12" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g style={{ ...tidy, strokeWidth: 3.8 }}>
        <use href="#kif-env" transform="translate(652 122) scale(.42)" />
        <use href="#kif-doc" transform="translate(652 210) scale(.42)" />
        <use href="#kif-voice" transform="translate(652 298) scale(.42)" />
      </g>
      <g fontSize="15" fontWeight="500" fill={C.stumm}>
        {FIELDS.map((f, i) =>
          f.map((label, j) => (
            <text key={`${i}-${j}`} x="684" y={rows[i] - 13 + j * 18}>
              {label}
            </text>
          )),
        )}
      </g>
      <path
        d={rows.map((cy) => [0, 1, 2].map((j) => `M772 ${cy - 17 + j * 18} H826`).join(" ")).join(" ")}
        stroke={C.petrol}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Approve cx={1030} cy={210} r={30} />
    </svg>
  );
}

function Stacked() {
  const cols = [64, 180, 296];
  return (
    <svg viewBox="0 0 360 640" className={stackedSvg} aria-hidden focusable="false">
      <text x="180" y="32" fontSize="16" fontWeight="600" fill={C.wasser} textAnchor="middle">
        Kommt rein
      </text>
      <g fontSize="16" fontWeight="600" fill={C.wasser}>
        <text x="232" y="219">KI liest</text>
        <text x="232" y="239">und sortiert</text>
        <text x="220" y="546">Du gibst frei</text>
      </g>
      <g style={line}>
        <path d="M64 148 C64 176 166 168 166 188" />
        <path d="M180 148 V188" />
        <path d="M296 148 C296 176 194 168 194 188" />
        <path d="M166 260 V270 Q166 280 156 280 H74 Q64 280 64 290 V310" />
        <path d="M180 260 V310" />
        <path d="M194 260 V270 Q194 280 204 280 H286 Q296 280 296 290 V310" />
        <path d="M64 444 V466 Q64 476 74 476 H170 Q180 476 180 486 V514" />
        <path d="M180 444 V514" />
        <path d="M296 444 V466 Q296 476 286 476 H190 Q180 476 180 486 V514" />
        <path d="M180 566 V616" />
      </g>
      <g style={{ ...messy, strokeWidth: 2.5 }}>
        <use href="#kif-env" transform="translate(64 84) rotate(-7) scale(.8)" />
        <use href="#kif-doc" transform="translate(180 86) rotate(5) scale(.8)" />
        <use href="#kif-voice" transform="translate(296 80) rotate(-4) scale(.8)" />
      </g>
      <g fontSize="14" fontWeight="500" fill={C.stumm} textAnchor="middle">
        <text x="64" y="136">E-Mail</text>
        <text x="180" y="136">Rechnung.pdf</text>
        <text x="296" y="136">Sprachnachricht</text>
      </g>
      <SystemNode x={144} y={188} size={72} />
      {cols.map((cx) => (
        <rect key={cx} x={cx - 52} y="310" width="104" height="134" rx="12" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g style={{ ...tidy, strokeWidth: 4 }}>
        <use href="#kif-env" transform="translate(36 336) scale(.4)" />
        <use href="#kif-doc" transform="translate(152 336) scale(.4)" />
        <use href="#kif-voice" transform="translate(268 336) scale(.4)" />
      </g>
      <g fontSize="14" fontWeight="500" fill={C.stumm}>
        {FIELDS.map((f, i) =>
          f.map((label, j) => (
            <text key={`${i}-${j}`} x={cols[i] - 40} y={372 + j * 26}>
              {label}
            </text>
          )),
        )}
      </g>
      <path
        d={cols.map((cx) => [0, 1, 2].map((j) => `M${cx - 40} ${380 + j * 26} H${cx + 32}`).join(" ")).join(" ")}
        stroke={C.petrol}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Approve cx={180} cy={540} r={26} />
    </svg>
  );
}

export function KiFluss() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
