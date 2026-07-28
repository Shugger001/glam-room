import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminBookingRow } from "@/components/admin/bookings-table";

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

type RawBooking = AdminBookingRow & {
  profiles?: {
    full_name?: string;
    phone?: string;
    crm_tags?: string[] | null;
    admin_notes?: string | null;
    crm_notes?: string | null;
  } | null;
};

function mapProfileCrm(profile: RawBooking["profiles"]): AdminBookingRow["profiles"] {
  if (!profile) return null;
  return {
    full_name: profile.full_name,
    phone: profile.phone,
    crm_tags: Array.isArray(profile.crm_tags) ? profile.crm_tags.map(String) : profile.crm_tags,
    crm_notes: profile.crm_notes ?? profile.admin_notes ?? null,
  };
}

/** Attach CRM tags/notes from linked profiles, with phone fallback for guest bookings. */
export async function enrichBookingsWithCrm(
  admin: SupabaseClient,
  bookings: RawBooking[],
): Promise<AdminBookingRow[]> {
  if (bookings.length === 0) return [];

  const mapped = bookings.map((b) => ({
    ...b,
    profiles: mapProfileCrm(b.profiles),
  }));

  const phones = [
    ...new Set(
      mapped
        .filter((b) => {
          const tags = b.profiles?.crm_tags;
          const notes = b.profiles?.crm_notes;
          const hasCrm = (Array.isArray(tags) && tags.length > 0) || Boolean(notes);
          return !hasCrm && (b.client_phone || b.profiles?.phone);
        })
        .map((b) => normalizePhone(b.client_phone ?? b.profiles?.phone ?? ""))
        .filter((p) => p.length >= 9),
    ),
  ];

  const phoneCrm = new Map<string, { crm_tags: string[] | null; crm_notes: string | null }>();

  if (phones.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("phone, crm_tags, admin_notes")
      .not("phone", "is", null)
      .limit(500);

    for (const profile of profiles ?? []) {
      const key = normalizePhone(profile.phone ?? "");
      if (!key || !phones.includes(key)) continue;
      const tags = Array.isArray(profile.crm_tags) ? profile.crm_tags.map(String) : null;
      const notes = profile.admin_notes ?? null;
      if ((tags && tags.length > 0) || notes) {
        phoneCrm.set(key, { crm_tags: tags, crm_notes: notes });
      }
    }
  }

  return mapped.map((b) => {
    const existingTags = Array.isArray(b.profiles?.crm_tags) ? b.profiles.crm_tags : null;
    const existingNotes = b.profiles?.crm_notes ?? null;
    if ((existingTags && existingTags.length > 0) || existingNotes) return b;

    const phone = normalizePhone(b.client_phone ?? b.profiles?.phone ?? "");
    const match = phone ? phoneCrm.get(phone) : undefined;
    if (!match) return b;

    return {
      ...b,
      profiles: {
        ...(b.profiles ?? {}),
        crm_tags: match.crm_tags ?? undefined,
        crm_notes: match.crm_notes ?? undefined,
      },
    };
  });
}
