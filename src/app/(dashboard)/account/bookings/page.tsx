import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/button";

export default async function AccountBookingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = user
    ? await supabase
        .from("bookings")
        .select("id, start_at, status, location_type, services(name)")
        .eq("user_id", user.id)
        .order("start_at", { ascending: false })
    : { data: [] };

  return (
    <div className="space-y-4 rounded-2xl border border-glam-border bg-glam-secondary p-6 sm:p-8">
      <p className="heading-display text-2xl text-glam-primary">My Appointments</p>
      {(data ?? []).length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-glam-muted">No appointments yet.</p>
          <ButtonLink href="/book" variant="accent" className="mt-4">
            Book Now
          </ButtonLink>
        </div>
      ) : (
        <ul className="space-y-3">
          {(data ?? []).map((b) => (
            <li key={b.id} className="rounded-xl border border-glam-border bg-glam-background p-4">
              <p className="font-medium text-glam-primary">
                {(b.services as { name?: string } | null)?.name ?? "Service"}
              </p>
              <p className="text-sm text-glam-muted">{new Date(b.start_at).toLocaleString()}</p>
              <span className="mt-2 inline-flex rounded-full border border-glam-accent/35 bg-glam-accent/10 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-glam-primary">
                {b.status.replaceAll("_", " ")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
