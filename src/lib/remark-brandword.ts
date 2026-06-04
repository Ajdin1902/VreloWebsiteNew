// Dependency-free remark transformer: wraps the literal words "Vrelo"/"Merak"
// in <BrandWord> so they render in Fraunces italic everywhere in MDX content.

export interface MdNode {
  type: string;
  value?: string;
  name?: string;
  attributes?: unknown[];
  children?: MdNode[];
}

const WORDS = /(Vrelo|Merak)/g;

function brandWord(word: string): MdNode {
  return { type: "mdxJsxTextElement", name: "BrandWord", attributes: [], children: [{ type: "text", value: word }] };
}

export function splitText(value: string): MdNode[] {
  const out: MdNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  WORDS.lastIndex = 0;
  while ((m = WORDS.exec(value)) !== null) {
    if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
    out.push(brandWord(m[0]));
    last = m.index + m[0].length;
  }
  if (last < value.length || out.length === 0) {
    out.push({ type: "text", value: value.slice(last) });
  }
  return out.filter((n) => !(n.type === "text" && n.value === ""));
}

function transform(node: MdNode): void {
  if (!node.children) return;
  if (node.type === "code" || node.type === "inlineCode") return;
  if (node.type === "mdxJsxTextElement" && node.name === "BrandWord") return;

  const next: MdNode[] = [];
  for (const child of node.children) {
    if (child.type === "text" && child.value && WORDS.test(child.value)) {
      WORDS.lastIndex = 0;
      next.push(...splitText(child.value));
    } else {
      transform(child);
      next.push(child);
    }
  }
  node.children = next;
}

export function remarkBrandword() {
  return (tree: MdNode): void => transform(tree);
}
