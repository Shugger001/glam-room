import type { Metadata } from "next";
import { ReviewForm } from "@/components/reviews/review-form";
import { PageHero } from "@/components/marketing/page-hero";
import { Section } from "@/components/ui/section";
import { BRAND } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "Leave a Review",
  description: `Share your Glam Room experience with ${BRAND.fullName}.`,
  robots: { index: false, follow: false },
};

type ReviewPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;
  const token = params.token?.trim() ?? "";

  return (
    <>
      <PageHero
        eyebrow="Review"
        title="How Was Your Visit?"
        description="Your feedback helps us keep Glam Room glowing for every queen who walks in."
      />
      <Section background="white" className="!pt-0">
        <div className="mx-auto max-w-lg">
          {token ? (
            <ReviewForm token={token} />
          ) : (
            <p className="rounded-2xl border border-glam-border bg-glam-background px-6 py-8 text-center text-glam-muted">
              This review link is invalid. Check the SMS we sent after your appointment or WhatsApp
              us for help.
            </p>
          )}
        </div>
      </Section>
    </>
  );
}
