export type ServiceCategory = "hair-reset" | "hair-installation" | "braids";

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

export const SERVICE_CATEGORIES: Record<ServiceCategory, string> = {
  "hair-reset": "Hair Reset",
  "hair-installation": "Hair Installation",
  braids: "Braids (Workmanship Only)",
};

export const SERVICE_CATEGORY_DESCRIPTIONS: Record<ServiceCategory, string> = {
  "hair-reset":
    "Fresh start energy: wash, unwind, touch-ups, and quick styles to reset your crown.",
  "hair-installation":
    "Closure and frontal installs: secure, natural, and styled to slay.",
  braids:
    "Expert braiding by length. You bring the hair, we bring the hands. Workmanship only.",
};

export const SALON_SERVICES: SalonService[] = [
  {
    id: "a1000001-0001-4000-8000-000000000001",
    slug: "hair-wash",
    name: "Hair Wash",
    description: "Cleanse and refresh your hair.",
    category: "hair-reset",
    durationMinutes: 30,
    price: 35,
    image: "/images/glam-adenta-portrait.png",
    featured: true,
    badge: "Popular",
  },
  {
    id: "a1000001-0001-4000-8000-000000000002",
    slug: "hair-wash-cornrows",
    name: "Hair Wash + Cornrows",
    description: "Wash plus cornrow styling.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 55,
    image: "/images/glam-braids-studio.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000003",
    slug: "unbraid-hair-wash",
    name: "Unbraiding & Hair Wash",
    description: "Take down braids and wash your hair.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 50,
    image: "/images/glam-braids-portrait.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000004",
    slug: "touch-up-salon-relaxer",
    name: "Touch Up with Salon's Relaxer",
    description: "New growth touch-up using Glam Room relaxer.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 70,
    image: "/images/glam-gallery-waves-front.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000005",
    slug: "touch-up-client-relaxer",
    name: "Touch Up with Client's Relaxer",
    description: "New growth touch-up using your own relaxer.",
    category: "hair-reset",
    durationMinutes: 90,
    price: 50,
    image: "/images/glam-gallery-waves-profile.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000006",
    slug: "normal-ponytail",
    name: "Normal Ponytail",
    description: "Sleek, styled ponytail finish.",
    category: "hair-reset",
    durationMinutes: 60,
    price: 80,
    image: "/images/glam-red-outdoor.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000007",
    slug: "closure-install",
    name: "Closure Hair Install",
    description: "Closure unit installed and styled.",
    category: "hair-installation",
    durationMinutes: 90,
    price: 50,
    image: "/images/glam-red-studio.png",
    featured: true,
    badge: "Hot",
  },
  {
    id: "a1000001-0001-4000-8000-000000000008",
    slug: "frontal-install",
    name: "Frontal Hair Install",
    description: "Frontal unit installed with a natural hairline.",
    category: "hair-installation",
    durationMinutes: 105,
    price: 100,
    image: "/images/glam-red-indoor.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000009",
    slug: "frontal-ponytail",
    name: "Frontal Ponytail",
    description: "Frontal install finished in a sleek ponytail style.",
    category: "hair-installation",
    durationMinutes: 105,
    price: 150,
    image: "/images/glam-frontal-ponytail.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000010",
    slug: "shoulder-length-braids",
    name: "Shoulder Length Braids",
    description: "Braiding service to shoulder length. Hair not included.",
    category: "braids",
    durationMinutes: 210,
    price: 150,
    image: "/images/glam-braids-studio.png",
    featured: true,
  },
  {
    id: "a1000001-0001-4000-8000-000000000011",
    slug: "bra-length-braids",
    name: "Bra Length Braids",
    description: "Braiding service to bra strap length. Hair not included.",
    category: "braids",
    durationMinutes: 270,
    price: 200,
    image: "/images/glam-bra-length.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000012",
    slug: "waist-length-braids",
    name: "Waist Length Braids",
    description: "Braiding service to waist length. Hair not included.",
    category: "braids",
    durationMinutes: 270,
    price: 220,
    image: "/images/glam-braids-studio.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000013",
    slug: "hip-length-braids",
    name: "Hip Length Braids",
    description: "Braiding service to hip length. Hair not included.",
    category: "braids",
    durationMinutes: 330,
    price: 250,
    image: "/images/glam-braids-studio.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000014",
    slug: "butt-length-braids",
    name: "Butt Length Braids",
    description: "Braiding service to butt length. Hair not included.",
    category: "braids",
    durationMinutes: 390,
    price: 300,
    image: "/images/glam-braids-portrait.png",
  },
  {
    id: "a1000001-0001-4000-8000-000000000015",
    slug: "under-butt-braids",
    name: "Under Butt Braids",
    description: "Braiding service past butt length. Hair not included.",
    category: "braids",
    durationMinutes: 450,
    price: 400,
    image: "/images/glam-braids-portrait.png",
  },
];

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
