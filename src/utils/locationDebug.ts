/**
 * Location Debugging Utilities
 * Helper functions to debug and verify location-based features
 */

import { generateGeohash, calculateDistance } from './geohash';

/**
 * Get detailed location info for debugging
 */
export const getLocationDebugInfo = (lat: number, lng: number) => {
  const geohashes = {
    precision1: generateGeohash(lat, lng, 1), // ~5000km
    precision2: generateGeohash(lat, lng, 2), // ~1250km
    precision3: generateGeohash(lat, lng, 3), // ~156km
    precision4: generateGeohash(lat, lng, 4), // ~39km
    precision5: generateGeohash(lat, lng, 5), // ~4.9km
    precision6: generateGeohash(lat, lng, 6), // ~1.2km
    precision7: generateGeohash(lat, lng, 7), // ~153m
  };

  return {
    coordinates: { lat, lng },
    geohashes,
    queryGeohash: geohashes.precision4, // This is what we use for queries
  };
};

/**
 * Test if a video location would match the query
 */
export const testVideoMatch = (
  userLat: number,
  userLng: number,
  videoLat: number,
  videoLng: number,
  radiusMeters: number = 5000
) => {
  const userGeohash = generateGeohash(userLat, userLng, 4);
  const videoGeohash = generateGeohash(videoLat, videoLng, 4);
  const distance = calculateDistance(userLat, userLng, videoLat, videoLng);

  const geohashMatch = videoGeohash.startsWith(userGeohash);
  const withinRadius = distance <= radiusMeters;

  return {
    userGeohash,
    videoGeohash,
    geohashMatch,
    distance: Math.round(distance),
    withinRadius,
    wouldAppear: geohashMatch && withinRadius,
    reason: !geohashMatch
      ? `Geohash mismatch (user: ${userGeohash}, video: ${videoGeohash})`
      : !withinRadius
      ? `Outside radius (${Math.round(distance)}m > ${radiusMeters}m)`
      : 'Match!',
  };
};

/**
 * Log location debug info to console
 */
export const logLocationDebug = (
  userLat: number,
  userLng: number,
  videos?: Array<{ latitude?: number; longitude?: number; geohash?: string }>
) => {
  console.group('📍 Location Debug Info');

  const userInfo = getLocationDebugInfo(userLat, userLng);
  console.log('User Location:', userInfo.coordinates);
  console.log('User Geohashes:', userInfo.geohashes);
  console.log('Query Geohash (precision 4):', userInfo.queryGeohash);

  if (videos && videos.length > 0) {
    console.group('🎥 Video Locations');
    videos.forEach((video, index) => {
      if (video.latitude && video.longitude) {
        const match = testVideoMatch(userLat, userLng, video.latitude, video.longitude);
        console.log(`Video ${index + 1}:`, {
          coords: { lat: video.latitude, lng: video.longitude },
          storedGeohash: video.geohash,
          calculatedGeohash: match.videoGeohash,
          distance: `${match.distance}m`,
          match: match.wouldAppear ? '✅' : '❌',
          reason: match.reason,
        });
      }
    });
    console.groupEnd();
  }

  console.groupEnd();
};

/**
 * Get nearby area description
 */
export const getAreaDescription = (geohash: string): string => {
  // South African geohash prefixes (approximate)
  const areas: Record<string, string> = {
    'ke': 'South Africa',
    'kek': 'Gauteng/North West',
    'kekj': 'Pretoria/Centurion',
    'kekh': 'Johannesburg',
    'ke7': 'Western Cape',
    'ke7f': 'Cape Town',
    'kedn': 'KwaZulu-Natal',
    'kedk': 'Durban',
  };

  for (const [prefix, area] of Object.entries(areas)) {
    if (geohash.startsWith(prefix)) {
      return area;
    }
  }

  return 'Unknown area';
};
