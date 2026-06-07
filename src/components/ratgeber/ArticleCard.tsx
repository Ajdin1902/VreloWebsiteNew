// src/components/ratgeber/ArticleCard.tsx
import Link from "next/link";
import { PageImage } from "@/components/PageImage";
import { formatDate, type Article } from "@/lib/ratgeber";

export function ArticleCard({ article }: { article: Article }) {
  const meta = [
    formatDate(article.date),
    `${article.readingMinutes} Min`,
    article.tags[0],
    article.draft ? "Entwurf" : null,
  ].filter(Boolean).join(" · ");

  return (
    <article className="flex flex-col gap-4 border-t border-faden py-8 first:border-t-0 sm:flex-row sm:gap-6">
      <div className="sm:w-40 sm:flex-none">
        <PageImage
          src={article.cover}
          alt={article.coverAlt}
          ratio="aspect-[16/9]"
          sizes="(min-width: 640px) 160px, 100vw"
          className="rounded-xl"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
        <h2 className="mt-2 font-serif text-2xl font-medium text-tiefes-wasser">
          <Link href={`/ratgeber/${article.slug}`} className="hover:text-vrelo-petrol">
            {article.title}
          </Link>
        </h2>
        <p className="mt-2 max-w-2xl text-tinte/80">{article.description}</p>
      </div>
    </article>
  );
}
