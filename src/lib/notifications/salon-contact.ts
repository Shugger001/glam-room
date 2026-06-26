/** Where new-booking alerts are sent (server-only). */
export function getSalonNotifyContacts() {
  const phone =
    process.env.SALON_NOTIFY_PHONE?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_BOOKING_NUMBER?.trim() ||
    null;

  return {
    email: process.env.SALON_NOTIFY_EMAIL?.trim() || null,
    phone,
  };
}

export function notificationsConfigured() {
  const { email, phone } = getSalonNotifyContacts();
  const hasEmail = Boolean(email && process.env.RESEND_API_KEY?.trim());
  const hasSms = Boolean(
    phone &&
      process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_NUMBER?.trim(),
  );
  return { hasEmail, hasSms, salonEmail: email, salonPhone: phone };
}
