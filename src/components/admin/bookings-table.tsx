import { locationLabelFromId } from "@/lib/admin/access";
import { adminBtnPrimary } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils/cn";

export type AdminBookingRow = {
  id: string;
  start_at: string;
  status: string;
  location_id: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_notes: string | null;
  deposit_paid: boolean | null;
  deposit_amount: number | null;
  profiles: { full_name?: string; phone?: string } | null;
  services: { name?: string } | null;
  staff?: { name?: string } | null;
};

const statusOptions = [
  "awaiting_approval",
  "confirmed",
  "rejected",
  "cancelled",
  "completed",
] as const;

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-white/10 bg-black/20 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]";
const tableClass = "w-full border-collapse text-sm";
const thClass =
  "border-b border-white/10 px-4 py-3 text-left text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45";
const tdClass = "border-b border-white/10 px-4 py-3 align-top text-white/85";
const inputClass =
  "w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";
const selectClass =
  "w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm text-white";

type BookingsTableProps = {
  bookings: AdminBookingRow[];
  updateBookingStatus: (formData: FormData) => Promise<void>;
  showReschedule?: boolean;
  showStaff?: boolean;
  emptyMessage?: string;
};

export function BookingsTable({
  bookings,
  updateBookingStatus,
  showReschedule = true,
  showStaff = true,
  emptyMessage = "No appointments match this filter.",
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return <p className="text-sm text-white/55">{emptyMessage}</p>;
  }

  return (
    <div className={tableWrapClass}>
      <div className="hidden" aria-hidden>
        {bookings.map((b) => (
          <form key={`form-${b.id}`} id={`booking-form-${b.id}`} action={updateBookingStatus}>
            <input type="hidden" name="id" value={b.id} />
          </form>
        ))}
      </div>
      <table className={tableClass}>
        <thead>
          <tr>
            <th className={thClass}>Date & time</th>
            <th className={thClass}>Client</th>
            <th className={thClass}>Phone</th>
            <th className={thClass}>Service</th>
            <th className={thClass}>Location</th>
            {showStaff ? <th className={thClass}>Staff</th> : null}
            <th className={thClass}>Deposit</th>
            <th className={thClass}>Status</th>
            {showReschedule ? <th className={thClass}>Reschedule</th> : null}
            <th className={thClass}>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const formId = `booking-form-${b.id}`;
            const profile = b.profiles;
            const clientName = b.client_name ?? profile?.full_name ?? "Guest";
            const clientPhone = b.client_phone ?? profile?.phone ?? "—";
            const loc = locationLabelFromId(b.location_id) ?? "—";
            const staffName = b.staff?.name ?? "—";
            const serviceName = b.services?.name ?? "Service";

            const depositCell =
              typeof b.deposit_amount === "number" && Number(b.deposit_amount) > 0 ? (
                b.deposit_paid ? (
                  <span className="text-glam-accent">Paid</span>
                ) : (
                  <span className="text-amber-200/90">Pending</span>
                )
              ) : (
                "—"
              );

            return (
              <tr key={b.id} className="hover:bg-white/[0.03]">
                <td className={tdClass}>{new Date(b.start_at).toLocaleString()}</td>
                <td className={tdClass}>
                  <span className="font-medium text-white">{clientName}</span>
                  {b.client_notes ? (
                    <p className="mt-1 line-clamp-2 text-xs text-white/45">{b.client_notes}</p>
                  ) : null}
                </td>
                <td className={tdClass}>{clientPhone}</td>
                <td className={tdClass}>{serviceName}</td>
                <td className={tdClass}>{loc}</td>
                {showStaff ? <td className={tdClass}>{staffName}</td> : null}
                <td className={tdClass}>{depositCell}</td>
                <td className={tdClass}>
                  <select
                    form={formId}
                    name="status"
                    defaultValue={b.status}
                    className={selectClass}
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s} className="bg-glam-primary">
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </td>
                {showReschedule ? (
                  <td className={tdClass}>
                    <input
                      form={formId}
                      type="datetime-local"
                      name="start_at"
                      defaultValue={new Date(b.start_at).toISOString().slice(0, 16)}
                      className={inputClass}
                    />
                  </td>
                ) : null}
                <td className={tdClass}>
                  <button type="submit" form={formId} className={cn(adminBtnPrimary, "w-full sm:w-auto")}>
                    Update
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
