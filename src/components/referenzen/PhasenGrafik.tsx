// Velp's visual on /referenzen: an abstract picture of the phase engine, no
// client data. A finished phase (all tasks ticked) hands the card on, the next
// phase starts with its tasks and workday deadlines already set.
const phasen = [
  { name: "Phase 1", tasks: [true, true, true] },
  { name: "Phase 2", tasks: [false, false, false] },
];

function Tick({ done }: { done: boolean }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] leading-none ${
        done ? "border-vrelo-petrol bg-vrelo-petrol text-papier" : "border-stein bg-papier text-transparent"
      }`}
    >
      ✓
    </span>
  );
}

export function PhasenGrafik() {
  return (
    <div
      role="img"
      aria-label="Sind alle Aufgaben einer Phase erledigt, rückt die Karte weiter. Die nächste Phase startet mit neuen Aufgaben und Fristen."
      className="flex w-full max-w-sm items-center gap-3 px-4"
    >
      {phasen.map((p, i) => (
        <div key={p.name} className="contents">
          {i > 0 ? (
            <span aria-hidden className="text-2xl text-vrelo-petrol">
              →
            </span>
          ) : null}
          <div className="flex-1 rounded-xl border border-tinte/10 bg-papier p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{p.name}</p>
            <ul className="mt-2 space-y-2">
              {p.tasks.map((done, j) => (
                <li key={j} className="flex items-center gap-2">
                  <Tick done={done} />
                  <span className={`h-1.5 flex-1 rounded-full ${done ? "bg-vrelo-petrol/30" : "bg-amber/50"}`} />
                  {!done ? <span className="text-[10px] font-medium text-stumm">Frist</span> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
