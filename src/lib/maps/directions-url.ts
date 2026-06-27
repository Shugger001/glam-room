type DirectionsInput = {
  lat?: number;
  lng?: number;
  pinUrl?: string;
  address: string;
  city?: string;
  country?: string;
  name?: string;
  area?: string;
};

export function parseMapPinCoords(
  pinUrl?: string,
): { lat: number; lng: number } | null {
  if (!pinUrl) return null;

  try {
    const url = new URL(pinUrl);
    const q = url.searchParams.get("q");
    if (!q) return null;

    const match = q.trim().match(/^(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)$/);
    if (!match) return null;

    return { lat: Number(match[1]), lng: Number(match[2]) };
  } catch {
    return null;
  }
}

/** Opens the shop pin in Google Maps (mobile app when installed). */
export function getDirectionsUrl(location: DirectionsInput): string {
  const fromPin = parseMapPinCoords(location.pinUrl);
  const lat = fromPin?.lat ?? location.lat;
  const lng = fromPin?.lng ?? location.lng;

  if (typeof lat === "number" && typeof lng === "number" && (lat !== 0 || lng !== 0)) {
    return `https://maps.google.com/?q=${lat},${lng}`;
  }

  if (location.pinUrl?.includes("maps.google.com")) {
    return location.pinUrl;
  }

  const label = [location.name, location.area, location.address, location.city, location.country]
    .filter(Boolean)
    .join(", ");

  return `https://maps.google.com/?q=${encodeURIComponent(label)}`;
}
