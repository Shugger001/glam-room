import { adminBtnOutline } from "@/components/admin/admin-ui";

const links = [
  { href: "/admin/appointments?range=today", label: "Today's schedule" },
  { href: "/admin/attendance", label: "Staff clock-in" },
  { href: "/admin/appointments?status=awaiting_approval", label: "Approval queue" },
  { href: "/admin/messages?filter=unread", label: "Messages" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export function AdminQuickLinks() {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a key={link.href} href={link.href} className={adminBtnOutline}>
          {link.label}
        </a>
      ))}
    </div>
  );
}
