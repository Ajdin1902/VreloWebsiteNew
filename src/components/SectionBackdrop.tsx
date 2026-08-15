// A decorative full-bleed backdrop for a homepage Section: a water image under a
// solid-colour tint that keeps content legible. Drop it as the FIRST child of a
// `relative isolate overflow-hidden` Section (the `isolate` is required — without
// it the -z- layers paint behind the section's own opaque background; see
// Steps/Proof/MerakClose). The image is decorative (empty alt + aria-hidden);
// the section's own text carries all meaning.
//
// The tint is an inline rgba of the section's own base colour: `tintRgb` is the
// token's "r g b" and `tintOpacity` how much of it covers the image. Lower
// opacity = more visible image. The worst-case contrast of the text sitting
// above it must be measured, not eyeballed (see the design notes on each caller).
export function SectionBackdrop({
  src,
  tintRgb,
  tintOpacity,
}: {
  src: string;
  tintRgb: string; // e.g. "27 80 99" (vrelo-petrol)
  tintOpacity: number; // 0..1
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ backgroundColor: `rgb(${tintRgb} / ${tintOpacity})` }}
      />
    </>
  );
}
