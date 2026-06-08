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
        <div className="mx-auto mb-10 max-w-4xl">
          <PageImage src={article.cover} alt={article.coverAlt} ratio="aspect-[16/9]" />
        </div>
        <ArticleHeader article={article} />
        <div className="mx-auto mt-10 max-w-2xl">
          <MDXRemote
            source={article.body}
            components={proseComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkBrandword] } }}
          />
        </div>
      </Section>
      <ClosingCta
        heading="Lass uns deine Quelle bauen."
        lead="Erzähl mir, was dich täglich Zeit kostet – ich zeige dir unverbindlich, was sich automatisieren lässt."
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
