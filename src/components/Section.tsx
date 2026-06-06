import type { ReactNode } from "react";

type Tone = "paper" | "cool" | "warm" | "petrol";

const toneClasses: Record<Tone, string> = {
  paper: "bg-papier text-tinte",
  cool: "bg-tiefes-wasser text-gletscher",
  warm: "bg-sonnenlicht text-tinte",
  petrol: "bg-vrelo-petrol text-gletscher",
};

export function Section({
  tone = "paper",
  tint = false,
  className = "",
  id,
  children,
}: {
  tone?: Tone;
  tint?: boolean;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  // `tint` is a subtle alternation for stacked paper sections (Leistungen).
  // It replaces the paper background so only one bg utility is emitted.
  const base = tint ? "bg-gletscher/30 text-tinte" : toneClasses[tone];
  return (
    <section id={id} className={[base, className].filter(Boolean).join(" ")}>
      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">{children}</div>
    </section>
  );
}
