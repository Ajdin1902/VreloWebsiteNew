import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { getLeistungPage, type LeistungSlug } from "@/lib/leistungenPages";

export type RatgeberKategorie = "Grundlagen" | "Praxis" | "Kosten";
export const RATGEBER_KATEGORIEN: RatgeberKategorie[] = ["Grundlagen", "Praxis", "Kosten"];

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO (YYYY-MM-DD)
  tags: string[];
  draft: boolean;
  readingMinutes: number;
  cover: string; // public path, e.g. "/images/ratgeber-termine.webp"
  coverAlt: string; // German alt text
  body: string; // raw MDX body, frontmatter stripped
  kategorie?: RatgeberKategorie;
  leistung?: LeistungSlug; // the Leistungen subpage this article explains
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
  const slug = filename.replace(/\.mdx?$/, "");
  const cover = String(data.cover ?? "").trim();
  const coverAlt = String(data.coverAlt ?? "").trim();
  if (!cover) {
    throw new Error(`Ratgeber article "${slug}" is missing required frontmatter: cover`);
  }
  if (!coverAlt) {
    throw new Error(`Ratgeber article "${slug}" is missing required frontmatter: coverAlt`);
  }
  const kategorie = data.kategorie === undefined ? undefined : String(data.kategorie);
  if (kategorie !== undefined && !RATGEBER_KATEGORIEN.includes(kategorie as RatgeberKategorie)) {
    throw new Error(`Ratgeber article "${slug}" has an unknown kategorie: ${kategorie}`);
  }
  const leistung = data.leistung === undefined ? undefined : String(data.leistung);
  if (leistung !== undefined && !getLeistungPage(leistung)) {
    throw new Error(`Ratgeber article "${slug}" has an unknown leistung: ${leistung}`);
  }
  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    date: String(data.date ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    draft: data.draft === true,
    readingMinutes: readingMinutes(content),
    cover,
    coverAlt,
    body: content,
    kategorie: kategorie as RatgeberKategorie | undefined,
    leistung: leistung as LeistungSlug | undefined,
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
