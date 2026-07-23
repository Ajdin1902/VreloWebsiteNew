import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { makler } from "@/lib/makler";

// Clears the two silent objections — "do I need to buy technology?" and "am I
// locked in?" — before the visitor weighs the person behind the offer.
//
// The server wording is load-bearing, not marketing: the client opens and owns
// the account. n8n is fair-code (Vrelo may not host or resell it), and the
// Document Concierge's "no file ever reaches me" claim is only true because the
// server is his. Never rewrite this to say Vrelo provides it.
export function Voraussetzungen() {
  const v = makler.voraussetzungen;
  return (
    <Section tint>
      <div className="mx-auto max-w-[44rem] text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-tight text-tiefes-wasser md:text-4xl">
          {v.title}
        </h2>
      </div>
      <dl className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
        {v.items.map((item, i) => (
          <Reveal
            key={item.title}
            delayMs={i * 80}
            className="card-depth rounded-2xl bg-papier p-6"
          >
            <dt className="font-semibold text-tiefes-wasser">{item.title}</dt>
            <dd className="mt-2 text-pretty leading-relaxed text-tinte">{item.body}</dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  );
}
