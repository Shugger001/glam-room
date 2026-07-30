"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  clockInStaffAction,
  clockOutStaffAction,
  formatShiftDuration,
  type StaffPresenceMember,
} from "@/lib/admin/staff-clock";
import { SALON_LOCATIONS } from "@/lib/constants/locations";
import { adminBtnOutline, adminBtnPrimary } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils/cn";

type StaffClockStripProps = {
  members: StaffPresenceMember[];
  /** Staff shop scope — null for super admin (all shops). */
  locationScope: string | null;
  isSuperAdmin: boolean;
  shopLabel?: string | null;
};

function PendingButton({
  className,
  idleLabel,
  pendingLabel,
}: {
  className?: string;
  idleLabel: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={cn(className, pending && "opacity-60")}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

function LiveDuration({ clockInAt }: { clockInAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return <>{formatShiftDuration(clockInAt, null, now)}</>;
}

export function StaffClockStrip({
  members,
  locationScope,
  isSuperAdmin,
  shopLabel,
}: StaffClockStripProps) {
  const onFloor = members.filter(
    (m) => m.openShift && (!locationScope || m.openShift.locationId === locationScope),
  );
  const elsewhere = members.filter(
    (m) => m.openShift && locationScope && m.openShift.locationId !== locationScope,
  );
  const offFloor = members.filter((m) => !m.openShift);
  const defaultLocationId = locationScope ?? SALON_LOCATIONS[0]?.id ?? "";
  const canClockHere = Boolean(defaultLocationId) || isSuperAdmin;

  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm text-white/55">
        No active team members yet. Add staff under Team to enable clock-in.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-3.5 backdrop-blur-sm sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-glam-accent">
            Front desk clock-in{shopLabel ? ` · ${shopLabel}` : ""}
          </p>
          <p className="mt-1 text-sm text-white">
            {onFloor.length} on floor
            <span className="text-white/45"> · {offFloor.length} off</span>
            {elsewhere.length > 0 ? (
              <span className="text-white/45"> · {elsewhere.length} elsewhere</span>
            ) : null}
          </p>
        </div>
        <a
          href="/admin/attendance"
          className="text-xs font-semibold uppercase tracking-wider text-glam-accent hover:text-white"
        >
          Attendance log
        </a>
      </div>

      {onFloor.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {onFloor.map((m) => (
            <li
              key={m.staffId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {m.name}
                  {m.isFrontDesk ? (
                    <span className="ml-2 text-[0.65rem] font-semibold uppercase tracking-wider text-glam-accent">
                      Desk
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-white/55">
                  {m.openShift?.locationLabel}
                  {" · in "}
                  <LiveDuration clockInAt={m.openShift!.clockInAt} />
                  {" · "}
                  {new Date(m.openShift!.clockInAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <form
                action={clockOutStaffAction}
                className="flex flex-wrap items-center gap-2"
                onSubmit={(event) => {
                  if (!window.confirm(`Clock out ${m.name}?`)) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="shift_id" value={m.openShift!.id} />
                <input
                  type="text"
                  name="notes"
                  placeholder="Note (optional)"
                  maxLength={240}
                  aria-label={`Clock-out note for ${m.name}`}
                  className="w-28 rounded-md border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white placeholder:text-white/35 sm:w-36"
                />
                <PendingButton
                  className={cn(adminBtnOutline, "min-h-10")}
                  idleLabel="Clock out"
                  pendingLabel="…"
                />
              </form>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs text-white/45">Nobody clocked in yet.</p>
      )}

      {elsewhere.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {elsewhere.map((m) => (
            <li
              key={m.staffId}
              className="rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/80"
            >
              {m.name} · already in at {m.openShift?.locationLabel}
            </li>
          ))}
        </ul>
      ) : null}

      {offFloor.length > 0 ? (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-white/40">
            Clock in
          </p>
          {!canClockHere ? (
            <p className="text-xs text-amber-200/80">
              Assign this staff account to a shop before clocking anyone in.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {offFloor.map((m) => (
                <li key={m.staffId}>
                  <form
                    action={clockInStaffAction}
                    className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-black/15 px-2.5 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-white">{m.name}</p>
                      <p className="truncate text-[0.7rem] text-white/45">
                        {m.isFrontDesk ? "Front desk" : m.role}
                      </p>
                    </div>
                    {isSuperAdmin && !locationScope ? (
                      <select
                        name="location_id"
                        defaultValue={defaultLocationId}
                        aria-label={`Shop for ${m.name}`}
                        className="max-w-[7.5rem] rounded-md border border-white/20 bg-transparent px-2 py-1.5 text-xs text-white"
                      >
                        {SALON_LOCATIONS.map((loc) => (
                          <option key={loc.id} value={loc.id} className="bg-glam-primary text-white">
                            {loc.area}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input type="hidden" name="location_id" value={defaultLocationId} />
                    )}
                    <input type="hidden" name="staff_id" value={m.staffId} />
                    <PendingButton
                      className={cn(adminBtnPrimary, "min-h-10 shrink-0 px-3 text-xs")}
                      idleLabel="In"
                      pendingLabel="…"
                    />
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
