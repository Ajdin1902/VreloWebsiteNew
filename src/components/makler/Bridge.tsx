import { makler } from "@/lib/makler";

// One sentence between the two products, so product 2 reads as the next step
// rather than a second option. A beat, not a section — so it does NOT use
// `Section` (whose inner wrapper is hard-coded to py-24/py-32; overriding that
// with an arbitrary child variant is a specificity coin-flip). Plain markup
// with its own tighter padding is honest and certain.
export function Bridge() {
  const b = makler.bridge;
  return (
    <section className="bg-papier text-tinte">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="mx-auto max-w-[44rem] text-center">
          <h2 className="text-balance font-serif text-2xl italic text-vrelo-petrol md:text-3xl">
            {b.title}
          </h2>
          <p className="mt-3 text-pretty text-lg text-tinte">{b.body}</p>
        </div>
      </div>
    </section>
  );
}
