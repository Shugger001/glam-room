import { BRAND } from "@/lib/constants/brand";

type EmailButton = { label: string; href: string; primary?: boolean };

type BookingEmailVariant = "client_submitted" | "client_deposit_paid" | "salon_new" | "salon_deposit_paid";

export type BookingEmailContent = {
  variant: BookingEmailVariant;
  clientName: string;
  service: string;
  when: string;
  location: string;
  depositLine?: string;
  clientPhone?: string | null;
  adminUrl?: string;
  whatsAppUrl?: string | null;
  trackUrl?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderButtons(buttons: EmailButton[]) {
  if (buttons.length === 0) return "";
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
      <tr>
        ${buttons
          .map(
            (btn) => `
          <td style="padding-right:12px;padding-bottom:12px;">
            <a href="${escapeHtml(btn.href)}" style="display:inline-block;padding:14px 22px;border-radius:999px;font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;${
              btn.primary
                ? "background:#C8A86B;color:#0F0F0F;"
                : "background:#FFFFFF;color:#0F0F0F;border:1px solid #E8E0D6;"
            }">${escapeHtml(btn.label)}</a>
          </td>`,
          )
          .join("")}
      </tr>
    </table>
  `;
}

function variantCopy(content: BookingEmailContent) {
  switch (content.variant) {
    case "client_submitted":
      return {
        eyebrow: "Booking received",
        headline: "You're on the list",
        intro: `Hi ${content.clientName}, we've received your booking request and our team will confirm shortly.`,
      };
    case "client_deposit_paid":
      return {
        eyebrow: "Deposit confirmed",
        headline: "Your slot is secured",
        intro: `Hi ${content.clientName}, your deposit is confirmed. We'll reach out on WhatsApp to finalize your appointment.`,
      };
    case "salon_new":
      return {
        eyebrow: "New booking request",
        headline: "A client just booked online",
        intro: `${content.clientName} submitted a new booking request.`,
      };
    case "salon_deposit_paid":
      return {
        eyebrow: "Deposit received",
        headline: "Booking deposit paid",
        intro: `${content.clientName} paid their booking deposit online.`,
      };
  }
}

export function renderBookingEmail(content: BookingEmailContent) {
  const copy = variantCopy(content);
  const isSalon = content.variant.startsWith("salon_");

  const detailRows = [
    ["Service", content.service],
    ["When", content.when],
    ["Location", content.location],
    ...(content.depositLine ? [["Deposit", content.depositLine] as const] : []),
    ...(content.clientPhone ? [["Client phone", content.clientPhone] as const] : []),
  ];

  const buttons: EmailButton[] = [];
  if (isSalon && content.whatsAppUrl) {
    buttons.push({ label: "Message client on WhatsApp", href: content.whatsAppUrl, primary: true });
  }
  if (isSalon && content.adminUrl) {
    buttons.push({ label: "Open admin", href: content.adminUrl });
  }
  if (!isSalon) {
    if (content.whatsAppUrl) {
      buttons.push({ label: "Chat on WhatsApp", href: content.whatsAppUrl, primary: true });
    }
    if (content.trackUrl) {
      buttons.push({ label: "Find my booking", href: content.trackUrl });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://glam-room-gilt.vercel.app";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(BRAND.fullName)}</title>
  </head>
  <body style="margin:0;padding:0;background:#F8F5F2;font-family:Georgia,'Times New Roman',serif;color:#0F0F0F;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F5F2;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E8E0D6;border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(15,15,15,0.08);">
            <tr>
              <td style="padding:32px 32px 20px;background:linear-gradient(180deg,#0F0F0F 0%,#1A1A1A 100%);">
                <p style="margin:0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#C8A86B;">${escapeHtml(BRAND.fullName)}</p>
                <p style="margin:10px 0 0;font-size:13px;color:rgba(255,255,255,0.72);">${escapeHtml(BRAND.tagline)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="margin:0;font-size:11px;letter-spacing:0.24em;text-transform:uppercase;color:#C8A86B;">${escapeHtml(copy.eyebrow)}</p>
                <h1 style="margin:12px 0 0;font-size:32px;line-height:1.15;font-weight:400;">${escapeHtml(copy.headline)}</h1>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:#4A4A4A;">${escapeHtml(copy.intro)}</p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #EFE7DE;">
                  ${detailRows
                    .map(
                      ([label, value]) => `
                    <tr>
                      <td style="padding:14px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#8A8178;width:120px;vertical-align:top;">${escapeHtml(label)}</td>
                      <td style="padding:14px 0 0;font-size:15px;line-height:1.6;color:#0F0F0F;vertical-align:top;">${escapeHtml(value)}</td>
                    </tr>`,
                    )
                    .join("")}
                </table>

                ${renderButtons(buttons)}

                <p style="margin:32px 0 0;font-size:13px;line-height:1.7;color:#8A8178;">
                  ${isSalon ? "Review and confirm from admin, then message the client on WhatsApp." : `Questions? WhatsApp us at ${escapeHtml(BRAND.links.phone)}.`}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 28px;border-top:1px solid #EFE7DE;background:#FCFAF8;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#8A8178;">
                  ${escapeHtml(BRAND.fullName)} · ${escapeHtml(BRAND.address.street)} · Accra, Ghana
                </p>
                <p style="margin:8px 0 0;font-size:12px;">
                  <a href="${escapeHtml(appUrl)}" style="color:#C8A86B;text-decoration:none;">Visit website</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
