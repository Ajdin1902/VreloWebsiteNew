import Link from "next/link";
import { Section } from "@/components/Section";

const leistungen = [
  "Termine & Bestätigungen",
  "Nachfass-Mails",
  "Dateneingabe",
  "Wiederkehrende Kommunikation",
];

export function WasIchBaue() {
  return (
    <Section tone="paper" className="border-t border-faden">
      <p id="was-ich-baue-label" className="text-sm font-medium uppercase tracking-wider text-stumm">Was ich baue</p>
      <h2 className="mt-3 max-w-2xl text-3xl font-semibold text-tiefes-wasser md:text-4xl">
        Eine saubere Quelle — kein Flickenteppich.
      </h2>
      <p className="mt-5 max-w-2xl text-lg text-tinte">
        Ich baue maßgeschneiderte Automatisierungen, die den wiederkehrenden Kleinkram
        still im Hintergrund übernehmen.
      </p>
      <ul aria-labelledby="was-ich-baue-label" className="mt-8 grid gap-3 sm:grid-cols-2">
        {leistungen.map((leistung) => (
          <li
            key={leistung}
            className="rounded-xl border border-faden bg-gletscher/40 px-4 py-3 text-tiefes-wasser"
          >
            {leistung}
          </li>
        ))}
      </ul>
      <Link
        href="/leistungen"
        className="mt-8 inline-block rounded-sm font-medium text-vrelo-petrol underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
      >
        Alle Leistungen ansehen <span aria-hidden="true">→</span>
      </Link>
    </Section>
  );
}
