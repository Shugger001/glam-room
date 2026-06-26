import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminAccess, getAdminNav } from "@/lib/admin/access";
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
  if (!access) redirect("/auth?next=/admin");

  if (!access.isSuperAdmin && !access.assignedLocationId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-glam-primary px-5 text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
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
    );
  }

  const nav = getAdminNav(access.isSuperAdmin);

  return (
    <div className="min-h-screen bg-glam-primary text-white">
      <div className="border-b border-white/10 bg-glam-primary/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-glam-accent">
              {access.isSuperAdmin ? "Super admin" : "Staff"}
            </p>
            <p className="font-display mt-2 text-2xl">Glam Room Admin</p>
            {!access.isSuperAdmin && access.assignedLocationLabel ? (
              <p className="mt-1 text-sm text-white/55">
                Viewing bookings for{" "}
                <span className="text-glam-accent">{access.assignedLocationLabel}</span> only
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/75 hover:bg-white/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 pb-4 sm:px-8"
          aria-label="Admin"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 transition hover:border-glam-accent/50 hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  );
}
