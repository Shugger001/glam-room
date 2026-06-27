import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { BOOKING_TIME_SLOTS } from "@/lib/validation/booking";
import { AdminBtnPrimary } from "@/components/admin/admin-ui";
import type { SalonService } from "@/lib/constants/services";

type StaffOption = { id: string; name: string };

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

export function WalkInBookingForm({
  services,
  staff,
  defaultLocationId,
  createWalkInBooking,
}: {
  services: SalonService[];
  staff: StaffOption[];
  defaultLocationId?: string | null;
  createWalkInBooking: (formData: FormData) => Promise<void>;
}) {
  const locations = defaultLocationId
    ? SALON_LOCATIONS.filter((l) => l.id === defaultLocationId)
    : SALON_LOCATIONS;

  const today = new Date().toISOString().slice(0, 10);

  return (
    <details className="group rounded-2xl border border-glam-accent/25 bg-glam-accent/5 open:bg-black/20">
      <summary className="cursor-pointer list-none px-5 py-4 font-display text-lg text-white marker:content-none [&::-webkit-details-marker]:hidden">
        + Add walk-in booking
      </summary>
      <form action={createWalkInBooking} className="space-y-4 border-t border-white/10 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block text-xs text-white/60">
            Shop
            <select name="locationId" required defaultValue={defaultLocationId ?? ""} className={inputClass}>
              <option value="" className="bg-glam-primary">
                Select shop
              </option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-glam-primary">
                  {loc.area}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/60">
            Service
            <select name="serviceId" required className={inputClass}>
              <option value="" className="bg-glam-primary">
                Select service
              </option>
              {services.map((s) => (
                <option key={s.id} value={s.id} className="bg-glam-primary">
                  {s.name} · {s.durationMinutes}m · ₵{s.price}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/60">
            Stylist
            <select name="staffId" className={inputClass}>
              <option value="" className="bg-glam-primary">
                Unassigned
              </option>
              {staff.map((s) => (
                <option key={s.id} value={s.id} className="bg-glam-primary">
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/60">
            Date
            <input type="date" name="bookingDate" required defaultValue={today} className={inputClass} />
          </label>
          <label className="block text-xs text-white/60">
            Time
            <select name="bookingTime" required className={inputClass}>
              {BOOKING_TIME_SLOTS.map((slot) => (
                <option key={slot.value} value={slot.value} className="bg-glam-primary">
                  {slot.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-white/60">
            Status
            <select name="status" defaultValue="confirmed" className={inputClass}>
              <option value="confirmed" className="bg-glam-primary">
                Confirmed
              </option>
              <option value="awaiting_approval" className="bg-glam-primary">
                Awaiting approval
              </option>
            </select>
          </label>
          <label className="block text-xs text-white/60">
            Client name
            <input name="clientName" required placeholder="Client name" className={inputClass} />
          </label>
          <label className="block text-xs text-white/60">
            Phone
            <input name="clientPhone" required placeholder="024XXXXXXX" className={inputClass} />
          </label>
          <label className="flex items-end gap-2 pb-2 text-xs text-white/60">
            <input type="checkbox" name="waiveDeposit" value="true" defaultChecked className="rounded" />
            Waive ₵50 deposit (walk-in)
          </label>
        </div>
        <label className="block text-xs text-white/60">
          Client note
          <input name="clientNotes" placeholder="Optional" className={inputClass} />
        </label>
        <label className="block text-xs text-white/60">
          Internal note
          <input name="adminNotes" placeholder="Team only" className={inputClass} />
        </label>
        <div className="flex gap-3">
          <AdminBtnPrimary>Create walk-in</AdminBtnPrimary>
        </div>
      </form>
    </details>
  );
}
