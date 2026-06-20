// src/components/ratgeber/ArticleCard.tsx
import Link from "next/link";
import { formatDate, type Article } from "@/lib/ratgeber";

export function ArticleCard({ article }: { article: Article }) {
  const meta = [
    formatDate(article.date),
    `${article.readingMinutes} Min`,
    article.tags[0],
    article.draft ? "Entwurf" : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="border-t border-faden py-8 first:border-t-0">
      <div className="flex items-center gap-3">
        {/* amber drop motif — points up, per Brand.md */}
        <span
          aria-hidden
          className="block h-4 w-3 shrink-0 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
        />
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
      </div>
      <h2 className="mt-3 font-serif text-2xl font-medium text-tiefes-wasser">
        <Link
          href={`/ratgeber/${article.slug}`}
          className="rounded-sm hover:text-vrelo-petrol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-papier focus-visible:ring-vrelo-petrol"
        >
          {article.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-2xl text-tinte/80">{article.description}</p>
    </article>
  );
}
