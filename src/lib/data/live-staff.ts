import { createClient } from "@/lib/supabase/server";
import { SALON_STAFF, type StaffMember } from "@/lib/constants/staff";

export type LiveStaff = {
  id: string;
  name: string;
  role: string;
  specialty: string[];
};

function mapStaffRow(row: Record<string, unknown>): StaffMember | null {
  const id = typeof row.id === "string" ? row.id : null;
  const name = typeof row.name === "string" ? row.name : null;
  const role = typeof row.role === "string" ? row.role : "";
  const bio = typeof row.bio === "string" ? row.bio : "";
  const experience = typeof row.experience === "string" ? row.experience : "";
  const specialty = Array.isArray(row.specialty) ? (row.specialty as string[]) : [];
  const image =
    typeof row.image_url === "string" && row.image_url.length > 0
      ? row.image_url
      : "https://images.unsplash.com/photo-1560066984-138d9834a973?w=600&q=80";
  const instagram =
    typeof row.instagram_url === "string" && row.instagram_url.length > 0
      ? row.instagram_url
      : undefined;

  if (!id || !name) return null;
  return { id, name, role, bio, experience, specialty, image, instagram };
}

export async function getStaffMembers(): Promise<StaffMember[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, role, bio, experience, specialty, image_url, instagram_url, active, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return SALON_STAFF;
    const normalized = data
      .map((row) => mapStaffRow(row as Record<string, unknown>))
      .filter((x): x is StaffMember => Boolean(x));
    return normalized.length > 0 ? normalized : SALON_STAFF;
  } catch {
    return SALON_STAFF;
  }
}

export async function getLiveStaff(): Promise<LiveStaff[]> {
  const staff = await getStaffMembers();
  return staff.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    specialty: s.specialty,
  }));
}

export type { StaffMember };
