import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  body: string; // raw MDX body, frontmatter stripped
};

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

export function parseArticle(filename: string, raw: string): Article {
  const { data, content } = matter(raw);
  return {
    slug: filename.replace(/\.mdx?$/, ""),
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    readingMinutes: readingMinutes(content),
    body: content,
  };
}

export function selectArticles(
  articles: Article[],
  opts: { includeDrafts: boolean },
): Article[] {
  return articles
    .filter((a) => opts.includeDrafts || !a.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

const RATGEBER_DIR = path.join(process.cwd(), "content", "ratgeber");

/** Drafts are visible in dev, hidden in production builds. */
export function draftsVisible(): boolean {
  return process.env.NODE_ENV !== "production";
}

type IoOpts = { dir?: string; includeDrafts?: boolean };

export function getAllArticles(opts: IoOpts = {}): Article[] {
  const dir = opts.dir ?? RATGEBER_DIR;
  const includeDrafts = opts.includeDrafts ?? draftsVisible();
  if (!fs.existsSync(dir)) return [];
  const articles = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => parseArticle(f, fs.readFileSync(path.join(dir, f), "utf8")));
  return selectArticles(articles, { includeDrafts });
}

export function getArticleSlugs(opts: IoOpts = {}): string[] {
  return getAllArticles(opts).map((a) => a.slug);
}

export function getArticleBySlug(slug: string, opts: { dir?: string } = {}): Article {
  const found = getAllArticles({ dir: opts.dir, includeDrafts: true }).find(
    (a) => a.slug === slug,
  );
  if (!found) throw new Error(`Ratgeber article not found: ${slug}`);
  return found;
}
