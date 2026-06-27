import { BRAND } from "@/lib/constants/brand";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-01",
    question: "How do I book an appointment?",
    answer:
      "Book online through our Book Appointment page, or message us on WhatsApp. Choose your location (Adenta, Sowutuom, or Madina), pick your service, and select a time slot.",
  },
  {
    id: "faq-02",
    question: "Do you have more than one location?",
    answer:
      "Yes. Glam Room has three shops in Accra: Adenta, Sowutuom, and our newest location in Madina (Ritz Junction). Pick your preferred location when you book.",
  },
  {
    id: "faq-03",
    question: "Do braid prices include hair extensions?",
    answer: BRAND.copy.braidsNotice,
  },
  {
    id: "faq-04",
    question: "What are your opening hours?",
    answer: "We're open Monday to Sunday, 8am to 8pm at all three locations.",
  },
  {
    id: "faq-05",
    question: "What should I bring for braids?",
    answer:
      "For braiding services (workmanship only), bring your own hair extensions or purchase from our salon. Our stylists handle the braiding. You provide the hair.",
  },
  {
    id: "faq-06",
    question: "Can I book via WhatsApp?",
    answer: `Absolutely. Message us at ${BRAND.links.phone} on WhatsApp and we'll help you reserve your chair.`,
  },
  {
    id: "faq-07",
    question: "What time slots are available?",
    answer: "We offer appointments at 9:00 AM, 12:00 PM, 3:00 PM, and 6:00 PM daily.",
  },
  {
    id: "faq-08",
    question: "Do you accept walk-ins?",
    answer:
      "We recommend booking ahead to secure your slot, especially on weekends. Limited walk-in availability may exist. WhatsApp us to check.",
  },
];
