import { locationLabelFromId } from "@/lib/admin/access";
import { BOOKING_STATUS_OPTIONS } from "@/lib/admin/update-booking-status";
import { adminBtnPrimary } from "@/components/admin/admin-ui";
import { buildClientReplyLink } from "@/lib/notifications/whatsapp-links";
import { cn } from "@/lib/utils/cn";

export type AdminBookingRow = {
  id: string;
  start_at: string;
  status: string;
  location_id: string | null;
  staff_id?: string | null;
  client_name: string | null;
  client_phone: string | null;
  client_notes: string | null;
  admin_notes?: string | null;
  deposit_paid: boolean | null;
  deposit_amount: number | null;
  paystack_reference?: string | null;
  promotion_code?: string | null;
  profiles: { full_name?: string; phone?: string } | null;
  services: { name?: string } | null;
  staff?: { name?: string } | null;
};

export type StaffOption = { id: string; name: string };

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
  staffOptions?: StaffOption[];
  showReschedule?: boolean;
  showStaff?: boolean;
  showOps?: boolean;
  emptyMessage?: string;
};

export function BookingsTable({
  bookings,
  updateBookingStatus,
  staffOptions = [],
  showReschedule = true,
  showStaff = true,
  showOps = true,
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
            <th className={thClass}>Contact</th>
            <th className={thClass}>Service</th>
            <th className={thClass}>Location</th>
            {showStaff ? <th className={thClass}>Stylist</th> : null}
            <th className={thClass}>Deposit</th>
            {showOps ? <th className={thClass}>Ops</th> : null}
            <th className={thClass}>Status</th>
            {showReschedule ? <th className={thClass}>Reschedule</th> : null}
            {showOps ? <th className={thClass}>Internal note</th> : null}
            <th className={thClass}>Action</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const formId = `booking-form-${b.id}`;
            const profile = b.profiles;
            const clientName = b.client_name ?? profile?.full_name ?? "Guest";
            const clientPhone = b.client_phone ?? profile?.phone ?? "";
            const loc = locationLabelFromId(b.location_id) ?? "-";
            const serviceName = b.services?.name ?? "Service";
            const when = new Date(b.start_at).toLocaleString();
            const whatsappLink =
              clientPhone.length > 0
                ? buildClientReplyLink(clientPhone, clientName, serviceName, when)
                : null;

            const depositCell =
              typeof b.deposit_amount === "number" && Number(b.deposit_amount) > 0 ? (
                b.deposit_paid ? (
                  <span className="text-glam-accent">Paid</span>
                ) : (
                  <span className="text-amber-200/90">Pending</span>
                )
              ) : (
                "-"
              );

            return (
              <tr key={b.id} className="hover:bg-white/[0.03]">
                <td className={tdClass}>{when}</td>
                <td className={tdClass}>
                  <span className="font-medium text-white">{clientName}</span>
                  {b.client_notes ? (
                    <p className="mt-1 line-clamp-2 text-xs text-white/45">{b.client_notes}</p>
                  ) : null}
                </td>
                <td className={tdClass}>
                  {clientPhone ? (
                    <div className="space-y-1">
                      <p>{clientPhone}</p>
                      {whatsappLink ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white"
                        >
                          WhatsApp
                        </a>
                      ) : null}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className={tdClass}>{serviceName}</td>
                <td className={tdClass}>{loc}</td>
                {showStaff ? (
                  <td className={tdClass}>
                    {staffOptions.length > 0 ? (
                      <select
                        form={formId}
                        name="staff_id"
                        defaultValue={b.staff_id ?? "none"}
                        className={selectClass}
                      >
                        <option value="none" className="bg-glam-primary">
                          Unassigned
                        </option>
                        {staffOptions.map((s) => (
                          <option key={s.id} value={s.id} className="bg-glam-primary">
                            {s.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      (b.staff?.name ?? "-")
                    )}
                  </td>
                ) : null}
                <td className={tdClass}>{depositCell}</td>
                {showOps ? (
                  <td className={tdClass}>
                    <div className="space-y-1 text-xs text-white/50">
                      {b.paystack_reference ? (
                        <p title={b.paystack_reference}>
                          Ref: {b.paystack_reference.slice(0, 12)}…
                        </p>
                      ) : null}
                      {b.promotion_code ? <p>Promo: {b.promotion_code}</p> : null}
                      {!b.paystack_reference && !b.promotion_code ? "-" : null}
                    </div>
                  </td>
                ) : null}
                <td className={tdClass}>
                  <select
                    form={formId}
                    name="status"
                    defaultValue={b.status}
                    className={selectClass}
                  >
                    {BOOKING_STATUS_OPTIONS.map((s) => (
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
                {showOps ? (
                  <td className={tdClass}>
                    <input
                      form={formId}
                      type="text"
                      name="admin_notes"
                      defaultValue={b.admin_notes ?? ""}
                      placeholder="Team note"
                      className={inputClass}
                    />
                  </td>
                ) : null}
                <td className={tdClass}>
                  <button type="submit" form={formId} className={cn(adminBtnPrimary, "w-full sm:w-auto")}>
                    Save
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
