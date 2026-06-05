// src/app/ratgeber/[slug]/opengraph-image.tsx
import { OG_SIZE, renderOg } from "@/lib/og";
import { getArticleSlugs, getArticleBySlug } from "@/lib/ratgeber";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Vrelo Ratgeber";

export function generateStaticParams() {
  return getArticleSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  return renderOg({ eyebrow: "Ratgeber", title: article.title });
}
