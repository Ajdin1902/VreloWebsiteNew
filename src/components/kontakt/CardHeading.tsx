// src/components/kontakt/CardHeading.tsx
// The amber Kontakt card's heading + reassurance line. Shared by the form
// (ContactForm) and the unconfigured fallback (page.tsx) so they stay in sync,
// and so the success view (ContactSuccess) can replace it cleanly on submit.
export function CardHeading() {
  return (
    <>
      <h2 className="font-serif text-2xl font-medium text-tiefes-wasser">Schreib mir.</h2>
      <p className="mt-2 text-sm text-tiefes-wasser/80">Ein, zwei Sätze genügen. Ich antworte persönlich.</p>
    </>
  );
}
