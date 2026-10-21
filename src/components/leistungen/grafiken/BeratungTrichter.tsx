import { C, line, Layouts, wideSvg, stackedSvg } from "./shared";

// KI-Beratung (Claude Design, variant B Trichter): many KI ideas go into a
// funnel, the question „Lohnt es sich?“ narrows them, two fall out on the way
// (saying no is part of the advice). What comes out is one first step, with
// „Danach“ and „Später“ waiting behind it. Amber marks the first step only.
type Idea = { text: string; cx: number; cy: number; w: number; rot: number };

/** An idea card, rotated around its centre. Dropped ideas are dashed and muted. */
function IdeaCard({ idea, h, size, dropped }: { idea: Idea; h: number; size: number; dropped?: boolean }) {
  const { text, cx, cy, w, rot } = idea;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <rect
        x={cx - w / 2}
        y={cy - h / 2}
        width={w}
        height={h}
        rx="10"
        fill={dropped ? "none" : C.papier}
        stroke={C.faden}
        strokeWidth="1.5"
        strokeDasharray={dropped ? "4 4" : undefined}
      />
      <text x={cx} y={cy + 5} fontSize={size} fontWeight="500" fill={dropped ? C.stumm : C.wasser} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

/** The first step in amber, „Danach“ and „Später“ stacked behind it. */
function Schritte({ x, y, w, dx, dy, size }: { x: number; y: number; w: number; dx: number; dy: number; size: number }) {
  const back: [string, number][] = [["Später", 2], ["Danach", 1]];
  return (
    <>
      {back.map(([label, n]) => (
        <g key={label}>
          <rect x={x + n * dx} y={y - n * dy} width={w} height="60" rx="12" fill={C.papier} stroke={C.faden} strokeWidth="1.5" />
          <text x={x + n * dx + w - 16} y={y - n * dy + 20} fontSize="14" fontWeight="500" fill={C.stumm} textAnchor="end">
            {label}
          </text>
        </g>
      ))}
      <rect x={x} y={y} width={w} height="60" rx="12" fill={C.amber} />
      <text x={x + w / 2} y={y + 36} fontSize={size} fontWeight="600" fill={C.wasser} textAnchor="middle">
        Erster Schritt
      </text>
    </>
  );
}

const fall = { fill: "none", stroke: C.faden, strokeWidth: 1.5, strokeLinecap: "round", strokeDasharray: "4 5" } as const;
const FRAGE = "Lohnt es sich?";

function Wide() {
  const ideas: Idea[] = [
    { text: "Rechnungen", cx: 130, cy: 80, w: 112, rot: -6 },
    { text: "Social Media", cx: 300, cy: 110, w: 124, rot: 5 },
    { text: "Angebote", cx: 140, cy: 200, w: 100, rot: 4 },
    { text: "Termine", cx: 310, cy: 240, w: 90, rot: -5 },
  ];
  const dropped: Idea[] = [
    { text: "Chatbot", cx: 120, cy: 370, w: 90, rot: 14 },
    { text: "Agent", cx: 300, cy: 380, w: 76, rot: -11 },
  ];
  return (
    <svg viewBox="0 0 1200 420" className={wideSvg} aria-hidden focusable="false">
      <g style={line}>
        <path d="M30 30 H420 C560 30 600 190 700 190 H720" />
        <path d="M30 330 H420 C560 330 600 230 700 230 H720" />
        <path d="M720 210 H780" />
      </g>
      <path d="M120 296 V336 M300 300 V346" style={fall} />
      {ideas.map((i) => (
        <IdeaCard key={i.text} idea={i} h={36} size={15} />
      ))}
      {dropped.map((i) => (
        <IdeaCard key={i.text} idea={i} h={36} size={15} dropped />
      ))}
      <text x="560" y="216" fontSize="18" fontWeight="600" fill={C.wasser} textAnchor="middle">
        {FRAGE}
      </text>
      <Schritte x={780} y={180} w={200} dx={28} dy={28} size={18} />
    </svg>
  );
}

function Stacked() {
  const ideas: Idea[] = [
    { text: "Rechnungen", cx: 95, cy: 46, w: 108, rot: -6 },
    { text: "Social Media", cx: 255, cy: 40, w: 118, rot: 5 },
    { text: "Angebote", cx: 110, cy: 120, w: 96, rot: 4 },
    { text: "Termine", cx: 260, cy: 128, w: 86, rot: -5 },
  ];
  const dropped: Idea[] = [
    { text: "Chatbot", cx: 55, cy: 440, w: 86, rot: 12 },
    { text: "Agent", cx: 305, cy: 440, w: 74, rot: -10 },
  ];
  // Cropped to the content: the drawing ends with the first step at y 580.
  return (
    <svg viewBox="0 0 360 600" className={stackedSvg} aria-hidden focusable="false">
      <g style={line}>
        <path d="M20 190 C20 300 160 330 160 400 V412" />
        <path d="M340 190 C340 300 200 330 200 400 V412" />
        <path d="M180 412 V468" />
      </g>
      <path d="M16 200 Q6 320 40 418 M344 200 Q354 320 320 418" style={fall} />
      {ideas.map((i) => (
        <IdeaCard key={i.text} idea={i} h={34} size={14} />
      ))}
      {dropped.map((i) => (
        <IdeaCard key={i.text} idea={i} h={34} size={14} dropped />
      ))}
      <text x="180" y="290" fontSize="16" fontWeight="600" fill={C.wasser} textAnchor="middle">
        {FRAGE}
      </text>
      <Schritte x={70} y={520} w={220} dx={14} dy={26} size={17} />
    </svg>
  );
}

export function BeratungTrichter() {
  return <Layouts wide={<Wide />} stacked={<Stacked />} />;
}
