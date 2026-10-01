import Link from "next/link";

// The „Mehr dazu“ line under a subpage's close: the Ratgeber as the knowledge
// layer behind each service. The caller filters drafts; empty renders nothing.
export function RelatedLinks({ articles }: { articles: { slug: string; title: string }[] }) {
  if (articles.length === 0) return null;
  return (
    <div className="bg-papier">
      <div className="mx-auto max-w-6xl px-6 py-10 text-tinte">
        <p className="text-sm font-semibold uppercase tracking-wider text-stumm">Mehr dazu im Ratgeber</p>
        <ul className="mt-3 flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-x-8">
          {articles.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/ratgeber/${a.slug}`}
                className="rounded-sm font-medium text-vrelo-petrol underline underline-offset-4 hover:text-tiefes-wasser focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vrelo-petrol focus-visible:ring-offset-2 focus-visible:ring-offset-papier"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
