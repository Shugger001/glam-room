"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button";

type ReviewMeta = {
  client_name: string;
  service: string;
  visit_date: string;
  status: string;
  already_submitted: boolean;
};

export function ReviewForm({ token }: { token: string }) {
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/reviews/submit?token=${encodeURIComponent(token)}`);
        const data = (await res.json()) as ReviewMeta & { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Invalid review link.");
          return;
        }
        setMeta(data);
        if (data.already_submitted) setSubmitted(true);
      } catch {
        setError("Could not load review form.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, quote, rating }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Could not submit review.");
        return;
      }
      setSubmitted(true);
      toast.success("Thank you! Your review is pending approval.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-glam-border bg-glam-secondary px-4 py-3 text-sm text-glam-primary outline-none focus:border-glam-accent focus:ring-1 focus:ring-glam-accent";

  if (loading) {
    return <p className="text-center text-glam-muted">Loading your review form…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700">
        <p>{error}</p>
        <ButtonLink href="/" variant="outline" className="mt-6">
          Back to homepage
        </ButtonLink>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-glam-accent/30 bg-glam-accent/5 px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-glam-accent">Thank you</p>
        <h2 className="heading-display mt-4 text-3xl text-glam-primary">Review received</h2>
        <p className="mt-4 text-glam-muted">Thank you. We got your review.</p>
        <ButtonLink href="/" variant="accent" className="mt-8">
          Back home
        </ButtonLink>
      </div>
    );
  }

  if (!meta || meta.status !== "completed") {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-amber-900">
        <p>Your review link will be active once your appointment is marked complete.</p>
        <ButtonLink href="/track" variant="outline" className="mt-6">
          My booking
        </ButtonLink>
      </div>
    );
  }

  const visitDate = new Date(meta.visit_date).toLocaleDateString("en-GH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border border-glam-border bg-glam-background px-4 py-4 text-sm text-glam-muted">
        <p>
          Hi <strong className="text-glam-primary">{meta.client_name}</strong>, how was your{" "}
          <strong className="text-glam-primary">{meta.service}</strong> on {visitDate}?
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-glam-primary">Rating</p>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`flex h-11 w-11 items-center justify-center rounded-full border text-lg transition ${
                n <= rating
                  ? "border-glam-accent bg-glam-accent/15 text-glam-accent"
                  : "border-glam-border text-glam-muted"
              }`}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm font-medium text-glam-primary">
        Your review
        <textarea
          rows={5}
          required
          minLength={10}
          maxLength={600}
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Tell us about your experience…"
          className={inputClass}
        />
      </label>

      <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit review"}
      </Button>
    </form>
  );
}
