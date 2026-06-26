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
      "You can book directly through our website using the Book Appointment page. Select your service, preferred stylist, date, and time. A deposit secures your slot and you'll receive a confirmation email.",
  },
  {
    id: "faq-02",
    question: "What is your cancellation policy?",
    answer:
      "We require at least 24 hours notice for cancellations or rescheduling. Late cancellations may forfeit your deposit. We understand emergencies happen — please contact us as soon as possible.",
  },
  {
    id: "faq-03",
    question: "Do you require a deposit?",
    answer:
      "Yes, a 30% deposit is required at the time of booking to secure your appointment. The remaining balance is due at your visit. Deposits are applied toward your total service cost.",
  },
  {
    id: "faq-04",
    question: "What should I do before my appointment?",
    answer:
      "Arrive with clean, dry hair for styling services. For wig installations, bring your unit clean and detangled. For colour services, avoid washing your hair 24 hours prior. Detailed prep instructions are sent with your confirmation.",
  },
  {
    id: "faq-05",
    question: "Do you offer bridal trials?",
    answer:
      "Yes, our Bridal Beauty Package includes a dedicated trial session. We recommend scheduling your trial 4–6 weeks before your wedding day to allow time for any adjustments.",
  },
  {
    id: "faq-06",
    question: "What products do you use?",
    answer:
      "We use premium, professional-grade products from leading luxury hair and beauty brands. All formulas are selected for performance on diverse hair textures while prioritising scalp and hair health.",
  },
  {
    id: "faq-07",
    question: "Is parking available?",
    answer:
      "Street parking is available near our Osu location. We recommend arriving 10 minutes early to find parking and settle in before your appointment begins.",
  },
  {
    id: "faq-08",
    question: "Do you accept walk-ins?",
    answer:
      "We operate primarily by appointment to ensure every client receives our full attention. Limited walk-in availability may exist — we recommend booking in advance, especially for weekends.",
  },
];
