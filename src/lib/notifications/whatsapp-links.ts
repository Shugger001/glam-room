import { BRAND } from "@/lib/constants/brand";

/** Normalize Ghana numbers to wa.me format (no +). */
export function normalizeWhatsAppPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("233") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 10) return `233${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppDeepLink(phone: string, message: string) {
  const normalized = normalizeWhatsAppPhone(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function buildClientReplyLink(
  clientPhone: string,
  clientName: string,
  service: string,
  when: string,
) {
  const message = `Hi ${clientName}, this is Glam Room by Asantewaa. Confirming your ${service} appointment on ${when}. Reply here if you need to adjust anything.`;
  return buildWhatsAppDeepLink(clientPhone, message);
}

export function buildClientBookingSupportLink(clientName: string, service: string, when: string) {
  const message = `Hi Glam Room! I'm ${clientName}. I just booked ${service} for ${when}. Looking forward to it!`;
  return buildWhatsAppDeepLink(BRAND.links.phone, message);
}
