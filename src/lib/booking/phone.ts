export function normalizePhoneDigits(phone: string) {
  return phone.replace(/\D/g, "");
}

export function phoneVariants(phone: string): string[] {
  const digits = normalizePhoneDigits(phone);
  const variants = new Set<string>([digits]);
  if (digits.startsWith("233") && digits.length >= 12) {
    variants.add(`0${digits.slice(3)}`);
  }
  if (digits.startsWith("0") && digits.length >= 10) {
    variants.add(`233${digits.slice(1)}`);
  }
  return [...variants];
}

export function isValidGhanaPhone(phone: string) {
  const digits = normalizePhoneDigits(phone);
  return (digits.startsWith("233") && digits.length >= 12) || (digits.startsWith("0") && digits.length >= 10);
}

export function nameSuffixMatches(fullName: string, suffix: string) {
  const letters = fullName.replace(/[^a-zA-Z]/g, "");
  const expected = suffix.replace(/[^a-zA-Z]/g, "").toLowerCase();
  if (expected.length !== 4) return false;
  return letters.slice(-4).toLowerCase() === expected;
}

export function parseClientNotesField(notes: string | null, field: "Name" | "Phone" | "Location") {
  if (!notes) return null;
  const prefix = `${field}:`;
  for (const line of notes.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length).trim();
    }
  }
  return null;
}
