export type AdminNavItem = { href: string; label: string };

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const PRIMARY_NAV = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/experts", label: "Our Experts" },
  { href: "/testimonials", label: "Testimonials" },
  { href: "/faq", label: "FAQs" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_NAV = {
  salon: [
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/gallery", label: "Gallery" },
    { href: "/experts", label: "Our Experts" },
  ],
  book: [
    { href: "/book", label: "Book Appointment" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/faq", label: "FAQs" },
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
    items: [{ href: "/admin/settings", label: "Settings" }],
  },
];

/** Flat list derived from groups (legacy helpers). */
export const ADMIN_NAV = ADMIN_NAV_GROUPS.flatMap((g) => g.items);

export const STAFF_ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    id: "operations",
    label: "Operations",
    items: [{ href: "/admin/appointments", label: "Appointments" }],
  },
];

export const STAFF_ADMIN_NAV = STAFF_ADMIN_NAV_GROUPS.flatMap((g) => g.items);
