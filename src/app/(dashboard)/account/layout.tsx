import Link from "next/link";
import { redirect } from "next/navigation";
import { GlamLogo } from "@/components/brand/glam-logo";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const links = [
  { href: "/account", label: "Overview" },
  { href: "/account/bookings", label: "My Appointments" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?next=/account");

  async function signOut() {
    "use server";
    const server = await createClient();
    await server.auth.signOut();
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-glam-background">
      <div className="border-b border-glam-border bg-glam-secondary/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-glam-muted">
              My Account
            </p>
            <GlamLogo className="mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-sm font-semibold text-glam-muted underline-offset-4 hover:text-glam-primary hover:underline"
            >
              ← Back to site
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-full border border-glam-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-glam-muted hover:bg-glam-accent/15"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-5 pb-4 sm:px-8" aria-label="Account">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-full border border-transparent px-4 py-2 text-sm font-medium text-glam-muted transition hover:border-glam-accent/40 hover:bg-glam-accent/10 hover:text-glam-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
    </div>
  );
}
