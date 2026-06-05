// src/lib/email/newsletter-confirm.ts
export type ConfirmEmail = { subject: string; html: string; text: string };

export function buildConfirmEmail({ confirmUrl }: { confirmUrl: string }): ConfirmEmail {
  const subject = "Bitte bestätige deine Newsletter-Anmeldung";

  const text = [
    "Fast geschafft!",
    "",
    "Bitte bestätige deine Anmeldung zum Vrelo-Newsletter:",
    confirmUrl,
    "",
    "Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b">
    <div style="max-width:480px;margin:0 auto">
      <h1 style="font-family:Georgia,'Times New Roman',serif;color:#0a2538;font-size:22px;margin:0 0 12px">Fast geschafft</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">Bitte bestätige deine Anmeldung zum Vrelo-Newsletter.</p>
      <a href="${confirmUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:8px">Anmeldung bestätigen</a>
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:20px 0 0">Oder kopier diesen Link in deinen Browser:<br><a href="${confirmUrl}" style="color:#1b5063">${confirmUrl}</a></p>
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:16px 0 0">Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.</p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}
