// src/components/ratgeber/ArticleHeader.tsx
import { formatDate, type Article } from "@/lib/ratgeber";

export function ArticleHeader({ article }: { article: Article }) {
  return (
    <header className="mx-auto max-w-2xl text-center">
      {/* amber drop motif — points up, per Brand.md */}
      <span
        aria-hidden
        className="mx-auto mb-3 block h-4 w-3 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-amber"
      />
      <p className="text-xs font-semibold uppercase tracking-wider text-stumm">
        Ratgeber{article.draft ? " · Entwurf" : ""}
      </p>
      <h1 className="mt-3 font-serif text-3xl font-medium text-tiefes-wasser md:text-4xl">
        {article.title}
      </h1>
      <div className="mx-auto mt-4 h-0.5 w-12 bg-vrelo-petrol" />
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stumm">
        {formatDate(article.date)} · {article.readingMinutes} Min Lesezeit
      </p>
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {article.tags.map((t) => (
            <span key={t} className="rounded-full border border-stein px-3 py-0.5 text-xs text-vrelo-petrol">
              {t}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
