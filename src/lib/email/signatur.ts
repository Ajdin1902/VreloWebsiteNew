// Ajdin's e-mail signature (2026-11-12), one source for every mail to a lead.
// Wired into the Prozess-Check result mail; the Bauplan mails can reuse it.
// The phone number lives only here, never on the site (decision 2026-11-04).
import { linkedinProfileUrl, siteUrl } from "@/lib/site";

const SIGNATUR = {
  name: "Ajdin Dzafic",
  rolle: "Gründer",
  claim: "Durchdachte Automatisierung für Betriebe und Unternehmen.",
  telefon: "+49 176 4380 6085",
  telefonHref: "tel:+4917643806085",
  mail: "ajdin@vrelo-ki.de",
  site: "vrelo-ki.de",
  adresse: "Dietrich-Bonhoeffer-Straße 2 · 93055 Regensburg",
} as const;

const SERIF = "font-family:Georgia,'Times New Roman',serif";
const LINK = "color:#1b5063;text-decoration:none";
const SEP = "&nbsp;&nbsp;·&nbsp;&nbsp;";

export function signaturHtml(): string {
  const s = SIGNATUR;
  return `<table role="presentation" style="border-collapse:collapse;font-size:12.5px;line-height:1.55;color:#696359;margin:0 0 24px">
        <tr><td style="padding:0">
          <p style="margin:0;font-size:14px;font-weight:bold;color:#0a2538">${s.name}</p>
          <p style="margin:0">${s.rolle} · <em style="${SERIF};font-style:italic">Vrelo</em></p>
          <p style="margin:0 0 6px">${s.claim}</p>
          <p style="margin:0"><a href="${s.telefonHref}" style="${LINK}">${s.telefon}</a>${SEP}<a href="mailto:${s.mail}" style="${LINK}">${s.mail}</a></p>
          <p style="margin:0"><a href="${siteUrl}" style="${LINK}">${s.site}</a>${SEP}<a href="${linkedinProfileUrl}" style="${LINK}">LinkedIn</a></p>
          <p style="margin:0">${s.adresse}</p>
        </td></tr>
      </table>`;
}

export function signaturText(): string[] {
  const s = SIGNATUR;
  return [
    s.name,
    `${s.rolle} · Vrelo`,
    s.claim,
    `${s.telefon}  ·  ${s.mail}`,
    `${s.site}  ·  LinkedIn: ${linkedinProfileUrl}`,
    s.adresse,
  ];
}
