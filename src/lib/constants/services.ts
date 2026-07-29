export type ServiceCategory = "hair-installation" | "braids" | "hair-reset";

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
  badge?: string | null;
};

/** Display order on services page and booking. */
export const SERVICE_CATEGORY_ORDER: ServiceCategory[] = [
  "hair-installation",
  "braids",
  "hair-reset",
];

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  "hair-installation": "Hair installation services",
  braids: "Braiding (workmanship only)",
  "hair-reset": "Hair reset services",
};

export const SERVICE_CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  "hair-installation": "Closure and frontal installs, finished in the chair.",
  braids: "Length-based braiding. Hair not included — bring yours or buy at the salon.",
  "hair-reset": "Wash, take-down, touch-ups, and quick styles.",
};

export const SALON_SERVICES: SalonService[] = [
  {
    id: "a1000001-0001-4000-8000-000000000007",
    slug: "closure-install",
    name: "Closure hair install",
    description: "Closure unit installed and styled.",
    category: "hair-installation",
    durationMinutes: 90,
    price: 50,
    image: "/images/glam-red-studio.png",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000008",
    slug: "frontal-install",
    name: "Frontal hair install",
    description: "Frontal unit installed with a natural hairline.",
    category: "hair-installation",
    durationMinutes: 105,
    price: 100,
    image: "/images/glam-red-indoor.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000009",
    slug: "frontal-ponytail",
    name: "Frontal ponytail",
    description: "Frontal install finished in a sleek ponytail.",
    category: "hair-installation",
    durationMinutes: 105,
    price: 150,
    image: "/images/glam-frontal-ponytail.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000010",
    slug: "shoulder-length-braids",
    name: "Shoulder length",
    description: "Braiding to shoulder length. Workmanship only — hair not included.",
    category: "braids",
    durationMinutes: 210,
    price: 150,
    image: "/images/glam-braids-studio.png",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000011",
    slug: "bra-length-braids",
    name: "Bra length",
    description: "Braiding to bra-strap length. Workmanship only — hair not included.",
    category: "braids",
    durationMinutes: 270,
    price: 200,
    image: "/images/glam-bra-length.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000013",
    slug: "hip-length-braids",
    name: "Hip length",
    description: "Braiding to hip length. Workmanship only — hair not included.",
    category: "braids",
    durationMinutes: 330,
    price: 250,
    image: "/images/glam-braids-studio.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000014",
    slug: "butt-length-braids",
    name: "Butt length",
    description: "Braiding to butt length. Workmanship only — hair not included.",
    category: "braids",
    durationMinutes: 390,
    price: 300,
    image: "/images/glam-braids-portrait.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000015",
    slug: "under-butt-braids",
    name: "Under butt",
    description: "Braiding past butt length. Workmanship only — hair not included.",
    category: "braids",
    durationMinutes: 450,
    price: 400,
    image: "/images/glam-braids-portrait.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000001",
    slug: "hair-wash",
    name: "Hair wash",
    description: "Cleanse and refresh your hair.",
    category: "hair-reset",
    durationMinutes: 30,
    price: 35,
    image: "/images/glam-adenta-portrait.png",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000002",
    slug: "hair-wash-cornrows",
    name: "Hair wash + cornrows",
    description: "Wash plus cornrow styling.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 55,
    image: "/images/glam-braids-studio.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000003",
    slug: "unbraid-hair-wash",
    name: "Unbraiding and hair wash",
    description: "Take down braids and wash your hair.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 50,
    image: "/images/glam-braids-portrait.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000004",
    slug: "touch-up-salon-relaxer",
    name: "Touch up with salon’s relaxer",
    description: "New growth touch-up using Glam Room relaxer.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 70,
    image: "/images/glam-gallery-waves-front.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000005",
    slug: "touch-up-client-relaxer",
    name: "Touch up with client’s relaxer",
    description: "New growth touch-up using your own relaxer.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 50,
    image: "/images/glam-gallery-waves-profile.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000006",
    slug: "normal-ponytail",
    name: "Normal ponytail",
    description: "Sleek, styled ponytail finish.",
    category: "hair-reset",
    durationMinutes: 60,
    price: 80,
    image: "/images/glam-red-outdoor.png",
  },
];

export function groupServicesByCategory(services: SalonService[]) {
  return SERVICE_CATEGORY_ORDER.map((category) => ({
    category,
    label: SERVICE_CATEGORIES[category],
    description: SERVICE_CATEGORY_DESCRIPTIONS[category],
    items: services.filter((s) => s.category === category),
  })).filter((group) => group.items.length > 0);
}

export const SIGNATURE_SERVICES = [
  {
    number: "01",
    title: "Luxury Hair Installation",
    description: "Premier installation service. Every strand, intentional.",
    category: "hair-installation" as const,
  },
  {
    number: "02",
    title: "Custom Wig Styling & Maintenance",
    description: "Bespoke shaping and care. Built for your identity.",
    category: "hair-reset" as const,
  },
];
