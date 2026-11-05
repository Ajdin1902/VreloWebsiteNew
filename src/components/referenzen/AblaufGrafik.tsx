// A client's process chain as one picture on /referenzen (Velp: HubSpot →
// sevDesk → BoldSign → Google Drive → ClickUp). Tool names only, no logos and
// no client data. Read as one image by screen readers (the label lists the steps).
export function AblaufGrafik({ schritte }: { schritte: { titel: string; werkzeug: string }[] }) {
  const label = `Ablauf: ${schritte.map((s) => `${s.titel} (${s.werkzeug})`).join(", dann ")}.`;
  return (
    <ol role="img" aria-label={label} className="w-full max-w-xs space-y-1.5 px-4">
      {schritte.map((s, i) => (
        <li key={s.werkzeug} aria-hidden className="flex items-stretch gap-3">
          <div className="flex w-7 flex-col items-center">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-vrelo-petrol text-xs font-semibold text-papier">
              {i + 1}
            </span>
            {i < schritte.length - 1 ? <span className="mt-1.5 w-0.5 flex-1 rounded-full bg-vrelo-petrol/30" /> : null}
          </div>
          <div className="flex-1 rounded-lg border border-tinte/10 bg-papier px-3 py-1.5 shadow-sm">
            <p className="text-sm font-semibold leading-tight text-tinte">{s.titel}</p>
            <p className="text-xs text-stumm">{s.werkzeug}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
