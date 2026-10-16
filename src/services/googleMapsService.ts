/**
 * Google Maps & Geolocation Service for ActivityTN (MCHINA)
 * Handles distance calculations, Google Maps deep linking, and Map rendering configurations.
 */

export interface LocationPoint {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface UserLocation extends LocationPoint {
  id: string;
  name: string;
  username: string;
  avatar: string;
  city: string;
  status: string;
  bio?: string;
  distanceKm?: number;
}

/**
  Calculate distance between two geographic points using Haversine formula (in kilometers)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

/**
 * Format distance in human-readable French / Arabic format
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Generate Google Maps directions URL for opening directly in Google Maps App or Web
 */
export function getGoogleMapsDirectionsUrl(
  lat: number,
  lng: number,
  label?: string
): string {
  const encodedLabel = label ? encodeURIComponent(label) : '';
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodedLabel}`;
}

/**
 * Generate Google Maps Embed iframe source URL
 */
export function getGoogleMapsEmbedUrl(
  lat: number,
  lng: number,
  zoom = 14,
  label?: string,
  language = 'fr'
): string {
  const query = label ? `${lat},${lng}+(${encodeURIComponent(label)})` : `${lat},${lng}`;
  const hl = language === 'ar' ? 'ar' : language === 'en' ? 'en' : 'fr';
  return `https://maps.google.com/maps?q=${query}&hl=${hl}&z=${zoom}&output=embed`;
}

