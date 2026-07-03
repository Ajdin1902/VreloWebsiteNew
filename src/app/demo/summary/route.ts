import { NextResponse } from "next/server";
import { enforceLimits } from "@/lib/demo/ratelimit";
import { getAnthropic, DEMO_MODEL } from "@/lib/demo/anthropic";
import { sanitizeSeed, type DemoSeed } from "@/lib/demo/seed";
import { type ChatMessage, MAX_TURNS, MAX_MSG_LEN } from "@/lib/demo/prompt";
import { isSameOrigin, clientIp, readJsonCapped } from "@/lib/demo/request";
import { buildSummarySystem, transcriptToText, parseNotes, EMPTY_NOTIZ } from "@/lib/demo/summary";

export const runtime = "nodejs";

const SUMMARY_MAX_TOKENS = 300;

/** Keep only valid user/assistant turns, trim + cap each, drop empties, cap count. */
function clampMessages(raw: unknown): ChatMessage[] {
  const arr = Array.isArray(raw) ? raw : [];
  const out: ChatMessage[] = [];
  for (const m of arr) {
    if (m?.role !== "user" && m?.role !== "assistant") continue;
    const content = String(m.content ?? "").trim().slice(0, MAX_MSG_LEN);
    if (!content) continue;
    out.push({ role: m.role, content });
    if (out.length >= MAX_TURNS * 2) break;
  }
  return out;
}

export async function POST(req: Request): Promise<Response> {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await readJsonCapped<{ seed: DemoSeed; messages: ChatMessage[] }>(req);
  if (!body) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const seed = sanitizeSeed(body.seed ?? {});
  const messages = clampMessages(body.messages);

  // Nothing to summarize on an empty transcript — return free, before charging or calling the model.
  if (!messages.some((m) => m.role === "user")) return NextResponse.json(EMPTY_NOTIZ);

  const gate = await enforceLimits(clientIp(req), { charge: true });
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  const client = getAnthropic();
  if (!client) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  try {
    const msg = await client.messages.create({
      model: DEMO_MODEL,
      max_tokens: SUMMARY_MAX_TOKENS,
      system: buildSummarySystem(seed),
      messages: [{ role: "user", content: transcriptToText(messages) }],
    });
    const out = msg.content.find((c) => c.type === "text");
    const text = out && out.type === "text" ? out.text : "";
    return NextResponse.json(parseNotes(text));
  } catch {
    // Fail-safe (no-PII): the reveal degrades to transcript-only, never a 5xx.
    return NextResponse.json(EMPTY_NOTIZ);
  }
}
