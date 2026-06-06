import Image from "next/image";

// Rounded, deep-water-shadowed image panel used for page banners (in PageIntro)
// and standalone placements (e.g. a closing image at the bottom of a page).
// `ratio` is a Tailwind aspect utility, e.g. "aspect-[21/9]" (defaults to 16:9).
export function PageImage({
  src,
  alt,
  ratio = "aspect-[16/9]",
  className = "",
}: {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl shadow-deepwater ring-1 ring-gletscher/10 ${ratio} ${className}`.trim()}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1152px) 1104px, 100vw"
        className="object-cover"
      />
    </div>
  );
}
