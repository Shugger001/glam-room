export default function AdminSettingsPage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
      <h1 className="heading-display text-3xl">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Persist business hours, pricing rules, branding tokens, and Paystack keys metadata in{" "}
        <code className="text-glam-accent">settings</code> — never expose secrets to the client.
      </p>
    </div>
  );
}
