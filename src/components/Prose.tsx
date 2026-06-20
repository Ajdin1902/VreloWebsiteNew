// src/components/Prose.tsx
import type { ComponentProps } from "react";
import { BrandWord } from "@/components/BrandWord";

export const proseComponents = {
  BrandWord,
  h2: (p: ComponentProps<"h2">) => (
    <h2 className="mt-10 font-serif text-2xl font-medium text-tiefes-wasser" {...p} />
  ),
  h3: (p: ComponentProps<"h3">) => (
    <h3 className="mt-8 font-serif text-xl font-medium text-tiefes-wasser" {...p} />
  ),
  p: (p: ComponentProps<"p">) => (
    <p className="mt-5 text-lg leading-relaxed text-tinte/90" {...p} />
  ),
  a: (p: ComponentProps<"a">) => (
    <a className="text-vrelo-petrol underline underline-offset-2 hover:text-ember" {...p} />
  ),
  ul: (p: ComponentProps<"ul">) => (
    <ul className="mt-5 list-disc space-y-2 pl-5 text-lg text-tinte/90" {...p} />
  ),
  ol: (p: ComponentProps<"ol">) => (
    <ol className="mt-5 list-decimal space-y-2 pl-5 text-lg text-tinte/90" {...p} />
  ),
  li: (p: ComponentProps<"li">) => <li className="leading-relaxed" {...p} />,
  // Pull-quote. The [&_p]: variants restyle the mapped inner <p> (overriding its
  // mt-5/body color via descendant-selector specificity) — they expect MDX's
  // direct <p> child of a blockquote.
  blockquote: ({ children, ...rest }: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-10 text-center [&_p]:mt-0 [&_p]:font-serif [&_p]:text-2xl [&_p]:italic [&_p]:leading-relaxed [&_p]:text-tiefes-wasser"
      {...rest}
    >
      <span
        aria-hidden
        className="mx-auto mb-3 block h-4 w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
      />
      {children}
    </blockquote>
  ),
};
