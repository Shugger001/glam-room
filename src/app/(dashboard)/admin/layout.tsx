import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { AdminFlashToast } from "@/components/admin/admin-flash-toast";
import { AdminMobileChrome } from "@/components/admin/admin-mobile-chrome";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminNavigationLoader } from "@/components/admin/admin-navigation-loader";
import { AdminPanel, adminBtnGhost, adminBtnOutline } from "@/components/admin/admin-ui";
import { PageLoader } from "@/components/ui/page-loader";
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
        {/* Desktop rail only */}
        <aside className="hidden border-r border-white/10 bg-glam-primary/80 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-y-auto xl:w-60">
          <div className="px-3 py-5">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-glam-accent">
              {access.isSuperAdmin ? "Super admin" : "Staff"}
            </p>
            <p className="font-display mt-1 text-xl">Glam Room</p>
            {!access.isSuperAdmin && access.assignedLocationLabel ? (
              <p className="mt-1 text-xs text-white/55">{access.assignedLocationLabel}</p>
            ) : (
              <p className="mt-1 text-xs text-white/45">Operations</p>
            )}
          </div>
          <div className="flex-1 px-2 pb-5">
            <AdminNav groups={navGroups} />
            <form action={signOut} className="mt-6 px-3">
              <button type="submit" className={adminBtnGhost}>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminMobileChrome
            groups={navGroups}
            isSuperAdmin={access.isSuperAdmin}
            shopLabel={access.assignedLocationLabel}
            signOut={signOut}
          />
          <main className="relative w-full flex-1 px-3 py-4 pb-24 sm:px-6 sm:py-6 lg:px-8 lg:pb-10 xl:px-10">
            <Suspense fallback={null}>
              <AdminFlashToast />
            </Suspense>
            <Suspense fallback={null}>
              <AdminNavigationLoader />
            </Suspense>
            {children}
          </main>
        </div>
      </div>
    </AdminDashboardShell>
  );
}
