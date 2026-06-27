// Pure CLI parsing for send-newsletter.mjs. argv = process.argv.slice(2).
const MODES = ["--preview", "--test", "--send"];

export function parseSendArgs(argv) {
  const modes = argv.filter((a) => MODES.includes(a));
  if (modes.length === 0) throw new Error(`Pick a mode: --preview, --test <email>, or --send.`);
  if (modes.length > 1) throw new Error(`Use exactly one of --preview / --test / --send.`);
  const mode = modes[0].slice(2);

  let testEmail;
  const rest = [];
  let scheduledAt;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (MODES.includes(a)) {
      if (a === "--test") {
        const next = argv[i + 1];
        if (!next || !next.includes("@")) throw new Error(`--test needs an email address: --test you@example.de <slug>`);
        testEmail = next;
        i++;
      }
      continue;
    }
    if (a === "--at") {
      if (mode !== "send") throw new Error(`--at is only valid with --send.`);
      const next = argv[i + 1];
      if (!next) throw new Error(`--at needs an ISO timestamp: --at 2026-07-01T08:00:00Z`);
      scheduledAt = next;
      i++;
      continue;
    }
    if (a.startsWith("--")) throw new Error(`Unknown argument: ${a}`);
    rest.push(a);
  }

  const slug = rest[0];
  if (!slug) throw new Error(`Missing issue slug. Usage: --${mode} ${mode === "test" ? "<email> " : ""}<slug>`);

  const out = { mode, slug };
  if (mode === "test") out.testEmail = testEmail;
  if (mode === "send" && scheduledAt) out.scheduledAt = scheduledAt;
  return out;
}

export function assertSendable(issue) {
  if (issue.draft) {
    throw new Error(`Issue "${issue.slug}" is draft: true. Flip it to draft: false before broadcasting.`);
  }
}
