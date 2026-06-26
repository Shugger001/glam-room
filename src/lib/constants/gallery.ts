export type GalleryCategory = "hair" | "wigs" | "bridal" | "transformation" | "braids";

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
  bridal: "Bridal",
  transformation: "Transformation",
  braids: "Braids",
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "g-01",
    src: "https://images.unsplash.com/photo-1560066984-138d9834a973?w=800&q=80",
    alt: "Luxury blowout and hair styling",
    category: "hair",
    width: 800,
    height: 1000,
  },
  {
    id: "g-02",
    src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    alt: "Flawless lace front wig installation",
    category: "wigs",
    width: 800,
    height: 600,
  },
  {
    id: "g-03",
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    alt: "Bridal hair and makeup",
    category: "bridal",
    width: 800,
    height: 1200,
  },
  {
    id: "g-04",
    src: "https://images.unsplash.com/photo-1522336572468-97b06e8ef143?w=800&q=80",
    alt: "Hair colour transformation",
    category: "transformation",
    width: 800,
    height: 900,
  },
  {
    id: "g-05",
    src: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80",
    alt: "Designer knotless braids",
    category: "braids",
    width: 800,
    height: 1000,
  },
  {
    id: "g-06",
    src: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    alt: "Wig revamp and restoration",
    category: "wigs",
    width: 800,
    height: 700,
  },
  {
    id: "g-07",
    src: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
    alt: "Luxury hair treatment results",
    category: "hair",
    width: 800,
    height: 800,
  },
  {
    id: "g-08",
    src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
    alt: "Glam makeup application",
    category: "bridal",
    width: 800,
    height: 600,
  },
  {
    id: "g-09",
    src: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=80",
    alt: "Luxury lash extensions",
    category: "transformation",
    width: 800,
    height: 900,
  },
  {
    id: "g-10",
    src: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80",
    alt: "Salon interior and styling session",
    category: "hair",
    width: 800,
    height: 500,
  },
  {
    id: "g-11",
    src: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&q=80",
    alt: "Bridal party glam",
    category: "bridal",
    width: 800,
    height: 1100,
  },
  {
    id: "g-12",
    src: "https://images.unsplash.com/photo-1605497788041-5f32ae44313a?w=800&q=80",
    alt: "Feed-in braids style",
    category: "braids",
    width: 800,
    height: 800,
  },
];
