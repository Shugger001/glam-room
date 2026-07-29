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
      <div className="mx-auto max-w-lg border border-glam-border/70 bg-glam-secondary px-6 py-10 text-center sm:px-10 sm:py-12">
        {status === "success" ? (
          <>
            <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-muted">
              Deposit received
            </p>
            <h1 className="heading-display mt-3 text-3xl text-glam-primary sm:text-4xl">
              You&apos;re booked
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-glam-muted sm:text-base">
              Your deposit is with Glam Room. We&apos;ll confirm the chair on WhatsApp at{" "}
              {BRAND.links.phone}.
            </p>
            {reference ? (
              <p className="mt-3 text-xs tabular-nums text-glam-muted">Ref: {reference}</p>
            ) : null}
            <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-glam-muted">
              <li className="border-l border-glam-accent/40 pl-3">
                Keep an eye on WhatsApp for confirmation.
              </li>
              <li className="border-l border-glam-accent/40 pl-3">
                Track or reschedule anytime with Find my booking.
              </li>
            </ul>
          </>
        ) : status === "failed" ? (
          <>
            <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-red-700/80">
              Payment issue
            </p>
            <h1 className="heading-display mt-3 text-3xl text-glam-primary sm:text-4xl">
              Deposit not confirmed
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-glam-muted sm:text-base">
              {errorMessage ??
                "We could not confirm your payment. Your slot may not be secured until the deposit clears."}
            </p>
          </>
        ) : (
          <>
            <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-glam-muted">
              Payment
            </p>
            <h1 className="heading-display mt-3 text-3xl text-glam-primary sm:text-4xl">
              Invalid link
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-glam-muted sm:text-base">
              This payment link is missing or expired. Return to booking and try again.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {status === "success" ? (
            <>
              <ButtonLink href="/track" variant="accent" className="!rounded-none">
                Find my booking
              </ButtonLink>
              <ButtonLink href={BRAND.links.whatsapp} variant="outline" className="!rounded-none">
                WhatsApp Glam Room
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/book" variant="accent" className="!rounded-none">
                Back to booking
              </ButtonLink>
              <ButtonLink href={BRAND.links.whatsapp} variant="outline" className="!rounded-none">
                WhatsApp Glam Room
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </BookPageShell>
  );
}
