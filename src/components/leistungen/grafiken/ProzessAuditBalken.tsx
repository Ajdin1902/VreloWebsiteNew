import { C, Layouts, wideSvg, stackedSvg } from "./shared";

// Prozess-Audit (Claude Design, variant A Balken mit Zeitleiste): five tasks
// as bars, longest first, no numbers (they would read as a promise); the
// longest is amber, „Hier fangen wir an“. Beside it the audit in three steps,
// the plan only „wenn es sich lohnt“ (funnel rule: never promised to everyone).
const TASKS = ["Anfragen beantworten", "Rechnungen übertragen", "Termine abstimmen", "Angebote schreiben", "Nachfassen"];
const STEPS = ["30 Minuten Gespräch", "Genauer Blick", "Fahrplan, wenn es sich lohnt"];
const START = "Hier fangen wir an";

/** Small petrol axis arrow with the words wenig, Zeitaufwand, viel. */
function Axis({ x0, x1, y, labelY, vertical }: { x0: number; x1: number; y: number; labelY: number; vertical?: [number, number] }) {
  return (
    <>
      <g fill="none" stroke={C.petrol} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={vertical ? `M${x0} ${vertical[0]} V${y} H${x1}` : `M${x0} ${y} H${x1}`} />
        <path d={`M${x1 - 7} ${y - 6} L${x1} ${y} L${x1 - 7} ${y + 6}`} />
      </g>
      <g fontSize="14" fontWeight="500" fill={C.stumm}>
        <text x={x0} y={labelY}>wenig</text>
        <text x={(x0 + x1) / 2} y={labelY} textAnchor="middle">Zeitaufwand</text>
        <text x={x1} y={labelY} textAnchor="end">viel</text>
      </g>
    </>
  );
}

/** The audit as three dots on a short vertical line. */
function Steps({ x, ys, labelX, size }: { x: number; ys: number[]; labelX: number; size: number }) {
  return (
    <>
      <path d={`M${x} ${ys[0]} V${ys[ys.length - 1]}`} stroke={C.petrol} strokeWidth="1.75" strokeLinecap="round" />
      {ys.map((y) => (
        <circle key={y} cx={x} cy={y} r="6" fill={C.papier} stroke={C.petrol} strokeWidth="1.75" />
      ))}
      <g fontSize={size} fontWeight="500" fill={C.stumm}>
        {STEPS.map((s, i) => (
          <text key={s} x={labelX} y={ys[i] + 5}>
            {s}
          </text>
        ))}
      </g>
    </>
  );
}

function Wide() {
  const widths = [440, 344, 275, 206, 138];
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <g fontSize="16" fontWeight="500" fill={C.wasser} textAnchor="end">
        {TASKS.map((t, i) => (
          <text key={t} x="240" y={85 + i * 50}>
            {t}
          </text>
        ))}
      </g>
      {widths.map((w, i) => (
        <rect key={TASKS[i]} x="260" y={66 + i * 50} width={w} height="28" rx="8" fill={i === 0 ? C.amber : C.faden} />
      ))}
      <text x="716" y="86" fontSize="17" fontWeight="600" fill={C.wasser}>
        {START}
      </text>
      <Axis x0={260} x1={716} y={318} labelY={344} vertical={[48, 318]} />
      <path d="M900 60 V340" stroke={C.faden} strokeWidth="1.5" strokeLinecap="round" />
      <Steps x={944} ys={[120, 200, 280]} labelX={964} size={16} />
    </svg>
  );
}

function Stacked() {
  const bars: [number, number, number][] = [
    [60, 312, 32], [132, 244, 24], [194, 196, 24], [256, 148, 24], [318, 100, 24],
  ];
  const labelY = [50, 122, 184, 246, 308];
  return (
    <svg viewBox="0 0 360 640" className={stackedSvg} aria-hidden focusable="false">
      <g fontSize="15" fontWeight="500" fill={C.wasser}>
        {TASKS.map((t, i) => (
          <text key={t} x="24" y={labelY[i]}>
            {t}
          </text>
        ))}
      </g>
      {bars.map(([y, w, h], i) => (
        <rect key={TASKS[i]} x="24" y={y} width={w} height={h} rx={h > 28 ? 8 : 7} fill={i === 0 ? C.amber : C.faden} />
      ))}
      <text x="38" y="81" fontSize="14" fontWeight="600" fill={C.wasser}>
        {START}
      </text>
      <Axis x0={24} x1={336} y={356} labelY={380} />
      <path d="M24 430 H336" stroke={C.faden} strokeWidth="1.5" strokeLinecap="round" />
      <Steps x={40} ys={[474, 529, 584]} labelX={64} size={15} />
    </svg>
  );
}

export function ProzessAuditBalken() {
  return <Layouts wide={<Wide />} stacked={<Stacked />} />;
}
