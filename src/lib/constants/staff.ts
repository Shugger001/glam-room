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
    name: "Asantewaa",
    role: "Founder & Lead Stylist",
    bio: "Glam Room is her love letter to Accra: warm vibes, expert hands, and zero tolerance for bad hair days. Whether you're coming for a silk press or a full transformation, you're family here.",
    experience: "4M+ followers",
    specialty: ["Hair Reset", "Braids", "Wig Installation", "Silk Press"],
    image: "/images/asantewaa-gown-smile.png",
    instagram: "https://www.instagram.com/asantewaaaa",
  },
];
