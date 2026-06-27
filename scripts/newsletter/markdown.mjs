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

function paragraph(lines) {
  const body = lines.map(renderInline).join("<br>");
  return `<p style="font-size:15px;line-height:1.7;color:${INK};margin:0 0 14px">${body}</p>`;
}

export function renderBlocks(body, { siteUrl }) {
  const out = [];
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  for (const block of blocks) {
    let para = [];
    const flush = () => {
      if (para.length) {
        out.push(paragraph(para));
        para = [];
      }
    };
    for (const line of block.split("\n")) {
      if (line.startsWith("## ")) {
        flush();
        out.push(
          `<h2 style="font-family:Georgia,'Times New Roman',serif;color:${DEEP};font-size:17px;margin:26px 0 8px">${renderInline(line.slice(3))}</h2>`,
        );
        continue;
      }
      const img = line.match(IMG_ONLY);
      if (img) {
        flush();
        out.push(
          `<img src="${absolutize(img[2], siteUrl)}" alt="${escapeHtml(img[1])}" style="display:block;max-width:100%;height:auto;border-radius:8px;margin:10px 0" />`,
        );
        continue;
      }
      para.push(line);
    }
    flush();
  }
  return out.join("\n");
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
