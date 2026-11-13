# Ratgeber „Zahle ich meine Faulheit mit meinen Daten?“ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One new Meinung article as `content/ratgeber/faulheit-mit-daten-zahlen.mdx` (`draft: true`) plus its cover prompt.

**Architecture:** Content only, no code. The existing corpus test (`src/lib/ratgeber.corpus.test.ts` via `ratgeberCopy.ts`) is the test for the copy rules; `parseArticle` (`src/lib/ratgeber.ts`) checks the frontmatter. The covers test fails until the founder drops the WebP, which is expected.

**Tech Stack:** MDX in `content/ratgeber/`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-ratgeber-faulheit-daten-design.md`

## Global Constraints
- Branch `feat/ratgeber-faulheit-daten` off `main`; no push without Ajdin's OK.
- Skill `.claude/skills/ratgeber-article/` + `references/voice-and-structure.md` self-check apply in full.
- No U+2013/U+2014, „…“ only (U+201E/U+201C, counts equal), no „, und“, generic masculine, ≤ 1 water metaphor, exactly one `>` pull-quote (the turn), no CTA close.
- No Langdock, no Azure as a recommendation, no Vrelo price, AI location „innerhalb der EU“.
- Every fact from the spec's table, with its link inline; nothing outside the table.

## Review Focus
- Edit/Write downgrading U+201C to ASCII `"` → byte-check after writing (Task 1 step 3).
- A joke landing on the wife instead of on the AI or Ajdin → human read in Task 1 step 4.
- Receipts written as done instead of as a temptation → Task 1 step 4.
- A study claim stretched (Kosinski = 2015, Facebook likes, personality) → Task 1 step 4.
- The closing pull-quote duplicating an earlier article's close → `grep -h '^> ' content/ratgeber/*.mdx` in Task 1 step 3.

---

### Task 1: Article draft

**Files:**
- Create: `content/ratgeber/faulheit-mit-daten-zahlen.mdx`
- Test: `src/lib/ratgeber.corpus.test.ts`, `src/lib/ratgeber.test.ts` (existing)

- [ ] **Step 1: Branch** `git checkout -b feat/ratgeber-faulheit-daten`
- [ ] **Step 2: Write the MDX.** Frontmatter: `title: "Zahle ich meine Faulheit mit meinen Daten?"`, `date: "2026-11-13"`, `tags: ["KI", "Meinung"]`, `kategorie: "Meinung"`, `cover: "/images/ratgeber-faulheit-mit-daten-zahlen.webp"`, German `coverAlt`, description ≤ 155 chars teasing 2 to 3 hooks, `draft: true`. Body arc from the spec; pull-quote verbatim: `> Meine eigenen Daten kann ich verschenken. Die meiner Kunden gehören mir nicht.`
- [ ] **Step 3: Verify bytes + rules.** Count U+201E == U+201C, zero U+2013/U+2014/ASCII `"` in the body, zero „, und“; `grep -h '^> ' content/ratgeber/*.mdx` shows no twin.
- [ ] **Step 4: Run the voice self-check + `copy-editing` + `stop-slop`**, tighten; check the four human-judgement lines in Review Focus.
- [ ] **Step 5: Run** `npx vitest run src/lib/ratgeber.corpus.test.ts src/lib/ratgeber.test.ts` (from `C:/Users/ajdin/Vrelo/Website`). Expected: PASS. `ratgeber.covers.test.ts` FAILS on the missing WebP only.
- [ ] **Step 6: Show the draft to Ajdin.** No commit until the cover exists (covers test).

### Task 2: Cover prompt

**Files:** none (output to Ajdin)

- [ ] **Step 1:** Fill the `image_prompt.md` §9 base prompt with a motif that stages the running image without people (e.g. a robot reading a diary at a kitchen table); dark, low-contrast, one warm accent; KI-Bild label in the image if photoreal.
- [ ] **Step 2:** Emit the skill's cover-image checklist verbatim (WebP q80 → `public/images/ratgeber-faulheit-mit-daten-zahlen.webp`).
