import type { Metadata } from "next";
import Link from "next/link";
import { CompactHero } from "@/components/CompactHero";
import { Section } from "@/components/Section";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd } from "@/lib/jsonld";
import { CHECK_SRC } from "@/lib/prozessCheckCta";
import { REGENSBURG, REGENSBURG_PATH } from "@/lib/regensburg";
import { canonical } from "@/lib/site";

// The local SEO page (2026-11-12). The business JSON-LD stays on the homepage only.
export const metadata: Metadata = {
  alternates: { canonical: canonical(REGENSBURG_PATH) },
  title: REGENSBURG.meta.title,
  description: REGENSBURG.meta.description,
};

const linkClass =
  "rounded-sm font-medium text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol";

export default function RegensburgPage() {
  const { hero, bloecke, cta } = REGENSBURG;
  return (
    <>
      <CompactHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        line={hero.line}
        image="/images/bg-horizont.webp"
        cta={{ primary: "vorlagen", src: CHECK_SRC.regensburg }}
      />
      <Section>
        <div className="mx-auto max-w-2xl space-y-12">
          {bloecke.map((b) => (
            <div key={b.heading}>
              <h2 className="text-balance text-2xl font-semibold text-tiefes-wasser md:text-3xl">{b.heading}</h2>
              <p className="mt-4 text-pretty text-lg text-tinte">{b.text}</p>
              {b.links ? (
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  {b.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className={linkClass}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </Section>
      <ClosingCta heading={cta.heading} lead={cta.lead} src={CHECK_SRC.regensburg} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: REGENSBURG.footerLabel, path: REGENSBURG_PATH },
        ])}
      />
    </>
  );
}
