import { Fragment, type ReactNode } from "react";

export function BrandWord({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={["font-serif italic", className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

// Wrap the brand words Vrelo/Merak inside a plain string in <BrandWord>
// (Fraunces italic). Whole-word matches only, so "Vrelos" stays plain.
export function withBrandWords(text: string): ReactNode[] {
  return text.split(/(\bVrelo\b|\bMerak\b)/g).map((part, i) =>
    part === "Vrelo" || part === "Merak" ? (
      <BrandWord key={i}>{part}</BrandWord>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
