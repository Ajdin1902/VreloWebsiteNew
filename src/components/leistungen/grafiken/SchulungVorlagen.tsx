import { C, line, shape, detail, Layouts, wideSvg, stackedSvg, type IconStyle } from "./shared";

// KI-Schulung (Claude Design, variant 2a Vorher und nachher): before, loose
// documents lie around in Faden; after, a real task from the team becomes a
// template in the session, the templates are in use the next day and the next
// task comes round. Amber marks the template built in the session.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kks-doc">
          <path d="M-22 -30 H9 L22 -17 V30 H-22 Z" style={shape} />
          <path d="M9 -30 V-17 H22" style={{ fill: "none", stroke: "currentColor" }} />
          <path d="M-12 -4 H12 M-12 6 H12 M-12 16 H3" style={detail} />
        </g>
        <g id="kks-tpl">
          <rect x="-60" y="-40" width="120" height="80" rx="10" style={{ fill: `var(--fill, ${C.gletscher})`, stroke: C.petrol }} />
          <path d="M-44 -14 H-12 M0 -14 H40 M-44 2 H-12 M0 2 H30 M-44 18 H-12 M0 18 H36" style={{ fill: "none", stroke: C.wasser }} />
          <path d="M30 -40 V-22 L36 -27 L42 -22 V-40 Z" style={{ fill: C.wasser, stroke: "none" }} />
        </g>
      </defs>
    </svg>
  );
}

// The text lines on each loose document (the third has none).
const LOOSE_LINES = [
  "M-14 -14 H10 M-14 -4 H14 M-14 6 H6",
  "M-14 -14 H-2 M-14 0 H14 M-14 10 H14 M-14 20 H0",
  "",
  "M-14 -16 H14 M-14 -8 H14 M-14 0 H14 M-14 8 H14 M-14 16 H14",
  "M-14 -14 H4 M-14 14 H14",
  "M-14 -14 H14 M-14 -2 H-4 M2 -2 H14 M-14 10 H8",
];

/** The before half: six documents at odd angles, all in Faden. */
function Loose({ at, strokeWidth }: { at: [number, number, number, number][]; strokeWidth: number }) {
  return (
    <g fill="none" stroke={C.faden} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {at.map(([x, y, rot, s], i) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
          <path d="M-22 -30 H9 L22 -17 V30 H-22 Z" fill={C.papier} />
          <path d="M9 -30 V-17 H22" />
          {LOOSE_LINES[i] ? <path d={LOOSE_LINES[i]} /> : null}
        </g>
      ))}
    </g>
  );
}

const doc: IconStyle = { color: C.petrol, "--detail": C.petrol, strokeLinecap: "round", strokeLinejoin: "round" };
const built: IconStyle = { "--fill": C.amber, strokeLinecap: "round" };
const LABELS = { aufgabe: "Echte Aufgabe", vorlage: "Vorlage gebaut", naechste: "Nächste Aufgabe" };

function Wide() {
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <Loose
        at={[[120, 140, -12, 1.4], [250, 112, 9, 1.25], [390, 150, -5, 1.5], [170, 290, 7, 1.3], [330, 305, -14, 1.2], [480, 268, 11, 1.35]]}
        strokeWidth={1.6}
      />
      <g fontSize="16" fontWeight="600" fill={C.wasser}>
        <text x="40" y="40">Vorher</text>
        <text x="630" y="40">Nachher</text>
      </g>
      <path d="M600 30 V390" stroke={C.faden} strokeWidth="1.5" strokeLinecap="round" />
      <g style={line}>
        <path d="M720 190 H810 M803 184 L810 190 L803 196" />
        <path d="M928 190 H1026 M1019 184 L1026 190 L1019 196" />
        <path d="M1092 190 H1130 Q1150 190 1150 210 V330 Q1150 350 1130 350 H644 Q624 350 624 330 V210 Q624 190 644 190 H662 M655 184 L662 190 L655 196" />
      </g>
      <use href="#kks-doc" transform="translate(690 190) scale(.9)" style={{ ...doc, strokeWidth: 2.1 }} />
      <use href="#kks-tpl" transform="translate(870 190) scale(.85)" style={{ ...built, strokeWidth: 2 }} />
      <g strokeWidth="3.6" strokeLinecap="round">
        {[136, 190, 244].map((y) => (
          <use key={y} href="#kks-tpl" transform={`translate(1060 ${y}) scale(.42)`} />
        ))}
      </g>
      <g fontSize="16" fontWeight="600" fill={C.wasser} textAnchor="middle">
        <text x="690" y="250">{LABELS.aufgabe}</text>
        <text x="870" y="252">{LABELS.vorlage}</text>
        <text x="1060" y="294">Am nächsten Tag</text>
        <text x="1060" y="314">im Einsatz</text>
      </g>
      <text x="890" y="338" fontSize="16" fontWeight="500" fill={C.wasser} textAnchor="middle">
        {LABELS.naechste}
      </text>
    </svg>
  );
}

function Stacked() {
  // Cropped to the content: the last label sits at y 598.
  return (
    <svg viewBox="0 0 360 616" className={stackedSvg} aria-hidden focusable="false">
      <Loose
        at={[[70, 96, -12, 1], [165, 76, 9, 0.95], [270, 104, -6, 1.05], [105, 196, 8, 0.95], [215, 198, -13, 1], [305, 190, 11, 0.9]]}
        strokeWidth={2}
      />
      <g fontSize="16" fontWeight="600" fill={C.wasser}>
        <text x="20" y="30">Vorher</text>
        <text x="20" y="282">Nachher</text>
      </g>
      <path d="M20 254 H340" stroke={C.faden} strokeWidth="1.5" strokeLinecap="round" />
      <g style={line}>
        <path d="M180 392 V412 M174 405 L180 412 L186 405" />
        <path d="M180 508 V530 M174 523 L180 530 L186 523" />
        <path d="M264 556 H316 Q332 556 332 540 V346 Q332 330 316 330 H210 M217 324 L210 330 L217 336" />
      </g>
      <use href="#kks-doc" transform="translate(180 330) scale(.8)" style={{ ...doc, strokeWidth: 2.3 }} />
      <use href="#kks-tpl" transform="translate(180 450) scale(.7)" style={{ ...built, strokeWidth: 2.4 }} />
      <g strokeWidth="3.8" strokeLinecap="round">
        {[120, 180, 240].map((x) => (
          <use key={x} href="#kks-tpl" transform={`translate(${x} 556) scale(.4)`} />
        ))}
      </g>
      <g fontSize="15" fontWeight="600" fill={C.wasser} textAnchor="middle">
        <text x="180" y="384">{LABELS.aufgabe}</text>
        <text x="180" y="500">{LABELS.vorlage}</text>
        <text x="180" y="598">Am nächsten Tag im Einsatz</text>
      </g>
      <text x="324" y="405" fontSize="14" fontWeight="500" fill={C.wasser} textAnchor="end">
        {LABELS.naechste}
      </text>
    </svg>
  );
}

export function SchulungVorlagen() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
