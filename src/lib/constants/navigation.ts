export type AdminNavItem = { href: string; label: string };

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const PRIMARY_NAV = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "Shops" },
  { href: "/experts", label: "Team" },
  { href: "/testimonials", label: "Reviews" },
  { href: "/faq", label: "Help" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_NAV = {
  salon: [
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "Shops" },
    { href: "/experts", label: "Team" },
    { href: "/testimonials", label: "Reviews" },
  ],
  book: [
    { href: "/book", label: "Book" },
    { href: "/track", label: "My Booking" },
    { href: "/faq", label: "Help" },
    { href: "/contact", label: "Contact" },
  ],
} as const;

/** Super-admin navigation — grouped by workflow. */
export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/appointments", label: "Appointments" },
      { href: "/admin/attendance", label: "Attendance" },
      { href: "/admin/messages", label: "Messages" },
      { href: "/admin/customers", label: "CRM" },
    ],
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/admin/services", label: "Services" },
      { href: "/admin/gallery", label: "Gallery" },
      { href: "/admin/staff", label: "Staff" },
      { href: "/admin/testimonials", label: "Testimonials" },
      { href: "/admin/promotions", label: "Promotions" },
      { href: "/admin/content", label: "Site content" },
    ],
  },
  {
    id: "insights",
    label: "Insights",
    items: [{ href: "/admin/analytics", label: "Analytics" }],
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/admin/settings", label: "Settings" },
      { href: "/admin/audit", label: "Audit log" },
    ],
  },
];

/** Flat list derived from groups (legacy helpers). */
export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export const STAFF_ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/admin", label: "Today" },
      { href: "/admin/appointments", label: "Appointments" },
      { href: "/admin/attendance", label: "Attendance" },
    ],
  },
];

export const STAFF_ADMIN_NAV = STAFF_ADMIN_NAV_GROUPS.flatMap((g) => g.items);
