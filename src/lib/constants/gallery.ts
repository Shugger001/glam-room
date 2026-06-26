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
    alt: "Butterfly Braids",
    category: "braids",
    width: 800,
    height: 1000,
  },
  {
    id: "g-02",
    src: "/images/glam-braids-portrait.png",
    alt: "Full Glam Portrait",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-03",
    src: "/images/glam-red-outdoor.png",
    alt: "Red Carpet Outdoor",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-04",
    src: "/images/glam-red-indoor.png",
    alt: "Signature Glam",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-05",
    src: "/images/glam-red-studio.png",
    alt: "Studio Slay",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-06",
    src: "/images/glam-red-celebration.png",
    alt: "Celebration Glam",
    category: "glam",
    width: 800,
    height: 1000,
  },
  {
    id: "g-07",
    src: "/images/glam-gallery-waves-profile.png",
    alt: "Silk Waves Profile",
    category: "hair",
    width: 800,
    height: 1000,
  },
  {
    id: "g-08",
    src: "/images/glam-gallery-braids-bw.png",
    alt: "Butterfly Braids B&W",
    category: "braids",
    width: 800,
    height: 1000,
  },
  {
    id: "g-09",
    src: "/images/glam-gallery-waves-front.png",
    alt: "Hollywood Waves",
    category: "hair",
    width: 800,
    height: 1000,
  },
];
