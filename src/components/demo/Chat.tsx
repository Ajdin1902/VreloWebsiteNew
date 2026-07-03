"use client";

import { useEffect, useRef, useState } from "react";
import type { DemoSeed } from "@/lib/demo/seed";
import type { ChatMessage } from "@/lib/demo/prompt";

const MAX_TURNS = 6;

export function Chat({ seed, firstMessage, onDone }: { seed: DemoSeed; firstMessage: string; onDone: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  async function send(text: string, history: ChatMessage[]) {
    const nextHistory = [...history, { role: "user" as const, content: text }];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const res = await fetch("/demo/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ seed, messages: nextHistory }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      if (reader) {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages([...nextHistory, { role: "assistant", content: acc }]);
        }
      }
      const finalHistory = [...nextHistory, { role: "assistant" as const, content: acc }];
      const userTurns = finalHistory.filter((m) => m.role === "user").length;
      if (userTurns >= MAX_TURNS) onDone();
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // Intentional one-time auto-send of the opener on mount (guarded by the ref).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (firstMessage) void send(firstMessage, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="card-depth rounded-2xl border border-faden bg-papier p-6 md:p-8">
      <div className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "self-end rounded-2xl bg-tiefes-wasser px-4 py-2 text-papier" : "self-start rounded-2xl bg-gletscher/40 px-4 py-2 text-tinte"}>
            {m.content}
          </div>
        ))}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || busy) return;
          const text = input.trim();
          setInput("");
          void send(text, messages);
        }}
      >
        <input aria-label="Deine Nachricht" value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg border border-faden bg-white px-3 py-2" />
        <button type="submit" disabled={busy} className="cta-fx rounded-lg bg-tiefes-wasser px-4 py-2 text-papier">senden</button>
      </form>
    </div>
  );
}
