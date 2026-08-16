// src/app/ratgeber/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Section } from "@/components/Section";
import { PageImage } from "@/components/PageImage";
import { ClosingCta } from "@/components/ClosingCta";
import { JsonLd } from "@/components/JsonLd";
import { ArticleHeader } from "@/components/ratgeber/ArticleHeader";
import { proseComponents } from "@/components/Prose";
import { remarkBrandword } from "@/lib/remark-brandword";
import { getArticleSlugs, getArticleBySlug, draftsVisible, type Article } from "@/lib/ratgeber";
import { articleLd, breadcrumbLd } from "@/lib/jsonld";
import { canonical } from "@/lib/site";
import Link from "next/link";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

function loadVisible(slug: string): Article | null {
  let article: Article;
  try {
    article = getArticleBySlug(slug);
  } catch {
    return null;
  }
  if (article.draft && !draftsVisible()) return null;
  return article;
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = loadVisible(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: canonical(`/ratgeber/${article.slug}`) },
    openGraph: { title: article.title, description: article.description, type: "article" },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const article = loadVisible(slug);
  if (!article) notFound();

  return (
    <>
      <Section tone="reading">
        <ArticleHeader article={article} />
        <div className="mx-auto mt-8 max-w-2xl">
          <PageImage src={article.cover} alt={article.coverAlt} ratio="aspect-[21/9]" />
        </div>
        <div className="article-body mx-auto mt-10 max-w-2xl">
          <MDXRemote
            source={article.body}
            components={proseComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkBrandword] } }}
          />
        </div>
        <div className="mx-auto mt-12 max-w-2xl">
          <Link
            href="/ratgeber"
            className="rounded-sm text-sm font-medium text-stumm underline-offset-4 hover:text-vrelo-petrol hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-lesepapier focus-visible:ring-vrelo-petrol"
          >
            <span aria-hidden="true">← </span>Zurück zum Ratgeber
          </Link>
        </div>
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet. Ich zeige dir unverbindlich, was sich automatisieren lässt."
      />
      <JsonLd data={articleLd(article)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Start", path: "/" },
          { name: "Ratgeber", path: "/ratgeber" },
          { name: article.title, path: `/ratgeber/${article.slug}` },
        ])}
      />
    </>
  );
}
