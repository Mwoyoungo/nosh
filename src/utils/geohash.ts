/**
 * Geohash utilities for location-based queries
 * Same algorithm as Android app
 */

const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

/**
 * Generate geohash from latitude/longitude
 */
export const generateGeohash = (latitude: number, longitude: number, precision: number = 7): string => {
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  const geohash: string[] = [];

  let latRange: [number, number] = [-90.0, 90.0];
  let lonRange: [number, number] = [-180.0, 180.0];

  while (geohash.length < precision) {
    if (evenBit) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (longitude > mid) {
        idx = idx | (1 << (4 - bit));
        lonRange = [mid, lonRange[1]];
      } else {
        lonRange = [lonRange[0], mid];
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (latitude > mid) {
        idx = idx | (1 << (4 - bit));
        latRange = [mid, latRange[1]];
      } else {
        latRange = [latRange[0], mid];
      }
    }

    evenBit = !evenBit;

    if (bit < 4) {
      bit++;
    } else {
      geohash.push(BASE32[idx]);
      bit = 0;
      idx = 0;
    }
  }

  return geohash.join('');
};

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in meters
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const earthRadius = 6371000; // meters

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};
