"use client";

import { useState } from "react";
import type { DemoSeed } from "@/lib/demo/seed";
import { Setup } from "./Setup";
import { RoleSwitch } from "./RoleSwitch";
import { Chat } from "./Chat";
import { Protokoll } from "./Protokoll";

type Phase = "setup" | "switch" | "chat" | "reveal";

export function Demo({ calLink }: { calLink: string | undefined }) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [seed, setSeed] = useState<DemoSeed | null>(null);
  const [firstMessage, setFirstMessage] = useState("");

  if (phase === "setup") return <Setup onReady={(s) => { setSeed(s); setPhase("switch"); }} />;
  if (phase === "switch") return <RoleSwitch onStart={(m) => { setFirstMessage(m); setPhase("chat"); }} />;
  if (phase === "chat" && seed) return <Chat seed={seed} firstMessage={firstMessage} onDone={() => setPhase("reveal")} />;
  return <Protokoll calLink={calLink} />;
}
