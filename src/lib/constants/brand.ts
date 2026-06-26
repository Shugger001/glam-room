export const BRAND = {
  name: "Glam Room",
  tagline: "Your Crown. Your Glow.",
  fullName: "Glam Room by Asantewaa",
  parentBrand: "The House of Asantewaa",
  logo: {
    src: "/brand/glam-room-logo.svg",
    mark: "/brand/glam-room-mark.png",
    alt: "Glam Room by Asantewaa",
    width: 280,
    height: 48,
  },
  colors: {
    primary: "#0F0F0F",
    secondary: "#FFFFFF",
    accent: "#C8A86B",
    background: "#F8F5F2",
  },
  links: {
    instagram: "https://www.instagram.com/asantewaaaa",
    tiktok: "https://www.tiktok.com/@asantewaaaaa",
    youtube: "https://www.youtube.com/@asantewaa",
    whatsapp: "https://wa.me/233243646400?text=Hi%20Glam%20Room!%20I%27d%20like%20to%20book%20an%20appointment%20%F0%9F%92%85",
    email: "hello@theglamroom.com",
    phone: "+233 24 364 6400",
  },
  address: {
    street: "Adenta & Sowutuom",
    city: "Accra",
    region: "Greater Accra",
    country: "Ghana",
    postalCode: "",
    lat: 5.7145,
    lng: -0.1685,
  },
  hours: [
    { day: "Monday", open: "08:00", close: "20:00", closed: false },
    { day: "Tuesday", open: "08:00", close: "20:00", closed: false },
    { day: "Wednesday", open: "08:00", close: "20:00", closed: false },
    { day: "Thursday", open: "08:00", close: "20:00", closed: false },
    { day: "Friday", open: "08:00", close: "20:00", closed: false },
    { day: "Saturday", open: "08:00", close: "20:00", closed: false },
    { day: "Sunday", open: "08:00", close: "20:00", closed: false },
  ],
  copy: {
    heroTagline:
      "Where beauty meets influence, and every detail is designed to make a statement.",
    heroSubtitle: "Accra's Premier Hair Destination",
    aboutIntro: [
      "Glam Room is a destination for modern beauty. Designed for women who value excellence, every service is delivered with precision, care, and an uncompromising attention to detail.",
      "From everyday refinement to life's defining moments, our stylists create looks that feel effortless, elevated, and uniquely yours.",
    ],
    quote:
      "I didn't come to play, I came to SLAY, and so did your hair when you walk out my door. Baby girl, treat yourself. You deserve to look expensive!",
    quoteAuthor: "Asantewaa",
    braidsNotice:
      "Please note that all Braids prices do not include hair extensions. You can either come along with your own extensions or purchase from our salon.",
    footerTagline: "Made with love in Accra, Ghana 🇬🇭",
  },
} as const;
