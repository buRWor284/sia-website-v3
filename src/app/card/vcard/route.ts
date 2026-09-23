import { currentEvent, EMAIL, LINKEDIN, PHONE_E164, SITE } from "../content";

/**
 * GET /card/vcard — the "Save my contact" download on /card.
 * vCard 3.0 (the version iOS and Android both import without complaint),
 * CRLF line endings as the spec requires. The NOTE carries the current
 * event, so the contact says where you met.
 */
export const dynamic = "force-dynamic";

function esc(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function GET() {
  const event = currentEvent();
  const note = event
    ? `Met at ${event.name}. EMOS Platform: ${SITE}/emos-platform`
    : `EMOS Platform: ${SITE}/emos-platform`;

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N:Ajmal;Syed Irfan;;;",
    "FN:Syed Irfan Ajmal",
    "ORG:DMR.agency",
    "TITLE:CEO",
    `TEL;TYPE=CELL,VOICE:${PHONE_E164}`,
    `EMAIL;TYPE=INTERNET,WORK:${EMAIL}`,
    `URL:${SITE}`,
    `X-SOCIALPROFILE;TYPE=linkedin:${LINKEDIN}`,
    `NOTE:${esc(note)}`,
    "END:VCARD",
  ];

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": 'attachment; filename="Syed-Irfan-Ajmal.vcf"',
      "Cache-Control": "no-store",
    },
  });
}
