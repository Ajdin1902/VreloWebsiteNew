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
      <p className="text-xs font-semibold uppercase tracking-wider text-stumm">{meta}</p>
      <h2 className="mt-2 font-serif text-2xl font-medium text-tiefes-wasser">
        <Link href={`/ratgeber/${article.slug}`} className="hover:text-vrelo-petrol">
          {article.title}
        </Link>
      </h2>
      <p className="mt-2 max-w-2xl text-tinte/80">{article.description}</p>
    </article>
  );
}
