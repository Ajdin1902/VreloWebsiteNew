import Link from "next/link";

// The quiet second path under a primary button: „Lieber direkt reden?
// Erstgespräch buchen“ under a check button, or the check under a /kontakt
// button. Only the label is the link, so the prefix reads as a calm question.
// Light tone uses the deep ember #6f4a20: token ember only reaches ~3.9:1 on
// the warm water bands, #6f4a20 clears 4.7:1 (measured for home Referenzen).
export function SecondaryLink({
  prefix,
  label,
  href,
  tone,
}: {
  prefix: string;
  label: string;
  href: string;
  tone: "dark" | "light";
}) {
  const text = tone === "dark" ? "text-gletscher" : "text-tinte";
  const link =
    tone === "dark"
      ? "text-honig hover:text-papier focus-visible:ring-offset-tiefes-wasser"
      : "text-[#6f4a20] decoration-[#6f4a20]/40 hover:text-[#4d3216] focus-visible:ring-offset-papier";
  return (
    <p className={`mt-3 text-sm ${text}`}>
      {prefix}{" "}
      <Link
        href={href}
        className={`rounded-sm font-medium underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber ${link}`}
      >
        {label}
      </Link>
    </p>
  );
}
