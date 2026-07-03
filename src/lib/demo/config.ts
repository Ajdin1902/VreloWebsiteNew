export function anthropicKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY || undefined;
}

export function isDemoConfigured(): boolean {
  return Boolean(anthropicKey());
}

export function dailyBudget(): number {
  const n = Number(process.env.DEMO_DAILY_BUDGET);
  return Number.isFinite(n) && n > 0 ? n : 500;
}
