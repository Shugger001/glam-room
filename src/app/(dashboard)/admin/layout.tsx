import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminPanel, adminBtnGhost, adminBtnOutline } from "@/components/admin/admin-ui";
import {
  adminAuthRedirectPath,
  getAdminAccess,
  getAdminNavGroups,
  isClientSession,
} from "@/lib/admin/access";
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
    redirect(await adminAuthRedirectPath());
  }

  if (!access.isSuperAdmin && !access.assignedLocationId) {
    return (
      <AdminDashboardShell>
        <div className="flex min-h-screen items-center justify-center px-5">
          <AdminPanel className="max-w-md text-center">
            <h1 className="font-display text-2xl">Shop not assigned</h1>
            <p className="mt-3 text-sm text-white/60">
              Your staff account needs a shop assignment. Ask a super admin to assign you to Adenta,
              Sowutuom, or Madina in CRM.
            </p>
            <form action={signOut} className="mt-6">
              <button type="submit" className={adminBtnOutline}>
                Sign out
              </button>
            </form>
          </AdminPanel>
        </div>
      </AdminDashboardShell>
    );
  }

  const navGroups = getAdminNavGroups(access.isSuperAdmin);

  return (
    <AdminDashboardShell>
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-glam-primary/80 backdrop-blur-xl lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r xl:w-60">
          <div className="px-4 py-4 lg:px-3 lg:py-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-glam-accent">
              {access.isSuperAdmin ? "Super admin" : "Staff"}
            </p>
            <p className="font-display mt-1 text-lg lg:text-xl">Glam Room</p>
            {!access.isSuperAdmin && access.assignedLocationLabel ? (
              <p className="mt-1 text-xs text-white/55">{access.assignedLocationLabel}</p>
            ) : (
              <p className="mt-1 text-xs text-white/45">Operations</p>
            )}
          </div>

          <div className="hidden px-2 pb-5 lg:block">
            <AdminNav groups={navGroups} />
            <form action={signOut} className="mt-6 px-3">
              <button type="submit" className={adminBtnGhost}>
                Sign out
              </button>
            </form>
          </div>

          <div className="border-t border-white/10 px-3 py-3 lg:hidden">
            <AdminNav groups={navGroups} orientation="horizontal" />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-end border-b border-white/10 bg-glam-primary/50 px-4 py-2 backdrop-blur-md lg:hidden">
            <form action={signOut}>
              <button type="submit" className={adminBtnGhost}>
                Sign out
              </button>
            </form>
          </div>
          <main className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">{children}</main>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
