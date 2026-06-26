export async function captureServerException(error: unknown, context?: Record<string, unknown>) {
  if (!process.env.SENTRY_DSN) return;
  try {
    const Sentry = await import("@sentry/node");
    Sentry.captureException(error, { extra: context });
  } catch {
    /* Sentry optional */
  }
}
