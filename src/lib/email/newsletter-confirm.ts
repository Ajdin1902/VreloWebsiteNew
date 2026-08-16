// src/lib/email/newsletter-confirm.ts
export type ConfirmEmail = { subject: string; html: string; text: string };

// NOTE: `confirmUrl` is assembled from trusted constants only (siteUrl + a
// fixed path + encodeURIComponent(token), where the token is base64url). It is
// NOT user-controlled, so interpolating it into the HTML is safe. If a
// user-supplied value (e.g. a returnTo param) is ever added, escape it first.
export function buildConfirmEmail({ confirmUrl }: { confirmUrl: string }): ConfirmEmail {
  const subject = "Bitte bestätige deine Newsletter-Anmeldung";

  const oneLiner = "Aus einem Tropfen fließt ein Fluss, aus einer Idee deine Zeit zurück.";

  const text = [
    "Hallo,",
    "",
    "schön, dass du beim Vrelo-Newsletter dabei sein möchtest. Bitte bestätige kurz deine Anmeldung:",
    confirmUrl,
    "",
    "Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.",
    "",
    "Bis bald",
    "Ajdin von Vrelo",
    "",
    oneLiner,
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;background:#f4efe6;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#14181b">
    <div style="max-width:480px;margin:0 auto">
      <h1 style="font-family:Georgia,'Times New Roman',serif;color:#0a2538;font-size:22px;margin:0 0 16px">Fast geschafft</h1>
      <p style="font-size:15px;line-height:1.6;margin:0 0 14px">Hallo,</p>
      <p style="font-size:15px;line-height:1.6;margin:0 0 20px">schön, dass du beim <em style="font-style:italic">Vrelo</em>-Newsletter dabei sein möchtest. Bitte bestätige kurz deine Anmeldung.</p>
      <a href="${confirmUrl}" style="display:inline-block;background:#d4a24c;color:#0a2538;font-weight:bold;text-decoration:none;padding:12px 20px;border-radius:8px">Anmeldung bestätigen</a>
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:20px 0 0">Oder kopier diesen Link in deinen Browser:<br><a href="${confirmUrl}" style="color:#1b5063">${confirmUrl}</a></p>
      <p style="font-size:13px;line-height:1.6;color:#7a7468;margin:16px 0 0">Wenn du dich nicht angemeldet hast, ignorier diese E-Mail einfach.</p>
      <p style="font-size:15px;line-height:1.6;margin:24px 0 0">Bis bald<br>Ajdin von <em style="font-style:italic">Vrelo</em></p>
      <hr style="border:none;border-top:1px solid #e3dccc;margin:24px 0 16px" />
      <p style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:14px;line-height:1.6;color:#1b5063;margin:0">${oneLiner}</p>
    </div>
  </body>
</html>`;

  return { subject, html, text };
}
