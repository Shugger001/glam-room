import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account",
  description: "Your profile and appointments at The Glam Room.",
};

export default async function AccountOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
    : { data: null };
  const { count: bookingCount } = user
    ? await supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
    : { count: 0 };

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <section className="glass-panel rounded-2xl p-8 lg:col-span-2">
        <h1 className="heading-display text-3xl text-glam-primary">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ""}
        </h1>
        <p className="mt-4 text-glam-muted">
          Manage your appointments and book your next visit to The Glam Room.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-glam-border bg-glam-secondary p-4">
            <p className="text-xs uppercase tracking-wider text-glam-muted">Appointments</p>
            <p className="heading-display mt-2 text-3xl text-glam-primary">{bookingCount ?? 0}</p>
          </div>
        </div>
      </section>
      <aside className="space-y-4 rounded-2xl border border-glam-border bg-glam-secondary p-8 shadow-soft">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-glam-muted">
          Quick Actions
        </h2>
        <ul className="space-y-3 text-sm font-medium text-glam-primary">
          <li>
            <Link href="/book" className="hover:text-glam-accent">
              Book Appointment
            </Link>
          </li>
          <li>
            <Link href="/account/bookings" className="hover:text-glam-accent">
              View Appointments
            </Link>
          </li>
          <li>
            <Link href="/services" className="hover:text-glam-accent">
              Browse Services
            </Link>
          </li>
        </ul>
      </aside>
    </div>
  );
}
