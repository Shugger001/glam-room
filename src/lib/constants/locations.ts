import { getDirectionsUrl } from "@/lib/maps/directions-url";

export type SalonLocation = {
  id: string;
  name: string;
  area: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  /** Google Maps pin link from the shop owner (maps.google.com/?q=lat,lng preferred). */
  pinUrl?: string;
  mapUrl: string;
  hours: string;
  image: string;
  badge?: string | null;
};

const LOCATIONS: Omit<SalonLocation, "mapUrl">[] = [
  {
    id: "glam-room-adenta",
    name: "Glam Room",
    area: "Adenta",
    address: "Ayabeng St, Adenta Municipality, Accra",
    city: "Accra",
    country: "Ghana",
    lat: 0,
    lng: 0,
    pinUrl: "https://share.google/TN4FohAFQiJ6UgK4b",
    hours: "Mon to Sun: 8am to 8pm",
    image: "/images/glam-adenta-portrait.png",
  },
  {
    id: "glam-room-sowutuom",
    name: "Glam Room",
    area: "Sowutuom",
    address: "Masalachi, Ofankor barrier, Sowutuom, Accra",
    city: "Accra",
    country: "Ghana",
    lat: 0,
    lng: 0,
    pinUrl: "https://share.google/eNIyXIhSW1kZ6rzmF",
    hours: "Mon to Sun: 8am to 8pm",
    image: "/images/glam-braids-studio.png",
  },
  {
    id: "glam-room-madina",
    name: "Glam Room",
    area: "Madina",
    address: "Ritz Junction, opposite Glory Oil, Madina, Accra",
    city: "Accra",
    country: "Ghana",
    lat: 5.686345,
    lng: -0.172322,
    pinUrl: "https://maps.google.com/?q=5.686345,-0.172322",
    hours: "Mon to Sun: 8am to 8pm",
    image: "/images/glam-red-celebration.png",
    badge: "New",
  },
];

function withDirectionsUrl(location: Omit<SalonLocation, "mapUrl">): SalonLocation {
  return {
    ...location,
    mapUrl: getDirectionsUrl(location),
  };
}

export const SALON_LOCATIONS: SalonLocation[] = LOCATIONS.map(withDirectionsUrl);
