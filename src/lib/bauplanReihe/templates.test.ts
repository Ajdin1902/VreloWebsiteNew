// Series guards on every Bauplan-Reihe template (content/bauplan/<slug>-bauplan.html).
// Spec: docs/superpowers/specs/2026-11-06-bauplan-reihe-design.md (§4 skeleton, §6 constraints).
import { describe, it, expect } from "vitest";
import { ENTITIES } from "../bauplanTemplateText";
import { findCopyIssues } from "../ratgeberCopy";
import { reiheNischen } from "./index";
import { KAPITEL, checkReiheTemplate } from "./templateGuards";
import { LEVELS, abschluss, abschlussHref, selbstcheck } from "./shared";

const shk = reiheNischen.shk;

// Encode copy into the template convention (ASCII + the entities bauplanTemplateText decodes).
const CHAR_TO_ENTITY = Object.fromEntries(
  Object.entries(ENTITIES).filter(([e]) => e !== "&nbsp;" && e !== "&amp;").map(([e, c]) => [c, e]),
);
function enc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/[^\x00-\x7F]/g, (c) => {
    const e = CHAR_TO_ENTITY[c];
    if (!e) throw new Error(`no entity for ${c}`);
    return e;
  });
}
const visible = (url: string) => url.replace(/^https?:\/\//, "");

// The smallest template that satisfies every rule; each fixture below breaks exactly one.
function goodHtml(n = shk): string {
  const stat = n.statistik!;
  const copy = [
    n.kicker, n.title, n.schmerz, ...n.inhalt, stat.zahl, stat.satz, stat.quelle,
    selbstcheck.heading, selbstcheck.intro, ...selbstcheck.spalten, selbstcheck.fundamentFrage, selbstcheck.blankHinweis,
    ...LEVELS.flatMap((l) => [l.name, l.satz]),
  ];
  const first = [
    ...copy.map((s) => `<p>${enc(s)}</p>`),
    `<a href="${enc(stat.href)}">${enc(visible(stat.href))}</a>`,
    ...KAPITEL.slice(0, -1).map((t) => `<h2 class="part">${enc(t)}</h2>`),
    `<h2 class="part">${enc(abschluss.heading)}</h2>`,
    ...abschluss.text.map((s) => `<p>${enc(s)}</p>`),
    `<a href="${abschlussHref(n.slug, "pdf")}">${enc(abschluss.button)}</a>`,
    `<p>${visible(abschlussHref(n.slug, "pdf"))}</p>`,
  ].join("\n");
  const rest = Array.from({ length: n.pages - 1 }, () => '<section class="page"></section>').join("\n");
  return `<html><body><section class="page first">\n${first}\n</section>\n${rest}\n</body></html>`;
}

const withBefore = (extra: string) => goodHtml().replace("<section class=\"page first\">", `<section class="page first">${extra}`);
const withAfter = (extra: string) => goodHtml().replace("</body>", `<p>${extra}</p></body>`);
const problems = (html: string) => checkReiheTemplate(shk, html);
function expectProblem(html: string, kind: string) {
  const p = problems(html);
  expect(p.some((x) => x.startsWith(kind)), `${kind} not in ${JSON.stringify(p)}`).toBe(true);
}

describe("every Bauplan-Reihe template", () => {
  for (const n of Object.values(reiheNischen)) {
    it(`${n.slug}: passes the series guards`, () => {
      expect(checkReiheTemplate(n)).toEqual([]);
    });
    it(`${n.slug}: data strings pass the copy guard`, () => {
      const strings = [n.label, n.kicker, n.title, n.schmerz, ...n.inhalt, ...Object.values(n.mail)];
      if (n.statistik) strings.push(n.statistik.zahl, n.statistik.satz, n.statistik.quelle, n.statistik.linkText);
      expect(strings.flatMap((s) => findCopyIssues(s).map((i) => ({ s, i })))).toEqual([]);
    });
  }
});

describe("checkReiheTemplate on fixtures", () => {
  it("accepts the minimal good fixture", () => {
    expect(problems(goodHtml())).toEqual([]);
  });
  it("reports a non-ASCII byte", () => expectProblem(withAfter("Bäder"), "non-ascii"));
  it("reports an undecoded entity", () => expectProblem(withAfter("&hellip;"), "entity"));
  it("reports a house-typography issue", () => expectProblem(withAfter('ein "Test"'), "copy"));
  it("reports a wrong page count", () =>
    expectProblem(goodHtml().replace('<section class="page"></section>', ""), "pages"));
  it("reports chapter headings out of order", () => {
    const html = goodHtml()
      .replace(`>${enc(KAPITEL[0])}<`, ">TMP<")
      .replace(`>${enc(KAPITEL[1])}<`, `>${enc(KAPITEL[0])}<`)
      .replace(">TMP<", `>${enc(KAPITEL[1])}<`);
    expectProblem(html, "headings");
  });
  it("reports missing shared copy", () => {
    expectProblem(goodHtml().replace(enc(selbstcheck.blankHinweis), "x"), "missing");
    expectProblem(goodHtml().replace(`<p>${enc(LEVELS[3].name)}</p>`, ""), "missing");
    expectProblem(goodHtml().replace(enc(abschluss.text[1]), "x"), "missing");
  });
  it("reports a missing close link", () =>
    expectProblem(goodHtml().replace(`href="${abschlussHref("shk", "pdf")}"`, 'href="https://vrelo-ki.de/kontakt"'), "close link"));
  it("reports missing statistic parts", () => {
    expectProblem(goodHtml().replace(enc(shk.statistik!.satz), "x"), "missing");
    expectProblem(goodHtml().replace(`href="${enc(shk.statistik!.href)}"`, 'href="https://www.zdh.de"'), "statistik");
  });
  it("reports a client name", () => {
    expectProblem(withAfter("Velp"), "client");
    expectProblem(withAfter("G&ouml;cze"), "client");
  });
  it("reports a price", () => expectProblem(withAfter("ab 400 Euro"), "price"));
  it("reports a duration", () => expectProblem(withAfter("fertig in 3 Wochen"), "duration"));
  it("reports a guarantee or a capacity line", () => {
    expectProblem(withAfter("mit Garantie"), "promise");
    expectProblem(withAfter("Ich habe noch 3 Pl&auml;tze."), "promise");
  });
  it("reports a link whose target is not printed", () =>
    expectProblem(withAfter('<a href="https://example.org/x">hier</a>'), "link"));
  it("reports an interface claim for an unverified tool only", () => {
    expectProblem(withAfter("STREIT V.1 hat eine Schnittstelle."), "interface");
    expect(problems(withAfter("HERO hat eine Schnittstelle."))).toEqual([]);
    expect(problems(withAfter("Frag, ob deine Software eine Schnittstelle hat."))).toEqual([]);
  });
  it("reports a first-person offer before the close, not inside it", () => {
    expectProblem(withBefore("<p>Das baue ich dir.</p>"), "first person");
    expect(problems(withAfter("Das baue ich dir."))).toEqual([]);
  });
  it("reports an assistant without the AI disclosure", () => {
    expectProblem(withAfter("Ein Assistent hilft dir."), "disclosure");
    expect(problems(withAfter("Ein Assistent hilft dir. Er meldet sich als KI-Assistent."))).toEqual([]);
  });
});
