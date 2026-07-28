export type GalleryCategory = "hair" | "wigs" | "braids" | "glam";

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: GalleryCategory;
  width: number;
  height: number;
};

export const GALLERY_CATEGORIES: Record<GalleryCategory, string> = {
  hair: "Hair",
  wigs: "Wigs",
  braids: "Braids",
  glam: "Glam",
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g-01",
    src: "/images/glam-braids-studio.png",
    alt: "Butterfly braids in the Accra studio — Glam Room Adenta",
    category: "braids",
    width: 800,
    height: 1000,
  },
  {
    id: "g-02",
    src: "/images/glam-braids-portrait.png",
    alt: "Full glam makeup portrait with soft glam finish",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-07",
    src: "/images/glam-gallery-waves-profile.png",
    alt: "Silk waves profile — hair install styling",
    category: "hair",
    width: 800,
    height: 1000,
  },
  {
    id: "g-10",
    src: "/images/glam-frontal-ponytail.png",
    alt: "Frontal ponytail install — sleek wig look",
    category: "wigs",
    width: 800,
    height: 1000,
  },
  {
    id: "g-08",
    src: "/images/glam-gallery-braids-bw.png",
    alt: "Butterfly braids black and white editorial",
    category: "braids",
    width: 800,
    height: 1000,
  },
  {
    id: "g-09",
    src: "/images/glam-gallery-waves-front.png",
    alt: "Hollywood waves — front view hair styling",
    category: "hair",
    width: 800,
    height: 1000,
  },
  {
    id: "g-03",
    src: "/images/glam-red-outdoor.png",
    alt: "Red carpet outdoor glam look",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-11",
    src: "/images/glam-bra-length.png",
    alt: "Bra-length braids workmanship — Accra salon",
    category: "braids",
    width: 800,
    height: 1000,
  },
  {
    id: "g-04",
    src: "/images/glam-red-indoor.png",
    alt: "Signature indoor glam makeup",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-12",
    src: "/images/asantewaa-gown-smile.png",
    alt: "Asantewaa styled for evening — glam and wig finish",
    category: "wigs",
    width: 800,
    height: 1000,
  },
  {
    id: "g-05",
    src: "/images/glam-red-studio.png",
    alt: "Studio slay glam session",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-06",
    src: "/images/glam-red-celebration.png",
    alt: "Celebration glam look",
    category: "glam",
    width: 800,
    height: 1000,
  },
];

/** Balanced mix for homepage preview (hair / braids / glam / wigs). */
export function pickHomepageGalleryItems(items: GalleryItem[], limit = 6): GalleryItem[] {
  const order: GalleryItem["category"][] = ["braids", "glam", "hair", "wigs", "hair", "braids"];
  const used = new Set<string>();
  const picked: GalleryItem[] = [];

  for (const category of order) {
    if (picked.length >= limit) break;
    const next = items.find((item) => item.category === category && !used.has(item.id));
    if (next) {
      used.add(next.id);
      picked.push(next);
    }
  }

  for (const item of items) {
    if (picked.length >= limit) break;
    if (!used.has(item.id)) {
      used.add(item.id);
      picked.push(item);
    }
  }

  return picked;
}