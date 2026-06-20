// src/components/ratgeber/ArticleHeader.tsx
import { formatDate, type Article } from "@/lib/ratgeber";
import { withBrandWords } from "@/components/BrandWord";

export function ArticleHeader({ article }: { article: Article }) {
  const meta = [
    formatDate(article.date),
    `${article.readingMinutes} Min Lesezeit`,
    ...article.tags,
  ].filter(Boolean).join(" · ");

  return (
    <header className="mx-auto max-w-2xl">
      {article.draft && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stumm">Entwurf</p>
      )}
      <div className="flex items-center gap-3">
        {/* amber drop motif — points up, per Brand.md */}
        <span
          aria-hidden
          className="block h-4 w-3 shrink-0 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
      </div>
      <h1 className="mt-4 font-serif text-3xl font-medium text-tiefes-wasser md:text-4xl">
        {article.title}
      </h1>
      <p className="mt-4 font-serif text-xl text-ember">{withBrandWords(article.description)}</p>
      <hr className="mt-6 border-faden" />
    </header>
  );
}
