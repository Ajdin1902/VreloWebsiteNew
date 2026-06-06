import { BrandWord } from "@/components/BrandWord";

// The Wellspring-V symbol, inlined so the funnel color can follow the surface.
// Geometry matches public/logo/vrelo-symbol-{navy,paper}-amber.svg; viewBox cropped
// to the drawn content. Decorative — the adjacent live "Vrelo" text is the name.
export function BrandLockup({
  variant = "navy",
  className = "",
}: {
  variant?: "navy" | "paper";
  className?: string;
}) {
  const funnel = variant === "navy" ? "#0a2538" : "#f4efe6";
  const wordmark = variant === "navy" ? "text-tiefes-wasser" : "text-papier";
  return (
    <span className={`inline-flex items-end gap-2.5 ${className}`}>
      <svg
        viewBox="8 4 94 100"
        aria-hidden="true"
        className="block h-[30px] w-auto shrink-0"
      >
        <line x1="12" y1="92" x2="98" y2="92" stroke={funnel} strokeWidth="1" opacity="0.4" />
        <path d="M 14 36 L 55 98 L 96 36 L 82 36 L 55 77 L 28 36 Z" fill={funnel} />
        <path
          d="M 55 8 C 60 8, 65 14, 65 18 C 65 24, 60.5 27.5, 55 27.5 C 49.5 27.5, 45 24, 45 18 C 45 14, 50 8, 55 8 Z"
          fill="#d4a24c"
        />
        <ellipse cx="52" cy="15.5" rx="2.2" ry="3.2" fill="rgba(255,255,255,0.3)" />
      </svg>
      <span className={`text-xl leading-none ${wordmark}`}>
        <BrandWord>Vrelo</BrandWord>
      </span>
    </span>
  );
}
