import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { getAllArticles } from "./ratgeber";

// Guards that every real article (drafts included) declares a cover under
// /images that actually exists in public/. Catches a frontmatter typo or a
// forgotten WebP conversion at test time rather than at build/runtime.
describe("Ratgeber covers (content integrity)", () => {
  const articles = getAllArticles({ includeDrafts: true });

  it("has at least one article", () => {
    expect(articles.length).toBeGreaterThan(0);
  });

  it.each(articles.map((a) => [a.slug, a.cover] as const))(
    "%s: cover is under /images and the file exists",
    (_slug, cover) => {
      expect(cover.startsWith("/images/")).toBe(true);
      expect(fs.existsSync(path.join(process.cwd(), "public", cover))).toBe(true);
    },
  );
});
