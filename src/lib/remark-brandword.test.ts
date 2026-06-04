import { describe, it, expect } from "vitest";
import { splitText, remarkBrandword, type MdNode } from "./remark-brandword";

describe("splitText", () => {
  it("wraps Vrelo/Merak as BrandWord and keeps surrounding text", () => {
    const out = splitText("Hallo Vrelo und Merak!");
    expect(out).toEqual([
      { type: "text", value: "Hallo " },
      { type: "mdxJsxTextElement", name: "BrandWord", attributes: [], children: [{ type: "text", value: "Vrelo" }] },
      { type: "text", value: " und " },
      { type: "mdxJsxTextElement", name: "BrandWord", attributes: [], children: [{ type: "text", value: "Merak" }] },
      { type: "text", value: "!" },
    ]);
  });

  it("leaves text without the brand words untouched", () => {
    expect(splitText("nur normaler Text")).toEqual([{ type: "text", value: "nur normaler Text" }]);
  });
});

describe("remarkBrandword", () => {
  it("transforms text nodes inside a paragraph", () => {
    const tree: MdNode = {
      type: "root",
      children: [{ type: "paragraph", children: [{ type: "text", value: "Wir bei Vrelo" }] }],
    };
    remarkBrandword()(tree);
    const para = tree.children![0];
    expect(para.children!.map((c) => c.type)).toEqual(["text", "mdxJsxTextElement"]);
  });

  it("does not descend into code blocks", () => {
    const tree: MdNode = {
      type: "root",
      children: [{ type: "code", value: "const x = 'Vrelo';" }],
    };
    remarkBrandword()(tree);
    expect(tree.children![0]).toEqual({ type: "code", value: "const x = 'Vrelo';" });
  });

  it("does not double-wrap an existing BrandWord", () => {
    const tree: MdNode = {
      type: "root",
      children: [{
        type: "mdxJsxTextElement", name: "BrandWord", attributes: [],
        children: [{ type: "text", value: "Vrelo" }],
      }],
    };
    remarkBrandword()(tree);
    expect(tree.children![0].children).toEqual([{ type: "text", value: "Vrelo" }]);
  });
});
