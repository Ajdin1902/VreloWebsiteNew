// src/components/ratgeber/RatgeberIndex.tsx
import { ArticleCard } from "./ArticleCard";
import { KategorieFilter } from "./KategorieFilter";
import { RATGEBER_KATEGORIEN, type Article } from "@/lib/ratgeber";

const byDateDesc = (x: Article, y: Article) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0);

// One list, newest first, with a filter row per kategorie above it (Ajdin
// 2026-10-20; replaced the „Neu“ slot + kategorie groups). The sort is stable,
// so articles with the same date keep their incoming order.
export function RatgeberIndex({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="font-serif text-xl italic text-stumm">Hier entsteht der Ratgeber.</p>;
  }
  const items = [...articles].sort(byDateDesc).map((a) => ({
    key: a.slug,
    kategorie: a.kategorie,
    card: <ArticleCard article={a} />,
  }));
  return (
    <div className="max-w-3xl">
      <KategorieFilter kategorien={RATGEBER_KATEGORIEN} items={items} />
    </div>
  );
}
