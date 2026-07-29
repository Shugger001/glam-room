import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin, locationLabelFromId } from "@/lib/admin/access";
import { redirectWithFlash } from "@/lib/admin/flash-redirect";
import { SALON_LOCATIONS } from "@/lib/constants/locations";

const createStaffLoginSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
  assigned_location_id: z.enum([
    "glam-room-adenta",
    "glam-room-sowutuom",
    "glam-room-madina",
  ]),
  link_front_desk: z.boolean(),
});

export type ShopLoginCoverage = {
  locationId: string;
  area: string;
  staffLogins: { id: string; fullName: string | null }[];
  frontDeskLinked: boolean;
};

/** Shop coverage for front desk / staff logins (super-admin CRM). */
export async function loadShopLoginCoverage(
  admin: ReturnType<typeof createAdminClient>,
): Promise<ShopLoginCoverage[]> {
  const [{ data: staffProfiles }, { data: frontDesks }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, assigned_location_id")
      .eq("role", "staff")
      .not("assigned_location_id", "is", null),
    admin
      .from("staff")
      .select("id, home_location_id, profile_id")
      .eq("is_front_desk", true)
      .eq("active", true),
  ]);

  return SALON_LOCATIONS.map((loc) => {
    const staffLogins = (staffProfiles ?? [])
      .filter((p) => p.assigned_location_id === loc.id)
      .map((p) => ({ id: p.id, fullName: p.full_name as string | null }));
    const desk = (frontDesks ?? []).find((d) => d.home_location_id === loc.id);
    return {
      locationId: loc.id,
      area: loc.area,
      staffLogins,
      frontDeskLinked: Boolean(desk?.profile_id),
    };
  });
}

/**
 * Create a shop-scoped staff login (front desk / floor ops).
 * Super admin only. Optionally links the profile to that shop's front desk seat.
 */
export async function createStaffLoginAction(formData: FormData) {
  "use server";

  const actor = await requireSuperAdmin();
  const parsed = createStaffLoginSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    assigned_location_id: formData.get("assigned_location_id"),
    link_front_desk: formData.get("link_front_desk") === "on",
  });

  if (!parsed.success) {
    return redirectWithFlash(
      "/admin/customers",
      "error",
      "Could not create login. Check name, email, password (8+ chars), and shop.",
    );
  }

  const { full_name, email, password, assigned_location_id, link_front_desk } = parsed.data;
  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name },
  });

  if (createError || !created.user) {
    const msg = createError?.message?.toLowerCase().includes("already")
      ? "That email already has an account. Promote them to Staff in CRM instead."
      : createError?.message ?? "Could not create auth user.";
    return redirectWithFlash("/admin/customers", "error", msg);
  }

  const userId = created.user.id;

  // Trigger may create a client profile; force staff + shop assignment.
  const { error: profileError } = await admin.from("profiles").upsert(
    {
      id: userId,
      full_name,
      role: "staff",
      assigned_location_id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return redirectWithFlash(
      "/admin/customers",
      "error",
      `Account created but profile update failed: ${profileError.message}`,
    );
  }

  try {
    await admin.from("role_audit_log").insert({
      target_user_id: userId,
      actor_user_id: actor.userId,
      previous_role: "client",
      next_role: "staff",
      reason: `Created staff login for ${locationLabelFromId(assigned_location_id)}`,
    });
  } catch {
    // Audit table optional
  }

  if (link_front_desk) {
    const { data: desk } = await admin
      .from("staff")
      .select("id, profile_id")
      .eq("is_front_desk", true)
      .eq("home_location_id", assigned_location_id)
      .eq("active", true)
      .maybeSingle();

    if (desk && !desk.profile_id) {
      await admin
        .from("staff")
        .update({ profile_id: userId, updated_at: new Date().toISOString() })
        .eq("id", desk.id);
    }
  }

  revalidatePath("/admin/customers");
  revalidatePath("/admin/attendance");
  return redirectWithFlash(
    "/admin/customers?role=staff",
    "success",
    `Staff login created for ${locationLabelFromId(assigned_location_id)} · ${email}`,
  );
}
