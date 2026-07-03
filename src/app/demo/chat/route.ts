import { NextResponse } from "next/server";
import { enforceLimits } from "@/lib/demo/ratelimit";
import { getAnthropic, DEMO_MODEL, DEMO_MAX_TOKENS } from "@/lib/demo/anthropic";
import { prepareChat, type ChatMessage } from "@/lib/demo/prompt";
import type { DemoSeed } from "@/lib/demo/seed";
import { isSameOrigin, clientIp, readJsonCapped } from "@/lib/demo/request";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  if (!isSameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await readJsonCapped<{ seed: DemoSeed; messages: ChatMessage[] }>(req);
  if (!body) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  const decision = prepareChat({ seed: body.seed, messages: body.messages });
  if (decision.action === "reject") return NextResponse.json({ error: decision.message }, { status: 400 });
  if (decision.action === "stop") return new Response(decision.message, { headers: { "content-type": "text/plain; charset=utf-8" } });

  const gate = await enforceLimits(clientIp(req), { charge: true });
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 429 });

  const client = getAnthropic();
  if (!client) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  try {
    const s = client.messages.stream({
      model: DEMO_MODEL,
      max_tokens: DEMO_MAX_TOKENS,
      system: decision.system,
      messages: decision.messages,
    });
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          s.on("text", (delta: string) => controller.enqueue(encoder.encode(delta)));
          await s.finalMessage();
        } catch {
          // No-PII: swallow upstream errors; the client just receives a shorter reply.
        } finally {
          controller.close();
        }
      },
      cancel() {
        s.abort();
      },
    });
    return new Response(body, {
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  } catch {
    // No-PII logging: never log transcript or upstream error.
    return NextResponse.json({ error: "Da ist etwas schiefgelaufen. Versuch es gleich noch einmal." }, { status: 502 });
  }
}
