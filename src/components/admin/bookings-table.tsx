import { locationLabelFromId } from "@/lib/admin/access";
import { BOOKING_STATUS_OPTIONS } from "@/lib/admin/update-booking-status";
import { adminBtnPrimary } from "@/components/admin/admin-ui";
import { buildChaseDepositLink, buildClientReplyLink } from "@/lib/notifications/whatsapp-links";
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
  profiles: {
    full_name?: string;
    phone?: string;
    crm_tags?: string[] | null;
    crm_notes?: string | null;
  } | null;
  services: { name?: string } | null;
  staff?: { name?: string } | null;
};

export type StaffOption = { id: string; name: string };

const tableWrapClass =
  "hidden overflow-x-auto rounded-xl border border-white/10 bg-black/20 md:block [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]";
const tableClass = "w-full border-collapse text-sm";
const thClass =
  "border-b border-white/10 px-3 py-2.5 text-left text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45";
const tdClass = "border-b border-white/10 px-3 py-2.5 align-top text-white/85";
const inputClass =
  "w-full rounded-md border border-white/15 bg-transparent px-2.5 py-1.5 text-sm text-white";
const selectClass =
  "w-full rounded-md border border-white/15 bg-transparent px-2.5 py-1.5 text-sm text-white";

function bookingView(b: AdminBookingRow) {
  const profile = b.profiles;
  const clientName = b.client_name ?? profile?.full_name ?? "Guest";
  const clientPhone = b.client_phone ?? profile?.phone ?? "";
  const loc = locationLabelFromId(b.location_id) ?? "-";
  const serviceName = b.services?.name ?? "Service";
  const when = new Date(b.start_at).toLocaleString();
  const timeLabel = new Date(b.start_at).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const whatsappLink =
    clientPhone.length > 0
      ? buildClientReplyLink(clientPhone, clientName, serviceName, when)
      : null;
  const depositDue =
    !b.deposit_paid && typeof b.deposit_amount === "number" && Number(b.deposit_amount) > 0;
  const chaseDepositLink =
    depositDue && clientPhone.length > 0
      ? buildChaseDepositLink(
          clientPhone,
          clientName,
          serviceName,
          when,
          `₵${Number(b.deposit_amount).toFixed(0)}`,
        )
      : null;
  const crmTags = Array.isArray(profile?.crm_tags)
    ? profile.crm_tags.map(String).filter(Boolean)
    : [];
  const crmNotes = profile?.crm_notes?.trim() || "";
  const showQuickFloor =
    b.status === "confirmed" || b.status === "arrived" || b.status === "pending";

  return {
    clientName,
    clientPhone,
    loc,
    serviceName,
    when,
    timeLabel,
    whatsappLink,
    depositDue,
    chaseDepositLink,
    crmTags,
    crmNotes,
    showQuickFloor,
  };
}

function QuickFloorActions({
  bookingId,
  updateBookingStatus,
  dense = false,
}: {
  bookingId: string;
  updateBookingStatus: (formData: FormData) => Promise<void>;
  dense?: boolean;
}) {
  return (
    <div className={dense ? "grid grid-cols-3 gap-1.5" : "flex flex-wrap gap-1.5"}>
      {(
        [
          ["arrived", "Arrived", "accent"],
          ["completed", "Done", "default"],
          ["no_show", "No-show", "danger"],
        ] as const
      ).map(([status, label, tone]) => (
        <form key={`${bookingId}-${status}`} action={updateBookingStatus} className={dense ? "min-w-0" : undefined}>
          <input type="hidden" name="id" value={bookingId} />
          <input type="hidden" name="status" value={status} />
          <button
            type="submit"
            className={cn(
              "rounded-md border text-[0.65rem] font-semibold uppercase tracking-wider transition-[transform,background-color] duration-150 active:scale-[0.98]",
              dense
                ? "flex min-h-11 w-full items-center justify-center px-2"
                : "px-2.5 py-1.5",
              tone === "accent" &&
                "border-glam-accent/50 bg-glam-accent/15 text-glam-accent active:bg-glam-accent/25",
              tone === "danger" &&
                "border-red-400/40 bg-red-500/10 text-red-200 active:bg-red-500/20",
              tone === "default" &&
                "border-white/20 text-white/70 active:border-white/40 active:text-white",
            )}
          >
            {label}
          </button>
        </form>
      ))}
    </div>
  );
}

function MobileBookingCards({
  bookings,
  updateBookingStatus,
  markDepositPaid,
  staffOptions,
  showStaff,
  showOps,
}: {
  bookings: AdminBookingRow[];
  updateBookingStatus: (formData: FormData) => Promise<void>;
  markDepositPaid?: (formData: FormData) => Promise<void>;
  staffOptions: StaffOption[];
  showStaff: boolean;
  showOps: boolean;
}) {
  return (
    <ul className="space-y-2.5 md:hidden">
      {bookings.map((b) => {
        const v = bookingView(b);
        return (
          <li
            key={b.id}
            className="rounded-xl border border-white/10 bg-black/25 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-glam-accent">
                  {v.timeLabel}
                </p>
                <p className="mt-1 truncate font-medium text-white">{v.clientName}</p>
                <p className="mt-0.5 text-sm text-white/60">
                  {v.serviceName} · {v.loc}
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-white/15 px-2 py-1 text-[0.65rem] uppercase tracking-wider text-white/70">
                {b.status.replaceAll("_", " ")}
              </span>
            </div>

            {v.crmTags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {v.crmTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-glam-accent/35 bg-glam-accent/10 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-glam-accent"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-3 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
              {v.whatsappLink ? (
                <a
                  href={v.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-glam-accent px-3 text-xs font-semibold uppercase tracking-wider text-glam-primary active:scale-[0.98]"
                >
                  WhatsApp
                </a>
              ) : null}
              {v.chaseDepositLink ? (
                <a
                  href={v.chaseDepositLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-300/40 px-3 text-xs font-semibold uppercase tracking-wider text-amber-200 active:scale-[0.98]"
                >
                  Chase deposit
                </a>
              ) : null}
              {v.depositDue && markDepositPaid ? (
                <form action={markDepositPaid} className="contents">
                  <input type="hidden" name="id" value={b.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center rounded-md border border-white/20 px-3 text-xs font-semibold uppercase tracking-wider text-white/75 active:scale-[0.98]"
                  >
                    Mark paid
                  </button>
                </form>
              ) : null}
            </div>

            {v.showQuickFloor ? (
              <div className="mt-2.5">
                <QuickFloorActions bookingId={b.id} updateBookingStatus={updateBookingStatus} dense />
              </div>
            ) : null}

            <details className="mt-2.5 border-t border-white/10 pt-2">
              <summary className="cursor-pointer list-none py-2 text-xs font-semibold uppercase tracking-wider text-white/55 marker:content-none [&::-webkit-details-marker]:hidden">
                Edit booking
              </summary>
              <form action={updateBookingStatus} className="space-y-2 pb-1 pt-1">
                <input type="hidden" name="id" value={b.id} />
                <label className="block text-[0.65rem] uppercase tracking-wider text-white/45">
                  Status
                  <select name="status" defaultValue={b.status} className={cn(selectClass, "mt-1 min-h-11")}>
                    {BOOKING_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-glam-primary">
                        {s.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </label>
                {showStaff && staffOptions.length > 0 ? (
                  <label className="block text-[0.65rem] uppercase tracking-wider text-white/45">
                    Stylist
                    <select
                      name="staff_id"
                      defaultValue={b.staff_id ?? "none"}
                      className={cn(selectClass, "mt-1 min-h-11")}
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
                  </label>
                ) : null}
                {showOps ? (
                  <label className="block text-[0.65rem] uppercase tracking-wider text-white/45">
                    Note
                    <input
                      type="text"
                      name="admin_notes"
                      defaultValue={b.admin_notes ?? ""}
                      placeholder="Team note"
                      className={cn(inputClass, "mt-1 min-h-11")}
                    />
                  </label>
                ) : null}
                <button type="submit" className={cn(adminBtnPrimary, "w-full !min-h-11 !rounded-md")}>
                  Save
                </button>
              </form>
            </details>
          </li>
        );
      })}
    </ul>
  );
}

type BookingsTableProps = {
  bookings: AdminBookingRow[];
  updateBookingStatus: (formData: FormData) => Promise<void>;
  markDepositPaid?: (formData: FormData) => Promise<void>;
  staffOptions?: StaffOption[];
  showReschedule?: boolean;
  showStaff?: boolean;
  showOps?: boolean;
  emptyMessage?: string;
};

export function BookingsTable({
  bookings,
  updateBookingStatus,
  markDepositPaid,
  staffOptions = [],
  showReschedule = true,
  showStaff = true,
  showOps = true,
  emptyMessage = "No appointments match this filter.",
}: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center">
        <p className="text-sm text-white/55">{emptyMessage}</p>
        <a
          href="/admin/appointments"
          className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white"
        >
          Clear filters
        </a>
      </div>
    );
  }

  return (
    <>
      <MobileBookingCards
        bookings={bookings}
        updateBookingStatus={updateBookingStatus}
        markDepositPaid={markDepositPaid}
        staffOptions={staffOptions}
        showStaff={showStaff}
        showOps={showOps}
      />

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
              <th className={thClass}>When</th>
              <th className={thClass}>Client</th>
              <th className={thClass}>Contact</th>
              <th className={thClass}>Service</th>
              <th className={thClass}>Shop</th>
              {showStaff ? <th className={thClass}>Stylist</th> : null}
              <th className={thClass}>Deposit</th>
              {showOps ? <th className={thClass}>Ops</th> : null}
              <th className={thClass}>Status</th>
              {showReschedule ? <th className={thClass}>Reschedule</th> : null}
              {showOps ? <th className={thClass}>Note</th> : null}
              <th className={thClass}>Save</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const formId = `booking-form-${b.id}`;
              const v = bookingView(b);

              const depositCell =
                typeof b.deposit_amount === "number" && Number(b.deposit_amount) > 0 ? (
                  <div className="space-y-1">
                    {b.deposit_paid ? (
                      <span className="text-glam-accent">Paid</span>
                    ) : (
                      <span className="text-amber-200/90">Pending</span>
                    )}
                    {v.chaseDepositLink ? (
                      <a
                        href={v.chaseDepositLink}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs font-semibold uppercase tracking-wider text-amber-200/90 hover:text-white"
                      >
                        Chase
                      </a>
                    ) : null}
                    {v.depositDue && markDepositPaid ? (
                      <form action={markDepositPaid}>
                        <input type="hidden" name="id" value={b.id} />
                        <button
                          type="submit"
                          className="text-xs font-semibold uppercase tracking-wider text-white/55 hover:text-glam-accent"
                        >
                          Mark paid
                        </button>
                      </form>
                    ) : null}
                  </div>
                ) : (
                  "-"
                );

              return (
                <tr key={b.id} className="hover:bg-white/[0.03]">
                  <td className={tdClass}>{v.when}</td>
                  <td className={tdClass}>
                    <span className="font-medium text-white">{v.clientName}</span>
                    {v.crmTags.length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {v.crmTags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md border border-glam-accent/35 bg-glam-accent/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-glam-accent"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {v.crmNotes ? (
                      <p className="mt-1 line-clamp-2 text-xs text-glam-accent/80">CRM: {v.crmNotes}</p>
                    ) : null}
                    {b.client_notes ? (
                      <p className="mt-1 line-clamp-2 text-xs text-white/45">{b.client_notes}</p>
                    ) : null}
                  </td>
                  <td className={tdClass}>
                    {v.clientPhone ? (
                      <div className="space-y-1">
                        <p>{v.clientPhone}</p>
                        {v.whatsappLink ? (
                          <a
                            href={v.whatsappLink}
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
                  <td className={tdClass}>{v.serviceName}</td>
                  <td className={tdClass}>{v.loc}</td>
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
                    <select form={formId} name="status" defaultValue={b.status} className={selectClass}>
                      {BOOKING_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="bg-glam-primary">
                          {s.replaceAll("_", " ")}
                        </option>
                      ))}
                    </select>
                    {v.showQuickFloor ? (
                      <div className="mt-2">
                        <QuickFloorActions bookingId={b.id} updateBookingStatus={updateBookingStatus} />
                      </div>
                    ) : null}
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
                    <button
                      type="submit"
                      form={formId}
                      className={cn(adminBtnPrimary, "!rounded-md w-full sm:w-auto")}
                    >
                      Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function BookingsByTimeGroups({
  bookings,
  updateBookingStatus,
  markDepositPaid,
  staffOptions = [],
}: {
  bookings: AdminBookingRow[];
  updateBookingStatus: (formData: FormData) => Promise<void>;
  markDepositPaid?: (formData: FormData) => Promise<void>;
  staffOptions?: StaffOption[];
}) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center">
        <p className="text-sm text-white/55">No appointments match this filter.</p>
      </div>
    );
  }

  const groups = new Map<string, AdminBookingRow[]>();
  for (const b of bookings) {
    const key = new Date(b.start_at).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const list = groups.get(key) ?? [];
    list.push(b);
    groups.set(key, list);
  }

  return (
    <div className="space-y-5">
      {[...groups.entries()].map(([slot, rows]) => (
        <section key={slot}>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-glam-accent">
              {slot}
            </h2>
            <span className="rounded-md border border-white/15 px-2 py-0.5 text-[0.65rem] text-white/55">
              {rows.length}
            </span>
          </div>
          <BookingsTable
            bookings={rows}
            updateBookingStatus={updateBookingStatus}
            markDepositPaid={markDepositPaid}
            staffOptions={staffOptions}
          />
        </section>
      ))}
    </div>
  );
}
