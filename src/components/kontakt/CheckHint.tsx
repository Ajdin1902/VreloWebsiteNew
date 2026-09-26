import Link from "next/link";
import { CHECK_CTA, CHECK_SRC, checkHref } from "@/lib/prozessCheckCta";

// /kontakt visitors are warm, so the scheduler stays first; this one line only
// catches the undecided. Sits on the dark WaterSection: gletscher text, honig
// link (the same on-dark pair as the homepage Problem link had).
export function CheckHint() {
  return (
    <p className="mx-auto mb-10 max-w-xl text-pretty text-center text-gletscher">
      {CHECK_CTA.kontaktHintPrefix}{" "}
      <Link
        href={checkHref(CHECK_SRC.kontakt)}
        className="rounded-sm font-medium text-honig underline underline-offset-4 hover:text-papier focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honig"
      >
        {CHECK_CTA.kontaktHintLink}
      </Link>{" "}
      {CHECK_CTA.kontaktHintSuffix}
    </p>
  );
}
