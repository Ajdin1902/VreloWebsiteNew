import { C, line, messy, tidy, shape, detail, SystemNode, Pill, Layouts, wideSvg, stackedSvg } from "./shared";

// KI-Betriebssystem (Claude Design, variant A Zuflüsse ins Becken): five
// inputs flow with their source into one place; automations, deadlines and
// the assistant draw from it. Amber marks the one place.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kib-inbox">
          <path d="M-24 2 L-16 -16 H16 L24 2 V16 Q24 20 20 20 H-20 Q-24 20 -24 16 Z" style={shape} />
          <path d="M-24 2 H-10 L-6 9 H6 L10 2 H24" style={detail} />
        </g>
        <g id="kib-chat">
          <path d="M-18 -18 H18 Q26 -18 26 -10 V6 Q26 14 18 14 H-4 L-14 22 V14 H-18 Q-26 14 -26 6 V-10 Q-26 -18 -18 -18 Z" style={shape} />
          <path d="M-15 -6 H15 M-15 3 H5" style={detail} />
        </g>
        <g id="kib-crm">
          <path d="M-20 -13 V13 A20 6 0 0 0 20 13 V-13" style={shape} />
          <ellipse cx="0" cy="-13" rx="20" ry="6" style={shape} />
          <path d="M-20 0 A20 6 0 0 0 20 0" style={detail} />
        </g>
        <g id="kib-form">
          <rect x="-24" y="-20" width="48" height="40" rx="6" style={shape} />
          <rect x="-16" y="-12" width="32" height="7" rx="2" style={detail} />
          <rect x="-16" y="-1" width="32" height="7" rx="2" style={detail} />
          <rect x="2" y="10" width="14" height="5" rx="2.5" style={{ fill: `var(--detail, ${C.petrol})`, stroke: `var(--detail, ${C.petrol})` }} />
        </g>
        <g id="kib-cal">
          <rect x="-21" y="-17" width="42" height="38" rx="6" style={shape} />
          <path d="M-21 -6 H21 M-10 -23 V-12 M10 -23 V-12 M-10 5 H-4 M2 5 H8 M-10 13 H-4" style={detail} />
        </g>
        <g id="kib-list">
          <rect x="-19" y="-21" width="38" height="42" rx="6" style={{ fill: `var(--fill, ${C.gletscher})`, stroke: "currentColor" }} />
          <path d="M-11 -9 L-8 -6 L-3 -11 M3 -8 H11 M-11 5 L-8 8 L-3 3 M3 6 H11" style={detail} />
        </g>
      </defs>
    </svg>
  );
}

const INPUTS = ["Postfach", "Chat", "CRM", "Formular", "Termin"];
const ICONS = ["#kib-inbox", "#kib-chat", "#kib-crm", "#kib-form", "#kib-cal"];

/** The one place: a glacier basin with an amber rim and three tidy records. */
function Basin({ x, y, w, h, rx, rowX, rowW, rowH, rows }: {
  x: number; y: number; w: number; h: number; rx: number; rowX: number; rowW: number; rowH: number; rows: number[];
}) {
  const split = rowX + rowW * 0.4;
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={C.gletscher} stroke={C.amber} strokeWidth="2.5" />
      {rows.map((ry) => (
        <rect key={ry} x={rowX} y={ry} width={rowW} height={rowH} rx={rowH * 0.28} fill={C.papier} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <path
        d={rows.map((ry) => {
          const cy = ry + rowH / 2;
          return `M${rowX + 14} ${cy} H${split - 4} M${split + 6} ${cy} H${rowX + rowW - 14}`;
        }).join(" ")}
        stroke={C.petrol}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
}

/** The assistant: a question chip and an answer card from the same place. */
function Assistant({ x, y, w, qh, ah, gap, size }: { x: number; y: number; w: number; qh: number; ah: number; gap: number; size: number }) {
  const ay = y + qh + gap;
  return (
    <>
      <Pill x={x} y={y} w={w} h={qh} text="Was ist bei Huber offen?" size={size} color={C.wasser} />
      <rect x={x} y={ay} width={w} height={ah} rx="10" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      <path
        d={`M${x + 16} ${ay + ah * 0.36} H${x + w - 46} M${x + 16} ${ay + ah * 0.68} H${x + w - 86}`}
        stroke={C.petrol}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  );
}

function Wide() {
  const icons = [
    [210, 96, -6], [240, 153, 4], [205, 210, -3], [235, 267, 6], [210, 324, -4],
  ];
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <g fontSize="20" fontWeight="600" fill={C.wasser} textAnchor="middle">
        <text x="170" y="44">Kommt überall an</text>
        <text x="566" y="44">Eine Stelle</text>
        <text x="860" y="44">Alles baut darauf auf</text>
      </g>
      <g style={line}>
        <path d="M238 96 C300 96 310 210 360 210" />
        <path d="M268 153 C320 153 320 210 360 210" />
        <path d="M233 210 H360" />
        <path d="M263 267 C320 267 320 210 360 210" />
        <path d="M238 324 C300 324 310 210 360 210" />
        <path d="M360 210 H476" />
        <path d="M656 160 C690 160 690 110 718 110" />
        <path d="M656 210 H722" />
        <path d="M656 260 C690 260 690 340 722 340" />
      </g>
      <g style={{ ...messy, strokeWidth: 2 }}>
        {icons.map(([x, y, r], i) => (
          <use key={ICONS[i]} href={ICONS[i]} transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </g>
      <g fontSize="16" fontWeight="500" fill={C.stumm} textAnchor="end">
        {icons.map(([x, y], i) => (
          <text key={INPUTS[i]} x={x - 36} y={y + 5}>
            {INPUTS[i]}
          </text>
        ))}
      </g>
      <Pill x={372} y={198} w={92} h={24} text="mit Quelle" />
      <Basin x={476} y={120} w={180} h={180} rx={28} rowX={504} rowW={124} rowH={30} rows={[144, 195, 246]} />
      <SystemNode x={718} y={88} size={44} lineWidth={2} />
      <use href="#kib-list" transform="translate(742 210)" style={{ ...tidy, strokeWidth: 2 }} />
      <Assistant x={722} y={276} w={224} qh={32} ah={44} gap={10} size={15} />
      <g fontSize="17" fontWeight="500" fill={C.wasser}>
        <text x="784" y="116">Automatisierung</text>
        <text x="784" y="216">Fristen und Aufgaben</text>
        <text x="966" y="346">Assistent</text>
      </g>
    </svg>
  );
}

function Stacked() {
  const icons = [
    [40, 84, -6], [110, 76, 4], [180, 86, -3], [250, 78, 6], [320, 84, -4],
  ];
  return (
    <svg viewBox="0 0 360 640" className={stackedSvg} aria-hidden focusable="false">
      <text x="180" y="30" fontSize="16" fontWeight="600" fill={C.wasser} textAnchor="middle">
        Kommt überall an
      </text>
      <g fontSize="16" fontWeight="600" fill={C.wasser}>
        <text x="246" y="297">Eine Stelle</text>
        <text x="70" y="392">Alles baut darauf auf</text>
      </g>
      <g style={line}>
        <path d="M40 134 C40 160 180 150 180 176" />
        <path d="M110 134 C110 160 180 156 180 176" />
        <path d="M180 134 V232" />
        <path d="M250 134 C250 160 180 156 180 176" />
        <path d="M320 134 C320 160 180 150 180 176" />
        <path d="M100 352 V362 Q100 372 90 372 H50 Q40 372 40 382 V412" />
        <path d="M40 448 V464" />
        <path d="M40 498 V584 Q40 594 50 594 H70" />
      </g>
      <g style={{ ...messy, strokeWidth: 2.5 }}>
        {icons.map(([x, y, r], i) => (
          <use key={ICONS[i]} href={ICONS[i]} transform={`translate(${x} ${y}) rotate(${r}) scale(.8)`} />
        ))}
      </g>
      <g fontSize="14" fontWeight="500" fill={C.stumm} textAnchor="middle">
        {icons.map(([x], i) => (
          <text key={INPUTS[i]} x={x} y="124">
            {INPUTS[i]}
          </text>
        ))}
      </g>
      <Pill x={136} y={191} w={88} h={24} text="mit Quelle" />
      <Basin x={70} y={232} w={160} h={120} rx={24} rowX={88} rowW={124} rowH={24} rows={[248, 280, 312]} />
      <SystemNode x={22} y={412} size={36} lineWidth={2} />
      <use href="#kib-list" transform="translate(40 481) scale(.8)" style={{ ...tidy, strokeWidth: 2.5 }} />
      <g fontSize="15" fontWeight="500" fill={C.wasser}>
        <text x="70" y="435">Automatisierung</text>
        <text x="70" y="486">Fristen und Aufgaben</text>
        <text x="70" y="526">Assistent</text>
      </g>
      <Assistant x={70} y={538} w={220} qh={28} ah={36} gap={10} size={14} />
    </svg>
  );
}

export function BetriebssystemBecken() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
