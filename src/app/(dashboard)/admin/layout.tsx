import Link from "next/link";
import { redirect } from "next/navigation";
import { GlamLogo } from "@/components/brand/glam-logo";
import { ADMIN_NAV } from "@/lib/constants/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/account");
  }

  async function signOut() {
    "use server";
    const server = await createClient();
    await server.auth.signOut();
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-glam-primary text-glam-secondary">
      <div className="border-b border-white/10 bg-glam-primary/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-glam-accent">
              Admin Dashboard
            </p>
            <GlamLogo variant="onDark" className="mt-2" asLink={false} />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-white/60 transition hover:text-white"
            >
              View Site
            </Link>
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
          {ADMIN_NAV.map((item) => (
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
