export type SalonLocation = {
  id: string;
  name: string;
  area: string;
  address: string;
  city: string;
  country: string;
  mapUrl: string;
  hours: string;
  image: string;
};

export const SALON_LOCATIONS: SalonLocation[] = [
  {
    id: "glam-room-adenta",
    name: "Glam Room",
    area: "Adenta",
    address: "Adenta, Accra",
    city: "Accra",
    country: "Ghana",
    mapUrl: "https://share.google/TN4FohAFQiJ6UgK4b",
    hours: "Mon to Sun: 8am to 8pm",
    image: "/images/glam-adenta-portrait.png",
  },
  {
    id: "glam-room-sowutuom",
    name: "Glam Room",
    area: "Sowutuom",
    address: "Sowutuom, Accra",
    city: "Accra",
    country: "Ghana",
    mapUrl: "https://share.google/eNIyXIhSW1kZ6rzmF",
    hours: "Mon to Sun: 8am to 8pm",
    image: "/images/glam-braids-studio.png",
  },
];
