// Parse + select newsletter issue files. Mirrors src/lib/ratgeber.ts, but plain
// ESM so bare `node` can import it. `parseIssue` is pure; the fs helpers wrap it.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/** @typedef {{slug:string,subject:string,previewText:string,date:string,draft:boolean,body:string}} Issue */

/** @returns {Issue} */
export function parseIssue(filename, raw) {
  const { data, content } = matter(raw);
  const slug = filename.replace(/\.md$/, "");
  const subject = String(data.subject ?? "").trim();
  const date = String(data.date ?? "").trim();
  if (!subject) throw new Error(`Newsletter issue "${slug}" is missing required frontmatter: subject`);
  if (!date) throw new Error(`Newsletter issue "${slug}" is missing required frontmatter: date`);
  return {
    slug,
    subject,
    previewText: String(data.previewText ?? "").trim(),
    date,
    draft: data.draft === true,
    body: content.trim(),
  };
}

export function selectIssues(issues, { includeDrafts }) {
  return issues
    .filter((i) => includeDrafts || !i.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

const ISSUE_DIR = path.join(process.cwd(), "content", "newsletter");

export function getAllIssues({ dir = ISSUE_DIR, includeDrafts = true } = {}) {
  if (!fs.existsSync(dir)) return [];
  const issues = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseIssue(f, fs.readFileSync(path.join(dir, f), "utf8")));
  return selectIssues(issues, { includeDrafts });
}

export function getIssueBySlug(slug, { dir = ISSUE_DIR } = {}) {
  const found = getAllIssues({ dir, includeDrafts: true }).find((i) => i.slug === slug);
  if (!found) throw new Error(`Newsletter issue not found: ${slug}`);
  return found;
}
