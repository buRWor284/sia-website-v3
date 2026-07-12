/**
 * Sends the 6-digit gate verification code via Resend (Phase P1).
 * Reuses the repo's existing Resend transactional setup (see src/app/api/contact).
 * In dev (no RESEND_API_KEY) it logs the code so local testing works without email.
 */
import { CODE_TTL_MS } from "./config";

const RESEND_API = "https://api.resend.com/emails";
const FROM_EMAIL = "Syed Irfan Ajmal <contact@syedirfanajmal.com>";

const TOOL_LABELS: Record<string, string> = {
  pressiq: "PressIQ",
  signaliq: "SignalIQ",
  pciq: "PartnerCollabIQ",
  jciq: "JournoCollabIQ",
};

function codeEmailHtml(code: string, minutes: number, toolLabel: string | null): string {
  const requestedFrom = toolLabel
    ? `<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(26,20,16,.5);margin:14px 0 0;">Requested from: ${toolLabel}</p>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f1ebde;padding:32px 0;font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="440" cellpadding="0" cellspacing="0" style="background:#e8e0cc;border:1px solid #1a1410;">
      <tr><td style="background:#0e0d0a;padding:22px 28px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.20em;text-transform:uppercase;color:#f5b81f;">Syed Irfan Ajmal · Tools</div>
      </td></tr>
      <tr><td style="padding:28px 28px 8px;">
        <div style="font-size:22px;font-weight:700;color:#1a1410;">Your verification code</div>
        <p style="font-size:15px;color:rgba(26,20,16,.66);line-height:1.55;margin:10px 0 20px;">Enter this code in the tool to continue. It expires in ${minutes} minutes.</p>
        <div style="font-family:'Courier New',monospace;font-size:38px;font-weight:700;letter-spacing:.34em;color:#1a1410;background:#f1ebde;border:1px solid rgba(26,20,16,.25);padding:16px 0;text-align:center;">${code}</div>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(26,20,16,.5);line-height:1.5;margin:18px 0 0;">If you didn't request this, you can safely ignore this email. No changes were made.</p>
        ${requestedFrom}
      </td></tr>
      <tr><td style="padding:18px 28px 24px;border-top:1px solid rgba(26,20,16,.12);">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:rgba(26,20,16,.5);">SIA Enterprises · syedirfanajmal.com</div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function sendCodeEmail(email: string, code: string, tool?: string): Promise<void> {
  const minutes = Math.round(CODE_TTL_MS / 60000);
  const toolLabel = tool ? TOOL_LABELS[tool] || null : null;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[gate/email] RESEND_API_KEY not set, verification code for ${email} is ${code}`);
    return;
  }
  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: email,
      subject: "Your verification code",
      html: codeEmailHtml(code, minutes, toolLabel),
    }),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || `Resend API error ${res.status}`);
  }
}
