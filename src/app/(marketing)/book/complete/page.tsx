import { ButtonLink } from "@/components/ui/button";
import { BookPageShell } from "@/components/booking/book-page-shell";
import { BRAND } from "@/lib/constants/brand";
import { verifyAndApplyBookingPayment } from "@/lib/payments/paystack-booking-state";
import { isPaystackConfigured } from "@/lib/booking/deposit";

export const metadata = {
  title: "Booking Payment",
};

type BookCompletePageProps = {
  searchParams: Promise<{ reference?: string }>;
};

export default async function BookCompletePage({ searchParams }: BookCompletePageProps) {
  const params = await searchParams;
  const reference = params.reference?.trim();

  let status: "missing" | "success" | "failed" | "unconfigured" = "missing";
  let errorMessage: string | null = null;

  if (!reference) {
    status = "missing";
  } else if (!isPaystackConfigured()) {
    status = "unconfigured";
  } else {
    const result = await verifyAndApplyBookingPayment(reference);
    status = result.ok ? "success" : "failed";
    errorMessage = result.error ?? null;
  }

  return (
    <BookPageShell>
      <div className="mx-auto max-w-lg rounded-2xl border border-white/20 bg-glam-secondary/95 p-8 text-center shadow-premium backdrop-blur-md sm:p-10">
        {status === "success" ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">
              Deposit received
            </p>
            <h1 className="heading-display mt-4 text-3xl text-glam-primary">You&apos;re booked</h1>
            <p className="mt-4 text-sm leading-relaxed text-glam-muted">
              Your deposit was received and your appointment request is with the Glam Room team.
              We&apos;ll confirm via WhatsApp at {BRAND.links.phone}.
            </p>
            {reference ? (
              <p className="mt-3 text-xs text-glam-muted">Reference: {reference}</p>
            ) : null}
          </>
        ) : status === "failed" ? (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-red-600">
              Payment issue
            </p>
            <h1 className="heading-display mt-4 text-3xl text-glam-primary">
              Deposit not confirmed
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-glam-muted">
              {errorMessage ??
                "We could not confirm your payment. Your slot may not be secured until the deposit clears."}
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">
              Payment
            </p>
            <h1 className="heading-display mt-4 text-3xl text-glam-primary">Invalid link</h1>
            <p className="mt-4 text-sm leading-relaxed text-glam-muted">
              This payment link is missing or expired. Please return to booking and try again.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/book" variant="accent">
            Back to booking
          </ButtonLink>
          <ButtonLink href={BRAND.links.whatsapp} variant="outline">
            WhatsApp Glam Room
          </ButtonLink>
        </div>
      </div>
    </BookPageShell>
  );
}
