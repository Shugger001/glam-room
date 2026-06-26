import { AdminPanel } from "@/components/admin/admin-ui";

export default function AdminSettingsPage() {
  return (
    <AdminPanel>
      <h1 className="font-display text-3xl">Settings</h1>
      <p className="mt-3 max-w-2xl text-sm text-white/55">
        Persist business hours, pricing rules, branding tokens, and notification settings in{" "}
        <code className="text-glam-accent">settings</code> — never expose secrets to the client.
      </p>
    </AdminPanel>
  );
}
