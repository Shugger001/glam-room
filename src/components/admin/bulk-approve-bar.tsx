import { bulkConfirmPaidBookingsAction } from "@/lib/admin/bulk-booking-actions";
import { adminBtnPrimary } from "@/components/admin/admin-ui";
import { cn } from "@/lib/utils/cn";

type BulkApproveBarProps = {
  paidAwaitingCount: number;
  locationId?: string | null;
};

export function BulkApproveBar({ paidAwaitingCount, locationId }: BulkApproveBarProps) {
  if (paidAwaitingCount <= 0) return null;

  return (
    <form
      action={bulkConfirmPaidBookingsAction}
      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glam-accent/30 bg-glam-accent/10 px-3 py-3 sm:px-4"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-white">
          {paidAwaitingCount} paid · awaiting confirm
        </p>
        <p className="mt-0.5 hidden text-xs text-white/55 sm:block">
          Confirms deposit-paid requests and notifies each client.
        </p>
      </div>
      {locationId ? <input type="hidden" name="location_id" value={locationId} /> : null}
      <button type="submit" className={cn(adminBtnPrimary, "!min-h-11")}>
        Confirm all ({paidAwaitingCount})
      </button>
    </form>
  );
}
