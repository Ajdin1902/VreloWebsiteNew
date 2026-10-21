import { C, Approve, Layouts, wideSvg, stackedSvg } from "./shared";

// Betreuung (Claude Design, variant A Eine Zeitlinie): the system runs through
// the night, a connection breaks, the alarm reaches me (not the customer), it
// is fixed and the stuck items run again before the working day starts. The
// line is a quiet water level, not a pulse. Amber marks the fixed point.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kbt-bell">
          <path d="M-14 8 V-2 A14 14 0 0 1 14 -2 V8 L18 13 H-18 Z" style={{ fill: C.papier, stroke: "currentColor" }} />
          <path d="M-5 17 A5 5 0 0 0 5 17 M0 -16 V-19" style={{ fill: "none", stroke: "currentColor" }} />
        </g>
      </defs>
    </svg>
  );
}

const bell = { color: C.petrol, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const level = { fill: "none", stroke: C.petrol, strokeWidth: 2.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const gap = { fill: "none", stroke: C.faden, strokeWidth: 2.5, strokeLinecap: "round", strokeDasharray: "2 8" } as const;

const LABELS = {
  laeuft: "Läuft",
  bruch: "Verbindung bricht ab",
  alarm: "Alarm kommt bei mir an",
  behoben: "Behoben, Vorgänge laufen nach",
  start: "Arbeitsbeginn",
};

function Wide() {
  // Cropped to the content: a flat timeline needs no 420px of height.
  return (
    <svg viewBox="0 64 1200 264" className={wideSvg} aria-hidden focusable="false">
      <path d="M80 190 H420 C470 190 480 260 520 260" style={level} />
      <path d="M528 260 H592" style={gap} />
      <path d="M600 260 C640 260 650 190 700 190 H1120" style={level} />
      <path d="M590 158 V244" fill="none" stroke={C.faden} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 5" />
      <path d="M1120 172 V208" stroke={C.petrol} strokeWidth="2" strokeLinecap="round" />
      <use href="#kbt-bell" transform="translate(590 134)" style={bell} />
      <Approve cx={700} cy={190} r={13} checkWidth={2.25} />
      <g fontSize="17" fontWeight="500" fill={C.wasser}>
        <text x="200" y="170" textAnchor="middle">{LABELS.laeuft}</text>
        <text x="560" y="297" textAnchor="middle">{LABELS.bruch}</text>
        <text x="590" y="98" textAnchor="middle">{LABELS.alarm}</text>
        <text x="724" y="227">{LABELS.behoben}</text>
        <text x="1120" y="160" textAnchor="middle">{LABELS.start}</text>
      </g>
    </svg>
  );
}

function Stacked() {
  return (
    <svg viewBox="0 0 360 640" className={stackedSvg} aria-hidden focusable="false">
      <path d="M60 60 V250 C60 280 120 270 120 300" style={level} />
      <path d="M120 308 V332" style={gap} />
      <path d="M120 340 C120 370 60 380 60 410 V590" style={level} />
      <path d="M44 590 H76" stroke={C.petrol} strokeWidth="2" strokeLinecap="round" />
      <use href="#kbt-bell" transform="translate(170 368)" style={bell} />
      <Approve cx={60} cy={420} r={13} checkWidth={2.25} />
      <g fontSize="15" fontWeight="500" fill={C.wasser}>
        <text x="80" y="150">{LABELS.laeuft}</text>
        <text x="140" y="324">{LABELS.bruch}</text>
        <text x="196" y="373">Alarm kommt</text>
        <text x="196" y="391">bei mir an</text>
        <text x="88" y="425">{LABELS.behoben}</text>
        <text x="90" y="595">{LABELS.start}</text>
      </g>
    </svg>
  );
}

export function BetreuungZeitlinie() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
