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
    name: "Adwoa K.",
    service: "Bridal Beauty Package",
    rating: 5,
    quote:
      "The Glam Room made me feel like royalty on my wedding day. Every detail was perfect — from the trial to the final look. I couldn't have asked for more.",
  },
  {
    id: "t-02",
    name: "Maame S.",
    service: "Lace Front Wig Installation",
    rating: 5,
    quote:
      "The most natural install I've ever had. The lace melt was flawless and the styling lasted two weeks. This is now my only salon.",
  },
  {
    id: "t-03",
    name: "Esi A.",
    service: "Designer Braids",
    rating: 5,
    quote:
      "Nana's knotless braids are incredible — neat, lightweight, and they lasted over a month. The salon atmosphere is so calming and luxurious.",
  },
  {
    id: "t-04",
    name: "Yaa B.",
    service: "Custom Hair Colouring",
    rating: 5,
    quote:
      "Efua understood exactly what I wanted. My balayage is stunning and my hair feels healthier than before the colour. True artistry.",
  },
  {
    id: "t-05",
    name: "Abena M.",
    service: "Glam Makeup Application",
    rating: 5,
    quote:
      "Akosua's makeup lasted through an entire evening event without a single touch-up. I received compliments all night. Absolutely worth it.",
  },
  {
    id: "t-06",
    name: "Ruth O.",
    service: "Signature Blowout & Styling",
    rating: 5,
    quote:
      "From the moment you walk in, you feel the luxury. The team is professional, warm, and incredibly skilled. My go-to salon in Accra.",
  },
];
