type SendArgs = {
  toEmail?: string | null;
  toPhone?: string | null;
  subject: string;
  html: string;
  smsText?: string;
};

/**
 * Best-effort transactional dispatcher.
 * - Email via Resend when `RESEND_API_KEY` exists
 * - SMS via Twilio when full credentials exist
 */
export async function sendTransactionalMessage(args: SendArgs): Promise<void> {
  const tasks: Promise<unknown>[] = [];

  if (args.toEmail && process.env.RESEND_API_KEY) {
    tasks.push(
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL ?? "The Glam Room <hello@theglamroom.com>",
          to: [args.toEmail],
          subject: args.subject,
          html: args.html,
        }),
      }),
    );
  }

  if (
    args.toPhone &&
    args.smsText &&
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
  ) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const form = new URLSearchParams({
      To: args.toPhone,
      From: process.env.TWILIO_FROM_NUMBER,
      Body: args.smsText,
    });
    tasks.push(
      fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      }),
    );
  }

  if (tasks.length > 0) await Promise.allSettled(tasks);
}
