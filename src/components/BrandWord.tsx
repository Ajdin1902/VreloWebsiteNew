import type { ReactNode } from "react";

export function BrandWord({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <span className={`font-serif italic ${className}`.trim()}>{children}</span>;
}
