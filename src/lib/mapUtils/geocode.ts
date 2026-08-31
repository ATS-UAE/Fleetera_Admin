export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function searchAddress(query: string): Promise<GeocodeResult[]> {
  if (!query.trim()) return [];
  const resp = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await resp.json();
  return data.map((r: any) => ({
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name as string,
  }));
}

const reverseCache: Record<string, string> = {};

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
  if (reverseCache[key]) return reverseCache[key];
  try {
    const resp = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await resp.json();
    const addr = data.display_name || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
    reverseCache[key] = addr;
    return addr;
  } catch {
    return `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
  }
}
