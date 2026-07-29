import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { redirectWithFlash } from "@/lib/admin/flash-redirect";
import {
  AdminEmptyState,
  AdminPageHeader,
  AdminPanel,
  adminBtnOutline,
  adminBtnPrimary,
  adminTabClass,
  AdminSetupNotice,
} from "@/components/admin/admin-ui";
import { buildWhatsAppDeepLink } from "@/lib/notifications/whatsapp-links";
import { BRAND } from "@/lib/constants/brand";

export const dynamic = "force-dynamic";

async function markMessageRead(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) {
    redirectWithFlash("/admin/messages", "error", "Could not mark message as read.");
  }
  const admin = createAdminClient();
  await admin
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  revalidatePath("/admin/messages");
  redirectWithFlash("/admin/messages", "success", "Message marked as read");
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminMessagesPage({ searchParams }: { searchParams: SearchParams }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return <AdminSetupNotice title="Messages" />;
  }

  await requireSuperAdmin();

  const params = await searchParams;
  const filter = params.filter === "unread" ? "unread" : "all";

  const admin = createAdminClient();
  let query = admin
    .from("contact_messages")
    .select("id, name, email, phone, subject, message, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter === "unread") query = query.is("read_at", null);

  const { data: messages } = await query;
  const rows = messages ?? [];

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Messages"
        description="Contact form inbox. Reply on WhatsApp or email, then mark as read."
      />

      <div className="flex gap-2">
        {(["all", "unread"] as const).map((tab) => (
          <a
            key={tab}
            href={tab === "all" ? "/admin/messages" : "/admin/messages?filter=unread"}
            className={adminTabClass(filter === tab)}
          >
            {tab}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <AdminEmptyState
          title={filter === "unread" ? "No unread messages" : "No messages yet"}
          description="New contact form submissions will show up here."
          actionHref="/admin"
          actionLabel="Back to overview"
        />
      ) : (
        <div className="space-y-3">
          {rows.map((msg) => {
            const salonWhatsApp = buildWhatsAppDeepLink(
              BRAND.links.phone,
              `Follow up: ${msg.name} — ${msg.subject}`,
            );
            const whatsappLink = msg.phone
              ? buildWhatsAppDeepLink(
                  msg.phone,
                  `Hi ${msg.name}, thanks for contacting Glam Room. Regarding: ${msg.subject}`,
                )
              : salonWhatsApp;
            const mailto = `mailto:${encodeURIComponent(msg.email)}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}&body=${encodeURIComponent(`Hi ${msg.name},\n\nThank you for reaching out to Glam Room.\n\n`)}`;

            return (
              <AdminPanel
                key={msg.id}
                className={
                  msg.read_at
                    ? undefined
                    : "!border-glam-accent/30 !bg-glam-accent/5"
                }
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{msg.name}</p>
                    <p className="text-xs text-white/55">
                      {msg.email}
                      {msg.phone ? ` · ${msg.phone}` : ""}
                    </p>
                  </div>
                  <p className="text-xs tabular-nums text-white/45">
                    {new Date(msg.created_at).toLocaleString()}
                    {!msg.read_at ? (
                      <span className="ml-2 rounded-md bg-glam-accent/20 px-2 py-0.5 text-glam-accent">
                        New
                      </span>
                    ) : null}
                  </p>
                </div>
                <p className="mt-3 text-sm font-medium text-glam-accent">{msg.subject}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
                  {msg.message}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {whatsappLink ? (
                    <a href={whatsappLink} target="_blank" rel="noreferrer" className={adminBtnPrimary}>
                      WhatsApp reply
                    </a>
                  ) : null}
                  <a href={mailto} className={adminBtnOutline}>
                    Email reply
                  </a>
                  <a href="/admin/appointments" className={adminBtnOutline}>
                    Appointments
                  </a>
                  {!msg.read_at ? (
                    <form action={markMessageRead} className="inline">
                      <input type="hidden" name="id" value={msg.id} />
                      <button type="submit" className={adminBtnOutline}>
                        Mark read
                      </button>
                    </form>
                  ) : null}
                </div>
              </AdminPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
