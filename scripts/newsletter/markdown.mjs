// scripts/newsletter/markdown.mjs
// Minimal, email-safe Markdown-subset renderer. Inline styles only (email needs
// them). Author copy is trusted, but we still escape <, >, & in text.
const PETROL = "#1b5063";
const INK = "#14181b";
const DEEP = "#0a2538";

export function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Applied to already-escaped text. Case-sensitive on capitalized brand words.
function brandword(s) {
  return s.replace(/\b(Vrelo|Merak)\b/g, '<em style="font-style:italic">$1</em>');
}

export function renderInline(text) {
  let s = escapeHtml(text);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${PETROL}">$1</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em style="font-style:italic">$1</em>');
  return brandword(s);
}

const IMG_ONLY = /^!\[([^\]]*)\]\(([^)]+)\)$/;

function absolutize(src, siteUrl) {
  return src.startsWith("/") ? `${siteUrl}${src}` : src;
}

export function renderBlocks(body, { siteUrl }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return blocks
    .map((block) => {
      if (block.startsWith("## ")) {
        const [head, ...rest] = block.split("\n");
        const h2 = `<h2 style="font-family:Georgia,'Times New Roman',serif;color:${DEEP};font-size:17px;margin:26px 0 8px">${renderInline(head.slice(3))}</h2>`;
        if (rest.length === 0) return h2;
        const body = rest.map(renderInline).join("<br>");
        return `${h2}\n<p style="font-size:15px;line-height:1.7;color:${INK};margin:0 0 14px">${body}</p>`;
      }
      const img = block.match(IMG_ONLY);
      if (img) {
        const alt = escapeHtml(img[1]);
        const src = absolutize(img[2], siteUrl);
        return `<img src="${src}" alt="${alt}" style="display:block;max-width:100%;height:auto;border-radius:8px;margin:10px 0" />`;
      }
      const lines = block.split("\n").map(renderInline).join("<br>");
      return `<p style="font-size:15px;line-height:1.7;color:${INK};margin:0 0 14px">${lines}</p>`;
    })
    .join("\n");
}

export function toPlainText(body) {
  return body
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt) => (alt ? alt : "[Bild]"))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^\s*##\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
