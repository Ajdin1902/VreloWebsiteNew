import Anthropic from "@anthropic-ai/sdk";
import { anthropicKey } from "./config";

export const DEMO_MODEL = "claude-haiku-4-5-20251001";
export const DEMO_MAX_TOKENS = 512;

export function getAnthropic(): Anthropic | null {
  const key = anthropicKey();
  return key ? new Anthropic({ apiKey: key }) : null;
}
