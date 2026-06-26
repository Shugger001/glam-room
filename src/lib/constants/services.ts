export type ServiceCategory =
  | "hair-styling"
  | "wig-installation"
  | "wig-revamp"
  | "hair-coloring"
  | "hair-treatment"
  | "braids"
  | "makeup"
  | "lashes"
  | "bridal";

export type SalonService = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ServiceCategory;
  durationMinutes: number;
  price: number;
  image: string;
  featured?: boolean;
};

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  "hair-styling": "Hair Styling",
  "wig-installation": "Wig Installation",
  "wig-revamp": "Wig Revamp",
  "hair-coloring": "Hair Coloring",
  "hair-treatment": "Hair Treatment",
  braids: "Braids",
  makeup: "Makeup",
  lashes: "Lashes",
  bridal: "Bridal",
};

export const SALON_SERVICES: SalonService[] = [
  {
    id: "a1000001-0001-4000-8000-000000000001",
    slug: "signature-blowout",
    name: "Signature Blowout & Styling",
    description:
      "Precision cut consultation, luxury wash, and a flawless blowout tailored to your hair texture and occasion.",
    category: "hair-styling",
    durationMinutes: 90,
    price: 350,
    image: "https://images.unsplash.com/photo-1560066984-138d9834a973?w=800&q=80",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000002",
    slug: "lace-front-installation",
    name: "Lace Front Wig Installation",
    description:
      "Seamless lace melt, custom tinting, and secure installation for a natural, undetectable hairline.",
    category: "wig-installation",
    durationMinutes: 180,
    price: 1200,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000003",
    slug: "wig-revamp-restoration",
    name: "Wig Revamp & Restoration",
    description:
      "Deep cleanse, re-styling, lace repair, and colour refresh to restore your unit to salon-fresh condition.",
    category: "wig-revamp",
    durationMinutes: 120,
    price: 450,
    image: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
  },
  {
    id: "a1000001-0001-4000-8000-000000000004",
    slug: "custom-hair-colouring",
    name: "Custom Hair Colouring",
    description:
      "From subtle balayage to bold transformations — premium colour formulas with scalp-safe application.",
    category: "hair-coloring",
    durationMinutes: 150,
    price: 800,
    image: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000005",
    slug: "luxury-hair-treatment",
    name: "Luxury Hair Treatment",
    description:
      "Intensive keratin, protein, or moisture therapy to repair damage and restore luminous shine.",
    category: "hair-treatment",
    durationMinutes: 60,
    price: 280,
    image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
  },
  {
    id: "a1000001-0001-4000-8000-000000000006",
    slug: "designer-braids",
    name: "Designer Braids",
    description:
      "Knotless, feed-in, and protective styles crafted with precision for lasting beauty and comfort.",
    category: "braids",
    durationMinutes: 240,
    price: 600,
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000007",
    slug: "glam-makeup-application",
    name: "Glam Makeup Application",
    description:
      "Flawless complexion, sculpted features, and long-wear artistry for events, photoshoots, and evenings out.",
    category: "makeup",
    durationMinutes: 75,
    price: 400,
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
  },
  {
    id: "a1000001-0001-4000-8000-000000000008",
    slug: "luxury-lash-extensions",
    name: "Luxury Lash Extensions",
    description:
      "Classic, hybrid, or volume sets applied with meticulous technique for captivating, natural-looking lashes.",
    category: "lashes",
    durationMinutes: 120,
    price: 350,
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
  },
  {
    id: "a1000001-0001-4000-8000-000000000009",
    slug: "bridal-beauty-package",
    name: "Bridal Beauty Package",
    description:
      "Complete bridal hair and makeup with trial session, touch-up kit, and dedicated day-of coordination.",
    category: "bridal",
    durationMinutes: 180,
    price: 2500,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    featured: true,
  },
];
