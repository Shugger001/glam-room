import { locationLabelFromId } from "@/lib/admin/access";

export type CustomerBookingRow = {
  id: string;
  user_id: string | null;
  start_at: string;
  status: string;
  location_id: string | null;
  client_phone: string | null;
  services: { name?: string } | null;
};

export function CustomerBookingHistory({
  bookings,
  profileId,
  phone,
}: {
  bookings: CustomerBookingRow[];
  profileId: string;
  phone: string | null;
}) {
  const rows = bookings.filter(
    (b) => b.user_id === profileId || (phone && b.client_phone && b.client_phone.includes(phone.replace(/\D/g, "").slice(-9))),
  );

  if (rows.length === 0) {
    return (
      <p className="mt-3 text-xs text-white/45">
        No bookings linked yet.{" "}
        {phone ? (
          <a href={`/admin/appointments?q=${encodeURIComponent(phone)}`} className="text-glam-accent hover:underline">
            Search by phone
          </a>
        ) : null}
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-2">
      {rows.slice(0, 5).map((b) => (
        <li key={b.id} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
          <span className="font-medium text-white/90">{b.services?.name ?? "Service"}</span>
          {" · "}
          {new Date(b.start_at).toLocaleString()}
          {" · "}
          {locationLabelFromId(b.location_id) ?? "—"}
          {" · "}
          <span className="text-glam-accent">{b.status.replaceAll("_", " ")}</span>
        </li>
      ))}
      {rows.length > 5 ? <li className="text-xs text-white/40">+{rows.length - 5} more</li> : null}
    </ul>
  );
}
