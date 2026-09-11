// Single source of truth for the digital business card (/karte).
// Change a detail here → the page, QR target, and vCard all follow.
export const KARTE = {
  fullName: "Ajdin Dzafic",
  firstName: "Ajdin",
  lastName: "Dzafic",
  org: "Vrelo",
  descriptor: "Automatisierung für Betriebe",
  email: "ajdin@vrelo-ki.de",
  phone: "+49 176 4380 6085",
  website: "https://vrelo-ki.de",
  vcfPath: "/karte/kontakt.vcf",
} as const;

// vCard 3.0. Photo (small base64 JPEG) is optional so the builder stays
// testable without the generated asset; the route handler passes the real one.
export function buildVcard(photoBase64?: string): string {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${KARTE.lastName};${KARTE.firstName};;;`,
    `FN:${KARTE.fullName}`,
    `ORG:${KARTE.org}`,
    `TITLE:${KARTE.descriptor}`,
    `EMAIL;TYPE=INTERNET:${KARTE.email}`,
    `TEL;TYPE=CELL:${KARTE.phone}`,
    `URL:${KARTE.website}`,
  ];
  if (photoBase64) {
    lines.push(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`);
  }
  lines.push("END:VCARD");
  return lines.join("\r\n") + "\r\n";
}
