"use client";

import { useState } from "react";
import type { DemoSeed, AppointmentType, Tone } from "@/lib/demo/seed";

const APPT: { value: AppointmentType; label: string }[] = [
  { value: "erstberatung", label: "Erstberatung" },
  { value: "baufinanzierung", label: "Baufinanzierung" },
  { value: "versicherung", label: "Versicherungs-Check" },
  { value: "frei", label: "etwas anderes" },
];
const TONE: { value: Tone; label: string }[] = [
  { value: "locker", label: "locker (Du)" },
  { value: "foermlich", label: "förmlich (Sie)" },
];

export function Setup({ onReady }: { onReady: (seed: DemoSeed) => void }) {
  const [url, setUrl] = useState("");
  const [business, setBusiness] = useState("");
  const [appointmentType, setAppt] = useState<AppointmentType>("frei");
  const [tone, setTone] = useState<Tone>("foermlich");
  const [loading, setLoading] = useState(false);

  async function applyUrl() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/demo/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const seed = (await res.json()) as Partial<DemoSeed>;
      if (seed.business) setBusiness(seed.business);
      if (seed.appointmentType) setAppt(seed.appointmentType);
      if (seed.tone) setTone(seed.tone);
    } catch {
      // silent fallback to typing
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-10">
      <div className="mb-6">
        <label htmlFor="demo-url" className="block text-sm font-medium text-tinte">
          Deine Website <span className="text-stumm">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-stumm">Dann kennt die Termin-Quelle deinen Betrieb schon.</p>
        <div className="mt-2 flex gap-2">
          <input
            id="demo-url"
            aria-label="Deine Website"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="flex-1 rounded-lg border border-faden bg-white px-3 py-2"
          />
          <button type="button" onClick={applyUrl} disabled={loading} className="cta-fx rounded-lg bg-tiefes-wasser px-4 py-2 text-papier">
            {loading ? "lädt…" : "übernehmen"}
          </button>
        </div>
      </div>

      <label htmlFor="demo-business" className="block text-sm font-medium text-tinte">
        Was bietest du an, für wen?
      </label>
      <textarea
        id="demo-business"
        value={business}
        onChange={(e) => setBusiness(e.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg border border-faden bg-white px-3 py-2"
      />

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-tinte">
          Typischer Termin?
          <select value={appointmentType} onChange={(e) => setAppt(e.target.value as AppointmentType)} className="mt-1 w-full rounded-lg border border-faden bg-white px-3 py-2">
            {APPT.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
        <label className="text-sm text-tinte">
          Ton?
          <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} className="mt-1 w-full rounded-lg border border-faden bg-white px-3 py-2">
            {TONE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>

      <p className="mt-4 text-sm text-stumm">Bitte keine echten Kundendaten eingeben – das hier ist eine Demo.</p>

      <button
        type="button"
        onClick={() => onReady({ business, appointmentType, tone, sourceUrl: url || undefined })}
        className="cta-fx mt-6 w-full rounded-lg bg-tiefes-wasser px-4 py-3 text-papier"
      >
        Los geht's
      </button>
    </div>
  );
}
