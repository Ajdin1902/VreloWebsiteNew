// Series guards on every Bauplan-Reihe template (content/bauplan/<slug>-bauplan.html).
// Spec: docs/superpowers/specs/2026-11-06-bauplan-reihe-design.md (§4 skeleton, §6 constraints).
import { describe, it, expect } from "vitest";
import { ENTITIES } from "../bauplanTemplateText";
import { findCopyIssues } from "../ratgeberCopy";
import { reiheNischen } from "./index";
import { KAPITEL, checkReiheTemplate } from "./templateGuards";
import { LEVELS, abschluss, abschlussHref, deckblatt, selbstcheck, wochenplan } from "./shared";

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
    n.kicker, n.title, n.schmerz, ...n.auftragsweg.flatMap((s) => [s.schritt, s.verlust ?? ""]).filter(Boolean),
    stat.zahl, stat.satz, stat.quelle,
    wochenplan.heading, ...wochenplan.tage.map((t, i) => `Tag ${i + 1} ${t}`), wochenplan.schluss,
    deckblatt.kreisSatz, deckblatt.ziel,
    selbstcheck.heading, selbstcheck.intro, ...selbstcheck.spalten, selbstcheck.fundamentFrage, selbstcheck.blankHinweis,
    ...LEVELS.flatMap((l) => [l.name, l.satz]),
  ];
  const first = [
    `<h1>${enc(n.title)}</h1>`,
    ...copy.filter((s) => s !== n.title).map((s) => `<p>${enc(s)}</p>`),
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
      const strings = [n.label, n.kicker, n.title, n.schmerz, ...Object.values(n.mail)];
      for (const s of n.auftragsweg) strings.push(s.schritt, ...(s.verlust ? [s.verlust] : []));
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
  it("does not count a commented-out page section", () => {
    expect(problems(withAfter('<!-- <section class="page"></section> -->'))).toEqual([]);
    const commentedOut = goodHtml().replace('<section class="page"></section>', '<!-- <section class="page"></section> -->');
    expectProblem(commentedOut, "pages");
  });
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
  it("reports a missing week path or job flow step", () => {
    expectProblem(goodHtml().replace(enc(wochenplan.schluss), "x"), "missing");
    expectProblem(goodHtml().replace(enc(deckblatt.kreisSatz), "x"), "missing");
    expectProblem(goodHtml().replace(enc(deckblatt.ziel), "x"), "missing");
    expectProblem(goodHtml().replace(`<p>${enc(`Tag 3 ${wochenplan.tage[2]}`)}</p>`, ""), "missing");
    const lossy = shk.auftragsweg.find((s) => s.verlust)!;
    expectProblem(goodHtml().replace(`<p>${enc(lossy.verlust!)}</p>`, ""), "missing");
  });
  it("reports a station number, not a station count", () => {
    expectProblem(withAfter("Hier geht es um Station 4."), "station number");
    expectProblem(withAfter("Station 9 und 10"), "station number");
    expect(problems(withAfter("Alle 13 Stationen deines Betriebs."))).toEqual([]);
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
  it("reports the client name Winter, not the season", () => {
    expectProblem(withAfter("Maximilian Winter"), "client");
    expectProblem(withAfter("Frag Herrn Winter."), "client");
    expect(problems(withAfter("Im Winter r&auml;umst du Schnee, der Winterdienst l&auml;uft."))).toEqual([]);
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
  it("keeps a sentence whole across abbreviations", () => {
    expectProblem(withAfter("STREIT V.1 verbindest du z. B. &uuml;ber eine Schnittstelle."), "interface");
    expectProblem(withAfter("STREIT V.1 kann d. h. eine Schnittstelle nutzen."), "interface");
    expectProblem(withAfter("Ist STREIT V.1 verbunden? Ja, &uuml;ber eine Schnittstelle."), "interface");
  });
  it("matches tool names case-sensitively", () => {
    expectProblem(withAfter("STREIT hat eine Schnittstelle."), "interface");
    expect(problems(withAfter("Im Streit um eine Schnittstelle fragst du nach."))).toEqual([]);
  });
  it("reports a tools-table entry missing from knownTools", () => {
    const table = (tool: string) =>
      `<table class="werkzeuge"><tbody><tr><td>${tool}</td><td>Angebote</td></tr></tbody></table>`;
    expectProblem(withAfter(table("Fantasiesoft")), "tools");
    expect(problems(withAfter(table("HERO")))).toEqual([]);
  });
  it("reports a first-person offer before the close, not inside it", () => {
    expectProblem(withBefore("<p>Das baue ich dir.</p>"), "first person");
    expect(problems(withAfter("Das baue ich dir."))).toEqual([]);
  });
  it("exempts the title only as the cover headline", () => {
    // The title in body copy is first person like any other line; only the <h1> is exempt.
    const moved = goodHtml().replace(`<h1>${enc(shk.title)}</h1>`, `<h1>Bauplan</h1><p>${enc(shk.title)}</p>`);
    expectProblem(moved, "first person");
  });
  it("reports an assistant without the AI disclosure", () => {
    expectProblem(withAfter("Ein Assistent hilft dir."), "disclosure");
    expect(problems(withAfter("Ein Assistent hilft dir. Er meldet sich als KI-Assistent."))).toEqual([]);
  });
});
