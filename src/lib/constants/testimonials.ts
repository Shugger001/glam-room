export type Testimonial = {
  id: string;
  name: string;
  service: string;
  rating: number;
  quote: string;
  image?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-01",
    name: "Ama K.",
    service: "Regular Client",
    rating: 5,
    quote:
      "Baby girl, when you leave my chair, Accra is NOT ready! Best silk press I've ever had. I felt like a whole new person.",
  },
  {
    id: "t-02",
    name: "Efua M.",
    service: "First-Timer",
    rating: 5,
    quote:
      "Asantewaa did my braids and I got stopped on the street THREE times. The energy in that salon? Unmatched!",
  },
  {
    id: "t-03",
    name: "Akua T.",
    service: "Glam Room Client",
    rating: 5,
    quote:
      "I came in stressed, I left feeling like a celebrity. The vibes, the music, the hair. 10/10 would recommend to every sis.",
  },
  {
    id: "t-04",
    name: "Dela S.",
    service: "Wig Install Client",
    rating: 5,
    quote:
      "My wig install was so seamless my own mother thought it was my hair. Glam Room is THE spot in Accra, period.",
  },
];
