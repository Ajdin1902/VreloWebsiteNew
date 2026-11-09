// Files in public/bauplan/ that are load-bearing (mail attachments, see HQ CLAUDE.md "load-bearing"): never delete, never overwrite.
export const PROTECTED = ["agentur-bauplan-52a16b4f.pdf", "elektro-bauplan-36d997ab.pdf"];

// Older hashed PDFs of this slug that may be deleted after a publish.
export function staleFiles(slug, files, keep) {
  const re = new RegExp(`^${slug}-bauplan-[0-9a-f]{8}\\.pdf$`);
  return files.filter((f) => re.test(f) && f !== keep && !PROTECTED.includes(f));
}
