// src/lib/claudeGehirn.ts
//
// The Claude-Gehirn prompt (spec 2026-10-03). It lives in one plain-text file
// so the page and the LinkedIn post can never drift apart. Server-side only.
import fs from "node:fs";
import path from "node:path";

export const PROMPT_PATH = path.join(process.cwd(), "content", "claude-gehirn", "prompt.txt");

/** LinkedIn posts cap at 3,000 characters; the intro above the prompt needs the rest. */
export const PROMPT_MAX_CHARS = 2700;

/** Length in Unicode code points, the way a reader (and LinkedIn) counts characters. */
export function promptLength(text: string): number {
  return [...text].length;
}

export function getGehirnPrompt(): string {
  // A Windows checkout can turn LF into CRLF; normalise so the count and the page match.
  return fs.readFileSync(PROMPT_PATH, "utf8").replace(/\r\n/g, "\n").trim();
}
