// src/app/canonical.metadata.test.ts
import { describe, it, expect } from "vitest";
import { metadata as home } from "./page";
import { metadata as leistungen } from "./leistungen/page";
import { metadata as ueberMich } from "./ueber-mich/page";
import { metadata as faq } from "./faq/page";
import { metadata as ratgeber } from "./ratgeber/page";
import { metadata as kontakt } from "./kontakt/page";
import { metadata as impressum } from "./impressum/page";
import { metadata as datenschutz } from "./datenschutz/page";
import { metadata as newsletter } from "./newsletter/page";
import { canonical } from "@/lib/site";

describe("per-page canonical", () => {
  it.each([
    ["home", home, ""],
    ["leistungen", leistungen, "/leistungen"],
    ["ueber-mich", ueberMich, "/ueber-mich"],
    ["faq", faq, "/faq"],
    ["ratgeber", ratgeber, "/ratgeber"],
    ["kontakt", kontakt, "/kontakt"],
    ["impressum", impressum, "/impressum"],
    ["datenschutz", datenschutz, "/datenschutz"],
    ["newsletter", newsletter, "/newsletter"],
  ])("%s sets its canonical via canonical()", (_name, meta, path) => {
    expect(meta.alternates?.canonical).toBe(canonical(path));
  });
});
