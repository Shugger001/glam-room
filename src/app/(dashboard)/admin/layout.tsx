import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminAccess, getAdminNavGroups, isClientSession } from "@/lib/admin/access";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Operations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const server = await createClient();
  await server.auth.signOut();
  redirect("/auth");
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const access = await getAdminAccess();
  if (!access) {
    if (await isClientSession()) {
      redirect("/book");
    }
    redirect("/auth?next=/admin");
  }

  if (!access.isSuperAdmin && !access.assignedLocationId) {
    return (
      <AdminDashboardShell>
        <div className="flex min-h-screen items-center justify-center px-5">
          <div className="max-w-md rounded-3xl border border-white/15 bg-glam-primary/55 p-8 text-center shadow-[0_20px_60px_-30px_rgba(0,0,0,0.5)] backdrop-blur-md">
            <h1 className="font-display text-2xl">Shop not assigned</h1>
            <p className="mt-3 text-sm text-white/60">
              Your staff account needs a shop assignment. Ask a super admin to assign you to Adenta,
              Sowutuom, or Madina in CRM.
            </p>
            <form action={signOut} className="mt-6">
              <button
                type="submit"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/75 hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </AdminDashboardShell>
    );
  }

  const navGroups = getAdminNavGroups(access.isSuperAdmin);

  return (
    <AdminDashboardShell>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-glam-primary/70 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r xl:w-64">
          <div className="px-5 py-5 lg:px-4 lg:py-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-glam-accent">
              {access.isSuperAdmin ? "Super admin" : "Staff"}
            </p>
            <p className="font-display mt-2 text-xl lg:text-2xl">Glam Room Admin</p>
            {!access.isSuperAdmin && access.assignedLocationLabel ? (
              <p className="mt-1 text-xs text-white/55">
                {access.assignedLocationLabel} bookings only
              </p>
            ) : null}
          </div>

          <div className="hidden px-3 pb-6 lg:block">
            <AdminNav groups={navGroups} />
            <form action={signOut} className="mt-8 px-3">
              <button
                type="submit"
                className="w-full rounded-xl border border-white/15 px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>

          <div className="border-t border-white/10 px-5 py-4 lg:hidden">
            <AdminNav groups={navGroups} orientation="horizontal" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-end border-b border-white/10 bg-glam-primary/40 px-5 py-3 backdrop-blur-md lg:hidden">
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/75 hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
          <main className="w-full flex-1 px-5 py-8 sm:px-8 lg:px-10 xl:px-12">{children}</main>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
