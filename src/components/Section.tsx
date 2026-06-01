import type { ReactNode } from "react";

type Tone = "paper" | "cool" | "warm";

const toneClasses: Record<Tone, string> = {
  paper: "bg-papier text-tinte",
  cool: "bg-tiefes-wasser text-gletscher",
  warm: "bg-sonnenlicht text-tinte",
};

export function Section({
  tone = "paper",
  className = "",
  id,
  children,
}: {
  tone?: Tone;
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={[toneClasses[tone], className].filter(Boolean).join(" ")}>
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">{children}</div>
    </section>
  );
}
