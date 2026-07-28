import { bulkConfirmPaidBookingsAction } from "@/lib/admin/bulk-booking-actions";
import { adminBtnPrimary } from "@/components/admin/admin-ui";

type BulkApproveBarProps = {
  paidAwaitingCount: number;
  locationId?: string | null;
};

export function BulkApproveBar({ paidAwaitingCount, locationId }: BulkApproveBarProps) {
  if (paidAwaitingCount <= 0) return null;

  return (
    <form
      action={bulkConfirmPaidBookingsAction}
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-glam-accent/30 bg-glam-accent/10 px-5 py-4"
    >
      <div>
        <p className="text-sm font-semibold text-white">
          {paidAwaitingCount} booking{paidAwaitingCount === 1 ? "" : "s"} paid deposit · awaiting confirm
        </p>
        <p className="mt-1 text-xs text-white/55">
          One tap confirms all deposit-paid requests to confirmed.
        </p>
      </div>
      {locationId ? <input type="hidden" name="location_id" value={locationId} /> : null}
      <button type="submit" className={adminBtnPrimary}>
        Confirm all ({paidAwaitingCount})
      </button>
    </form>
  );
}
