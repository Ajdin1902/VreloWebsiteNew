import { C, line, shape, detail, Approve, Layouts, wideSvg, stackedSvg, type IconStyle } from "./shared";

// Prozessautomatisierung (Claude Design, variant A Fließband): the same form
// arrives every time, one fixed rule runs the same three actions, a timer
// catches what stays lying around. The counterpart to the KI graphic: here the
// inputs are tidy and identical from the start.
function IconDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden focusable="false">
      <defs>
        <g id="kip-form">
          <rect x="-24" y="-20" width="48" height="40" rx="6" style={{ fill: `var(--fill, ${C.gletscher})`, stroke: "currentColor" }} />
          <rect x="-16" y="-12" width="32" height="7" rx="2" style={{ fill: C.papier, stroke: `var(--detail, ${C.petrol})` }} />
          <rect x="-16" y="-1" width="32" height="7" rx="2" style={{ fill: C.papier, stroke: `var(--detail, ${C.petrol})` }} />
          <rect x="2" y="10" width="14" height="5" rx="2.5" style={{ fill: `var(--detail, ${C.petrol})`, stroke: `var(--detail, ${C.petrol})` }} />
        </g>
        <g id="kip-env">
          <rect x="-32" y="-22" width="64" height="44" rx="7" style={shape} />
          <path d="M-26 -15 L0 4 L26 -15" style={detail} />
        </g>
        <g id="kip-crm">
          <path d="M-20 -13 V13 A20 6 0 0 0 20 13 V-13" style={shape} />
          <ellipse cx="0" cy="-13" rx="20" ry="6" style={shape} />
          <path d="M-20 0 A20 6 0 0 0 20 0" style={detail} />
        </g>
        <g id="kip-bell">
          <path d="M-14 8 V-2 A14 14 0 0 1 14 -2 V8 L18 13 H-18 Z" style={shape} />
          <path d="M-5 17 A5 5 0 0 0 5 17 M0 -16 V-19" style={detail} />
        </g>
        <g id="kip-clock">
          <circle cx="0" cy="0" r="17" style={shape} />
          <path d="M0 -10 V0 L7 5" style={detail} />
        </g>
      </defs>
    </svg>
  );
}

const petrolIcon: IconStyle = { color: C.petrol, "--detail": C.petrol, strokeLinecap: "round", strokeLinejoin: "round" };
const cardIcon: IconStyle = { ...petrolIcon, "--fill": C.gletscher };

/** The rule node: the dark square with „Wenn“, an arrow and „dann“. */
function RuleNode({ x, y, size, fontSize }: { x: number; y: number; size: number; fontSize: number }) {
  const cx = x + size / 2;
  const top = y + size * 0.35;
  const bottom = y + size * 0.79;
  const a0 = y + size * 0.43;
  const a1 = y + size * 0.6;
  return (
    <>
      <rect x={x} y={y} width={size} height={size} rx={size * 0.23} fill={C.wasser} />
      <g fontSize={fontSize} fontWeight="600" fill={C.gletscher} textAnchor="middle">
        <text x={cx} y={top}>Wenn</text>
        <text x={cx} y={bottom}>dann</text>
      </g>
      <path
        d={`M${cx} ${a0} V${a1} M${cx - 5} ${a1 - 5} L${cx} ${a1} L${cx + 5} ${a1 - 5}`}
        fill="none"
        stroke={C.gletscher}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

const ACTIONS: [string, string][] = [
  ["Kontakt", "angelegt"],
  ["Eingang", "bestätigt"],
  ["Zuständiger", "informiert"],
];
const ERINNERUNG = "Nach 2 Tagen: Erinnerung";

function Wide() {
  const cards = [510, 730, 950];
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <g fontSize="20" fontWeight="600" fill={C.wasser} textAnchor="middle">
        <text x="140" y="48">Anfrage kommt rein</text>
        <text x="380" y="48">Feste Regel</text>
        <text x="820" y="48">Läuft von allein</text>
      </g>
      <g style={line}>
        <path d="M167 130 C240 130 260 196 332 196" />
        <path d="M167 210 H332" />
        <path d="M167 290 C240 290 260 224 332 224" />
        <path d="M428 210 H950" />
        <path d="M820 248 V313" />
      </g>
      <g style={{ ...petrolIcon, strokeWidth: 1.8 }}>
        {[130, 210, 290].map((y) => (
          <use key={y} href="#kip-form" transform={`translate(140 ${y}) scale(1.1)`} />
        ))}
      </g>
      <RuleNode x={332} y={162} size={96} fontSize={15} />
      {cards.map((x) => (
        <rect key={x} x={x} y="172" width="180" height="76" rx="12" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g style={cardIcon}>
        <use href="#kip-crm" transform="translate(540 210) scale(.55)" style={{ strokeWidth: 3.2 }} />
        <use href="#kip-env" transform="translate(760 210) scale(.42)" style={{ strokeWidth: 4 }} />
        <use href="#kip-bell" transform="translate(980 208) scale(.62)" style={{ strokeWidth: 2.8 }} />
      </g>
      <g fontSize="16" fontWeight="500" fill={C.wasser}>
        {ACTIONS.map(([a, b], i) => (
          <text key={a} x={cards[i] + 56}>
            <tspan x={cards[i] + 56} y="205">{a}</tspan>
            <tspan x={cards[i] + 56} y="226">{b}</tspan>
          </text>
        ))}
      </g>
      {/* On the card's corner as a badge: inside the card it would touch the larger label. */}
      <Approve cx={1126} cy={176} r={13} checkWidth={2.25} />
      <use href="#kip-clock" transform="translate(820 330)" style={{ ...petrolIcon, strokeWidth: 1.75 }} />
      <text x="848" y="335" fontSize="16" fontWeight="500" fill={C.stumm}>
        {ERINNERUNG}
      </text>
    </svg>
  );
}

function Stacked() {
  const cards = [280, 352, 424];
  const icons: [string, number, number, number][] = [
    ["#kip-crm", 308, 0.5, 3.4],
    ["#kip-env", 380, 0.4, 4.2],
    ["#kip-bell", 450, 0.58, 3],
  ];
  return (
    <svg viewBox="0 0 360 640" className={stackedSvg} aria-hidden focusable="false">
      <text x="180" y="34" fontSize="16" fontWeight="600" fill={C.wasser} textAnchor="middle">
        Anfrage kommt rein
      </text>
      <g fontSize="16" fontWeight="600" fill={C.wasser}>
        <text x="232" y="191">Feste Regel</text>
        <text x="196" y="264">Läuft von allein</text>
      </g>
      <g style={line}>
        <path d="M100 100 C100 126 166 124 166 150" />
        <path d="M180 100 V150" />
        <path d="M260 100 C260 126 194 124 194 150" />
        <path d="M180 222 V280" />
        <path d="M180 336 V352" />
        <path d="M180 408 V424" />
        <path d="M180 480 V516" />
      </g>
      <g style={{ ...petrolIcon, strokeWidth: 2.2 }}>
        {[100, 180, 260].map((x) => (
          <use key={x} href="#kip-form" transform={`translate(${x} 80) scale(.85)`} />
        ))}
      </g>
      <RuleNode x={144} y={150} size={72} fontSize={14} />
      {cards.map((y) => (
        <rect key={y} x="60" y={y} width="240" height="56" rx="12" fill={C.gletscher} stroke={C.petrol} strokeWidth="1.5" />
      ))}
      <g style={cardIcon}>
        {icons.map(([href, y, s, w]) => (
          <use key={href} href={href} transform={`translate(86 ${y}) scale(${s})`} style={{ strokeWidth: w }} />
        ))}
      </g>
      <g fontSize="14" fontWeight="500" fill={C.wasser}>
        {ACTIONS.map(([a, b], i) => (
          <text key={a} x="110" y={cards[i] + 33}>
            {a} {b}
          </text>
        ))}
      </g>
      <Approve cx={284} cy={452} r={11} checkWidth={2.25} />
      <use href="#kip-clock" transform="translate(180 533)" style={{ ...petrolIcon, strokeWidth: 1.75 }} />
      <text x="180" y="578" fontSize="14" fontWeight="500" fill={C.stumm} textAnchor="middle">
        {ERINNERUNG}
      </text>
    </svg>
  );
}

export function ProzessFliessband() {
  return (
    <>
      <IconDefs />
      <Layouts wide={<Wide />} stacked={<Stacked />} />
    </>
  );
}
