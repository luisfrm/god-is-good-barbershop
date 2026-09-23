/** Strip everything but digits so a phone can be used in a wa.me link. */
export function normalizePhoneForWhatsapp(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Build a wa.me deep link. Returns an empty string when the phone has no
 * usable digits so callers can hide the action.
 */
export function whatsappLink(phone: string, message?: string): string {
  const digits = normalizePhoneForWhatsapp(phone);
  if (!digits) return "";
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
