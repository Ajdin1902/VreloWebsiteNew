// src/components/ratgeber/RatgeberIndex.tsx
import { ArticleCard } from "./ArticleCard";
import { RATGEBER_KATEGORIEN, type Article } from "@/lib/ratgeber";

// The newest article leads under „Neu“ (and stays in its kategorie too), then the
// groups by kategorie (Grundlagen → Praxis → Kosten → Meinung); uncategorised articles
// fall under „Weitere“. Order inside a group stays newest first.
export function RatgeberIndex({ articles }: { articles: Article[] }) {
  if (articles.length === 0) {
    return <p className="font-serif text-xl italic text-stumm">Hier entsteht der Ratgeber.</p>;
  }
  // Stable sort: on equal dates the first article keeps the slot.
  const newest = [...articles].sort((x, y) => (x.date < y.date ? 1 : x.date > y.date ? -1 : 0))[0];
  const groups = [
    { label: "Neu", items: [newest] },
    ...RATGEBER_KATEGORIEN.map((k) => ({ label: k as string, items: articles.filter((a) => a.kategorie === k) })),
    { label: "Weitere", items: articles.filter((a) => !a.kategorie) },
  ].filter((g) => g.items.length > 0);
  return (
    <div className="flex max-w-3xl flex-col gap-12">
      {groups.map((g) => (
        <section key={g.label} aria-labelledby={`ratgeber-${g.label}`}>
          <h2 id={`ratgeber-${g.label}`} className="text-sm font-semibold uppercase tracking-wider text-stumm">
            {g.label}
          </h2>
          <div className="mt-4">
            {g.items.map((article) => (
              <ArticleCard key={article.slug} article={article} headingLevel="h3" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
