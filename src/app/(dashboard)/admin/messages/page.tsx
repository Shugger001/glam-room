import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/admin/access";
import { AdminPanel, adminTabClass, AdminSetupNotice } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

async function markMessageRead(formData: FormData) {
  "use server";
  await requireSuperAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const admin = createAdminClient();
  await admin
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  revalidatePath("/admin/messages");
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

  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Messages</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Inquiries from the contact form on your website.
      </p>

      <div className="mt-4 flex gap-2">
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

      <div className="mt-6 space-y-4">
        {(messages ?? []).length === 0 ? (
          <p className="text-sm text-white/55">No messages yet.</p>
        ) : null}
        {(messages ?? []).map((msg) => (
          <article
            key={msg.id}
            className={`rounded-2xl border p-5 ${
              msg.read_at
                ? "border-white/10 bg-black/20"
                : "border-glam-accent/30 bg-glam-accent/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{msg.name}</p>
                <p className="text-xs text-white/55">
                  {msg.email}
                  {msg.phone ? ` · ${msg.phone}` : ""}
                </p>
              </div>
              <p className="text-xs text-white/45">
                {new Date(msg.created_at).toLocaleString()}
                {!msg.read_at ? (
                  <span className="ml-2 rounded-full bg-glam-accent/20 px-2 py-0.5 text-glam-accent">
                    New
                  </span>
                ) : null}
              </p>
            </div>
            <p className="mt-3 text-sm font-medium text-glam-accent">{msg.subject}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-white/75">
              {msg.message}
            </p>
            {!msg.read_at ? (
              <form action={markMessageRead} className="mt-4">
                <input type="hidden" name="id" value={msg.id} />
                <button
                  type="submit"
                  className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/75 hover:bg-white/10"
                >
                  Mark as read
                </button>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </AdminPanel>
  );
}
