"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h2 className="heading-display text-3xl text-white">Dashboard error</h2>
      <p className="mt-3 text-sm text-white/65">{error.message || "Something went wrong."}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-full bg-glam-accent px-6 py-3 text-sm font-semibold text-glam-primary"
      >
        Try again
      </button>
    </div>
  );
}
