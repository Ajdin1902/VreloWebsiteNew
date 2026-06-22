// src/components/newsletter/NewsletterSuccess.tsx
// The newsletter page's success state: the dark form card is replaced by a calm,
// centered thank-you and the water banner below it (the quiet payoff moment).
import { PageImage } from "@/components/PageImage";

export function NewsletterSuccess() {
  return (
    <>
      <div role="status" className="mx-auto max-w-xl text-center">
        <div
          aria-hidden="true"
          className="success-ring mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-amber/60"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-amber" />
        </div>
        <p className="font-serif text-2xl text-papier">Fast geschafft.</p>
        <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-gletscher">
          Schau in dein Postfach und bestätige deine Anmeldung. Danach bist du dabei.
        </p>
      </div>
      <PageImage
        src="/images/newsletter-banner.webp"
        alt="Ein ruhiger, klarer Wasserlauf fließt gleichmäßig in die Ferne."
        className="mx-auto mt-10 max-w-2xl"
        sizes="(min-width: 768px) 42rem, 100vw"
      />
    </>
  );
}
