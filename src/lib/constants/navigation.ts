export const PRIMARY_NAV = [
  { href: "/", label: "Home" },
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

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/appointments", label: "Appointments" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
] as const;
