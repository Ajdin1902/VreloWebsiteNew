import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { LazyVideo } from "@/components/LazyVideo";
import type { MaklerProduct } from "@/lib/makler";

// Product 2, on paper — the page runs cool (petrol product 1) to warm here.
// The proof slot is config-gated exactly like the Cal/Newsletter "not yet
// configured" pattern: no video recorded -> the seven flow cards carry it. The
// derivative paths follow scripts/optimize-videos.mjs (mp4/webm + -poster.jpg).
export function DocumentConciergeBlock({ product }: { product: MaklerProduct }) {
  const p = product;
  return (
    <Section tone="paper">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-wide text-stumm">{p.eyebrow}</span>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
            {p.name}
          </h2>
          <p className="mt-3 text-pretty font-serif text-2xl italic text-vrelo-petrol md:text-3xl">
            {p.promise}
          </p>
          <p className="mt-6 text-pretty leading-relaxed text-tinte">{p.body}</p>
        </Reveal>

        {p.demoVideo ? (
          <Reveal className="mt-10">
            <LazyVideo
              mp4={`/video/${p.demoVideo.slug}.mp4`}
              webm={`/video/${p.demoVideo.slug}.webm`}
              poster={`/video/${p.demoVideo.slug}-poster.jpg`}
              aspect="aspect-video"
              className="card-depth w-full rounded-2xl object-cover"
            />
            <p className="mt-3 text-sm text-stumm">{p.demoVideo.caption}</p>
          </Reveal>
        ) : (
          <Reveal>
            <ol aria-label="Ablauf" className="mt-10 grid gap-4 sm:grid-cols-2">
              {p.flow!.map((s, i) => (
                <li key={s.title} className="card-depth rounded-2xl bg-papier p-5">
                  <span
                    aria-hidden="true"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-vrelo-petrol text-sm font-semibold text-papier"
                  >
                    {i + 1}
                  </span>
                  <p className="mt-3 font-semibold text-tiefes-wasser">{s.title}</p>
                  <p className="mt-1 text-pretty leading-relaxed text-tinte">{s.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        )}

        <Reveal>
          <p className="mt-10 text-pretty text-lg font-medium text-tiefes-wasser">{p.outcome}</p>
        </Reveal>

        <Reveal className="card-depth mt-10 rounded-2xl bg-gletscher/40 p-6 md:p-8">
          <h3 className="font-semibold text-tiefes-wasser">{p.trust!.title}</h3>
          <p className="mt-2 text-pretty leading-relaxed text-tinte">{p.trust!.body}</p>
        </Reveal>

        <p className="mt-6 text-pretty text-sm italic text-stumm">{p.note}</p>
      </div>
    </Section>
  );
}
