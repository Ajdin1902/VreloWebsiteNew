// Internal mail #2 „Dossier: <Firma>“ after delivery (spec §8.2, §10): the research
// dossier for the call, in the house frame as tables, no hero. Every model- or
// visitor-originated string is escaped once, in html only.
import { escapeHtml } from "@/lib/email/escapeHtml";
import { AREA_LABEL } from "@/lib/prozessCheck";
import { DOSSIER_UI as U } from "./blocks";
import type { VorabFahrplan } from "./content";
import type { LeadContact, Mail } from "./mails";
import type { ResearchResult } from "./research";

// Same frame as the lead mail in mails.ts.
const BODY_STYLE = "margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b";
const CELL = "padding:7px 8px;border-bottom:1px solid #e3dccc;vertical-align:top";
const H = "font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#696359;margin:22px 0 6px";

type Row = [string, string];
type Section = { titel: string; rows?: Row[]; liste?: string[]; nummeriert?: boolean };

export function buildDossierMail(x: {
  contact: LeadContact;
  /** Missing only when the plan or the render failed. */
  plan?: VorabFahrplan;
  result?: ResearchResult;
  verworfen: string[];
  /** Banner: why research is missing or unusable, already in words. */
  grund?: string;
}): Mail & { replyTo: string } {
  const { contact: c, plan, verworfen, grund } = x;
  const d = x.result?.dossier;
  const or = (s: string | undefined) => s?.trim() || "-";

  const sections: Section[] = [
    {
      titel: U.kontakt,
      rows: [
        [U.name, c.name],
        [U.telefon, c.telefon],
        ...(plan ? ([[U.status, plan.recherchiert ? U.recherchiert : U.festeBausteine]] satisfies Row[]) : []),
      ],
    },
  ];
  if (d) {
    for (const p of d.programme) {
      sections.push({
        titel: `${U.programme}: ${p.name}`,
        rows: [
          [U.befunde, or(p.befunde)],
          [U.unbestaetigt, or(p.unbestaetigt)],
          [U.blocker, or(p.blocker)],
          [U.n8n, or(p.n8n)],
          [U.api, or(p.api)],
        ],
      });
    }
    sections.push(
      { titel: U.website, rows: [[U.website, or(d.website)]] },
      { titel: U.aufwand, rows: d.aufwand.map((a): Row => [AREA_LABEL[a.bereich], a.groesse]) },
      { titel: U.karte, liste: d.kartenStationen },
      { titel: U.fragen, liste: d.fragen, nummeriert: true },
      {
        titel: U.lauf,
        rows: [
          [U.kosten, `${d.kostenUsd.toFixed(2)} USD`],
          [U.caps, d.capsGetroffen.join(", ") || U.keine],
        ],
      },
    );
  }
  sections.push({ titel: U.verworfen, liste: verworfen.length ? verworfen : [U.keine] });

  const tr = ([k, v]: Row) =>
    `<tr><td style="${CELL};color:#696359;width:34%">${escapeHtml(k)}</td><td style="${CELL};font-weight:bold">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`;
  const sectionHtml = (s: Section) => {
    const body = s.rows
      ? `<table role="presentation" style="width:100%;border-collapse:collapse;font-size:13.5px">${s.rows.map(tr).join("")}</table>`
      : s.nummeriert
        ? `<ol style="margin:0;padding-left:22px;font-size:14px;line-height:1.55">${s.liste!.map((l) => `<li style="margin:0 0 6px">${escapeHtml(l)}</li>`).join("")}</ol>`
        : `<ul style="margin:0;padding-left:20px;font-size:13.5px;line-height:1.55">${s.liste!.map((l) => `<li>${escapeHtml(l)}</li>`).join("")}</ul>`;
    return `<p style="${H}">${escapeHtml(s.titel)}</p>${body}`;
  };
  const banner = [grund, d ? "" : U.keinDossier].filter(Boolean).join(" · ");

  const html = `<!doctype html>
<html lang="de">
  <body style="${BODY_STYLE}">
    <div style="max-width:520px;margin:0 auto">
      <p style="${H};margin-top:0">${U.label}</p>
      ${banner ? `<p style="background:#fbf0d9;border-left:4px solid #d4a24c;padding:12px 14px;margin:0 0 6px;font-size:14.5px;line-height:1.5"><strong>${escapeHtml(banner)}</strong></p>` : ""}
      ${sections.map(sectionHtml).join("\n      ")}
      <p style="font-size:12.5px;color:#696359;margin:18px 0 0">${escapeHtml(U.antworten.replace("{name}", c.name))}</p>
    </div>
  </body>
</html>`;

  const text = [
    U.label.toUpperCase(),
    ...(banner ? ["", banner] : []),
    ...sections.flatMap((s) => [
      "",
      s.titel.toUpperCase(),
      ...(s.rows
        ? s.rows.map(([k, v]) => `${k}: ${v}`)
        : s.liste!.map((l, i) => (s.nummeriert ? `${i + 1}. ${l}` : `- ${l}`))),
    ]),
  ].join("\n");

  return { subject: `Dossier: ${c.firma.replace(/\s+/g, " ")}`, html, text, replyTo: c.email };
}
