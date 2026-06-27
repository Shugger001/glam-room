import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { locationLabelFromId, requireSuperAdmin } from "@/lib/admin/access";
import { CustomerBookingHistory } from "@/components/admin/customer-booking-history";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import type { ProfileRole } from "@/types/database";

export const dynamic = "force-dynamic";

const roleOptions: ProfileRole[] = ["client", "staff", "admin"];
const pageSize = 20;

function shopAccessDefaultValue(role: ProfileRole, assignedLocationId: string | null) {
  if (role === "admin") return "all";
  return assignedLocationId ?? "";
}

function roleLabel(role: ProfileRole) {
  if (role === "admin") return "Super admin";
  if (role === "staff") return "Staff";
  return "Client";
}

async function writeRoleAudit(
  targetUserId: string,
  previousRole: ProfileRole,
  nextRole: ProfileRole,
  actorId: string,
  reason: string,
) {
  const admin = createAdminClient();
  try {
    await admin.from("role_audit_log").insert({
      target_user_id: targetUserId,
      actor_user_id: actorId,
      previous_role: previousRole,
      next_role: nextRole,
      reason: reason || null,
    });
  } catch {
    // Migration may not be applied yet; don't block role updates.
  }
}

async function updateCustomer(formData: FormData) {
  "use server";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const reason = String(formData.get("role_reason") ?? "");
  const adminNotes = String(formData.get("admin_notes") ?? "");
  const tagsRaw = String(formData.get("crm_tags") ?? "");
  const assignedLocationId = String(formData.get("assigned_location_id") ?? "").trim();
  if (!id || !roleOptions.includes(role as (typeof roleOptions)[number])) return;

  const auth = await requireSuperAdmin();
  if (id === auth.userId && role !== "admin") return;

  const validLocationIds = SALON_LOCATIONS.map((l) => l.id);
  const nextAssignedLocationId =
    role === "admin" || assignedLocationId === "all"
      ? null
      : role === "staff" && validLocationIds.includes(assignedLocationId)
        ? assignedLocationId
        : null;

  const crmTags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const admin = createAdminClient();
  const { data: existing } = await admin.from("profiles").select("role").eq("id", id).maybeSingle();

  await admin
    .from("profiles")
    .update({
      role,
      assigned_location_id: nextAssignedLocationId,
      admin_notes: adminNotes.length > 0 ? adminNotes : null,
      crm_tags: crmTags,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (existing?.role && existing.role !== role) {
    await writeRoleAudit(id, existing.role as ProfileRole, role as ProfileRole, auth.userId, reason);
  }

  revalidatePath("/admin/customers");
}

async function bulkApplyTags(formData: FormData) {
  "use server";
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  await requireSuperAdmin();

  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const tags = String(formData.get("bulk_tags") ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  const mode = String(formData.get("bulk_mode") ?? "merge");
  if (ids.length === 0 || tags.length === 0) return;

  const admin = createAdminClient();
  const { data: profiles } = await admin.from("profiles").select("id, crm_tags").in("id", ids);
  if (!profiles) return;

  await Promise.all(
    profiles.map(async (profile) => {
      const current = Array.isArray(profile.crm_tags) ? profile.crm_tags : [];
      const next =
        mode === "replace" ? tags : [...new Set([...current.map(String), ...tags.map(String)])];
      await admin
        .from("profiles")
        .update({ crm_tags: next, updated_at: new Date().toISOString() })
        .eq("id", profile.id);
    }),
  );

  revalidatePath("/admin/customers");
}

type ProfileRow = {
  id: string;
  full_name: string | null;
  role: "client" | "staff" | "admin";
  assigned_location_id: string | null;
  phone: string | null;
  crm_tags: string[] | null;
  admin_notes: string | null;
  created_at: string;
};

type RoleAuditRow = {
  id: string;
  target_user_id: string;
  actor_user_id: string;
  previous_role: string;
  next_role: string;
  reason: string | null;
  created_at: string;
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminCrmPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
        <h1 className="font-display text-3xl">CRM</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/55">
          Configure <code className="text-glam-accent">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-glam-accent">SUPABASE_SERVICE_ROLE_KEY</code> to manage customer roles and
          segmentation.
        </p>
      </div>
    );
  }

  await requireSuperAdmin();

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const roleFilter =
    typeof params.role === "string" && roleOptions.includes(params.role as ProfileRole)
      ? (params.role as ProfileRole)
      : "all";
  const pageRaw = typeof params.page === "string" ? Number(params.page) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const admin = createAdminClient();
  let query = admin
    .from("profiles")
    .select("id, full_name, role, assigned_location_id, phone, crm_tags, admin_notes, created_at", {
      count: "exact",
    })
    .order("created_at", { ascending: false });
  if (roleFilter !== "all") query = query.eq("role", roleFilter);
  if (q.length > 0) {
    const digits = q.replace(/\D/g, "");
    if (digits.length >= 4) {
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%,phone.ilike.%${digits}%`);
    } else {
      query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    }
  }
  const { data, count } = await query.range(from, to);
  const customers = (data ?? []) as ProfileRow[];
  const customerIds = customers.map((c) => c.id);
  const customerPhones = customers.map((c) => c.phone).filter(Boolean) as string[];

  type BookingHistoryRow = {
    id: string;
    user_id: string | null;
    start_at: string;
    status: string;
    location_id: string | null;
    client_phone: string | null;
    services: { name?: string } | null;
  };

  let bookingRows: BookingHistoryRow[] = [];
  if (customerIds.length > 0) {
    const { data: bookingHistory } = await admin
      .from("bookings")
      .select("id, user_id, start_at, status, location_id, client_phone, services(name)")
      .in("user_id", customerIds)
      .order("start_at", { ascending: false })
      .limit(200);
    bookingRows = (bookingHistory ?? []) as BookingHistoryRow[];
  }

  // Also pull guest bookings matching phones on this page
  let guestBookings: BookingHistoryRow[] = [];
  if (customerPhones.length > 0) {
    const phoneFilters = customerPhones.map((p) => `client_phone.ilike.%${p.replace(/\D/g, "").slice(-9)}%`);
    const { data: guestData } = await admin
      .from("bookings")
      .select("id, user_id, start_at, status, location_id, client_phone, services(name)")
      .or(phoneFilters.join(","))
      .is("user_id", null)
      .order("start_at", { ascending: false })
      .limit(50);
    guestBookings = (guestData ?? []) as BookingHistoryRow[];
  }

  const allBookings = [...bookingRows, ...guestBookings];
  const { data: auditData } = await admin
    .from("role_audit_log")
    .select("id, target_user_id, actor_user_id, previous_role, next_role, reason, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  const auditRows = (auditData ?? []) as RoleAuditRow[];
  const total = count ?? customers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentIds = customers.map((c) => c.id).join(",");

  function buildQuery(next: Record<string, string | number>) {
    const qs = new URLSearchParams();
    if (q) qs.set("q", q);
    if (roleFilter !== "all") qs.set("role", roleFilter);
    const nextEntries = Object.entries(next);
    nextEntries.forEach(([k, v]) => {
      if (String(v).length > 0) qs.set(k, String(v));
    });
    return `/admin/customers?${qs.toString()}`;
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
      <h1 className="font-display text-3xl">CRM</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Manage customer segmentation and staff shop assignments. Super admins can change roles and assign staff
        to Adenta, Sowutuom, or Madina.
      </p>
      <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 lg:grid-cols-3">
        <form action="/admin/customers" className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-white/55">Search name or phone</label>
          <input
            name="q"
            defaultValue={q}
            placeholder="Name or phone number"
            className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
          />
        </form>
        <form action="/admin/customers" className="space-y-2">
          <label className="block text-xs uppercase tracking-wider text-white/55">Role view</label>
          <select
            name="role"
            defaultValue={roleFilter}
            className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
          >
            <option value="all" className="bg-glam-primary">
              all
            </option>
            {roleOptions.map((role) => (
              <option key={role} value={role} className="bg-glam-primary">
                {roleLabel(role)}
              </option>
            ))}
          </select>
        </form>
        <form action={bulkApplyTags} className="space-y-2">
          <input type="hidden" name="ids" value={currentIds} />
          <label className="block text-xs uppercase tracking-wider text-white/55">
            Bulk tags for current page
          </label>
          <div className="flex gap-2">
            <input
              name="bulk_tags"
              placeholder="vip, repeat, bridal"
              className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
            />
            <select
              name="bulk_mode"
              defaultValue="merge"
              className="rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
            >
              <option value="merge" className="bg-glam-primary">
                merge
              </option>
              <option value="replace" className="bg-glam-primary">
                replace
              </option>
            </select>
            <button
              type="submit"
              className="rounded-full bg-glam-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-glam-primary"
            >
              Apply
            </button>
          </div>
        </form>
      </div>
      <div className="mt-8 space-y-4">
        {customers.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-6 text-sm text-white/60">
            No profiles found yet.
          </p>
        ) : (
          customers.map((c) => (
            <form
              key={c.id}
              action={updateCustomer}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <input type="hidden" name="id" value={c.id} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_auto_1fr_auto]">
                <div>
                  <p className="font-semibold text-white">{c.full_name ?? "Unnamed client"}</p>
                  <p className="text-xs text-white/55">{c.id}</p>
                  <p className="mt-1 text-xs text-white/40">
                    {roleLabel(c.role)}
                    {c.role === "admin"
                      ? " · All shops"
                      : c.role === "staff" && c.assigned_location_id
                        ? ` · ${locationLabelFromId(c.assigned_location_id)}`
                        : c.role === "staff"
                          ? " · Not assigned"
                          : ""}
                    {" · "}
                    Joined {new Date(c.created_at).toLocaleDateString()}
                    {c.phone ? ` · ${c.phone}` : ""}
                  </p>
                </div>
                <label className="text-xs text-white/60">
                  Role
                  <select
                    name="role"
                    defaultValue={c.role}
                    className="mt-1 rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role} className="bg-glam-primary">
                        {roleLabel(role)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/60">
                  Shop access
                  <select
                    name="assigned_location_id"
                    defaultValue={shopAccessDefaultValue(c.role, c.assigned_location_id)}
                    className="mt-1 rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                  >
                    <option value="all" className="bg-glam-primary">
                      All
                    </option>
                    <option value="" className="bg-glam-primary">
                      Not assigned
                    </option>
                    {SALON_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.id} className="bg-glam-primary">
                        {loc.area}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="space-y-2">
                  <label className="block text-xs text-white/60">
                    CRM tags (comma separated)
                    <input
                      name="crm_tags"
                      defaultValue={(c.crm_tags ?? []).join(", ")}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs text-white/60">
                    Admin notes
                    <input
                      name="admin_notes"
                      defaultValue={c.admin_notes ?? ""}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                    />
                  </label>
                  <label className="block text-xs text-white/60">
                    Role change reason
                    <input
                      name="role_reason"
                      defaultValue=""
                      className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white"
                    />
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="rounded-full bg-glam-accent px-4 py-2 text-xs font-semibold uppercase tracking-wider text-glam-primary"
                  >
                    Save
                  </button>
                </div>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Booking history</p>
                <CustomerBookingHistory
                  bookings={allBookings}
                  profileId={c.id}
                  phone={c.phone}
                />
              </div>
            </form>
          ))
        )}
      </div>
      <div className="mt-6 flex items-center justify-between text-xs text-white/60">
        <p>
          Page {page} of {totalPages} · {total} profiles
        </p>
        <div className="flex gap-2">
          <a
            href={buildQuery({ page: Math.max(1, page - 1) })}
            className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10"
          >
            Prev
          </a>
          <a
            href={buildQuery({ page: Math.min(totalPages, page + 1) })}
            className="rounded-full border border-white/15 px-3 py-1 hover:bg-white/10"
          >
            Next
          </a>
        </div>
      </div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Recent role audit</h2>
        {auditRows.length === 0 ? (
          <p className="mt-2 text-xs text-white/55">No role changes recorded yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {auditRows.map((row) => (
              <li key={row.id} className="text-xs text-white/65">
                <span className="font-medium text-white/85">{row.previous_role}</span> →{" "}
                <span className="font-medium text-glam-accent">{row.next_role}</span> · target{" "}
                {row.target_user_id.slice(0, 8)} · actor {row.actor_user_id.slice(0, 8)} ·{" "}
                {new Date(row.created_at).toLocaleString()}
                {row.reason ? ` · ${row.reason}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
