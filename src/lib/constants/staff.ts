export type StaffMember = {
  id: string;
  name: string;
  role: string;
  bio: string;
  experience: string;
  specialty: string[];
  image: string;
  instagram?: string;
};

export const SALON_STAFF: StaffMember[] = [
  {
    id: "b1000001-0001-4000-8000-000000000001",
    name: "Amara Osei",
    role: "Founder & Lead Stylist",
    bio: "With over 12 years shaping Accra's luxury beauty scene, Amara founded The Glam Room to deliver an uncompromising standard of hair artistry.",
    experience: "12+ years",
    specialty: ["Hair Styling", "Bridal", "Wig Installation"],
    image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
    instagram: "https://instagram.com",
  },
  {
    id: "b1000001-0001-4000-8000-000000000002",
    name: "Efua Mensah",
    role: "Senior Colorist",
    bio: "Efua specialises in transformative colour work — from sun-kissed balayage to bold editorial hues — with a focus on hair health.",
    experience: "8+ years",
    specialty: ["Hair Coloring", "Hair Treatment", "Wig Revamp"],
    image: "https://images.unsplash.com/photo-1560066984-138d9834a973?w=600&q=80",
    instagram: "https://instagram.com",
  },
  {
    id: "b1000001-0001-4000-8000-000000000003",
    name: "Nana Adjei",
    role: "Braids & Protective Styles Specialist",
    bio: "Known for intricate knotless braids and feed-in styles, Nana combines speed with precision for styles that last weeks.",
    experience: "6+ years",
    specialty: ["Braids", "Wig Installation"],
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    instagram: "https://instagram.com",
  },
  {
    id: "b1000001-0001-4000-8000-000000000004",
    name: "Akosua Boateng",
    role: "Makeup & Lash Artist",
    bio: "Akosua brings runway-level makeup artistry and lash expertise to every client — from bridal glow to red-carpet drama.",
    experience: "7+ years",
    specialty: ["Makeup", "Lashes", "Bridal"],
    image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
    instagram: "https://instagram.com",
  },
];
