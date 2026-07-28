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

export function buildWalkInRebookHref(input: {
  name?: string | null;
  phone?: string | null;
  locationId?: string | null;
}) {
  const qs = new URLSearchParams({ walkin: "1" });
  if (input.name?.trim()) qs.set("name", input.name.trim());
  if (input.phone?.trim()) qs.set("phone", input.phone.trim());
  if (input.locationId?.trim()) qs.set("shop", input.locationId.trim());
  return `/admin/appointments?${qs.toString()}`;
}

export function CustomerBookingHistory({
  bookings,
  profileId,
  phone,
  clientName,
}: {
  bookings: CustomerBookingRow[];
  profileId: string;
  phone: string | null;
  clientName?: string | null;
}) {
  const rows = bookings.filter(
    (b) =>
      b.user_id === profileId ||
      (phone && b.client_phone && b.client_phone.includes(phone.replace(/\D/g, "").slice(-9))),
  );

  const lastLocation = rows[0]?.location_id ?? null;
  const rebookHref = buildWalkInRebookHref({
    name: clientName,
    phone,
    locationId: lastLocation,
  });

  if (rows.length === 0) {
    return (
      <div className="mt-3 space-y-2">
        <a
          href={rebookHref}
          className="inline-flex rounded-full border border-glam-accent/40 bg-glam-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-glam-accent hover:bg-glam-accent/20"
        >
          Book again
        </a>
        <p className="text-xs text-white/45">
          No bookings linked yet.{" "}
          {phone ? (
            <a
              href={`/admin/appointments?q=${encodeURIComponent(phone)}`}
              className="text-glam-accent hover:underline"
            >
              Search by phone
            </a>
          ) : null}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <a
        href={rebookHref}
        className="inline-flex rounded-full border border-glam-accent/40 bg-glam-accent/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-glam-accent hover:bg-glam-accent/20"
      >
        Book again
      </a>
      <ul className="space-y-2">
        {rows.slice(0, 5).map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70"
          >
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
    </div>
  );
}
