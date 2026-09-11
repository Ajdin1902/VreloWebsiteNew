import { buildVcard } from "@/lib/karte";
import { KARTE_PHOTO_BASE64 } from "@/lib/karte-photo";

export function GET() {
  return new Response(buildVcard(KARTE_PHOTO_BASE64), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'inline; filename="ajdin-dzafic.vcf"',
    },
  });
}
