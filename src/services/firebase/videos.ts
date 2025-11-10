/**
 * Videos Firebase Service
 * Fetch videos from Firestore with location-based queries
 */

import { collection, query, where, getDocs, limit as firestoreLimit, orderBy } from 'firebase/firestore';
import { db, COLLECTIONS } from './config';
import type { Video, VideoCategory, VideoWithDistance } from '@/types/video';
import { generateGeohash, calculateDistance } from '@/utils/geohash';

/**
 * Get videos near a location
 */
export const getVideosNearby = async (
  category: VideoCategory,
  centerLat: number,
  centerLng: number,
  radiusMeters: number = 5000,
  limit: number = 20
): Promise<VideoWithDistance[]> => {
  try {
    console.log(`Querying videos - Category: ${category}, Center: ${centerLat}, ${centerLng}, Radius: ${radiusMeters}m`);

    // Generate geohash for center point (precision 4 = ~20km square)
    const centerGeohash = generateGeohash(centerLat, centerLng, 4);
    console.log(`Center geohash (precision 4): ${centerGeohash}`);

    // Query videos by category AND geohash prefix (efficient!)
    const videosRef = collection(db, COLLECTIONS.VIDEOS);
    const q = query(
      videosRef,
      where('category', '==', category),
      where('geohash', '>=', centerGeohash),
      where('geohash', '<', centerGeohash + '~'),
      firestoreLimit(limit * 5) // Get more since we're filtering by area first
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} videos in geohash area '${centerGeohash}' (before distance filter)`);

    const videos: Video[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Video));

    // Calculate exact distances and filter by precise radius
    const videosWithDistance: VideoWithDistance[] = videos
      .map(video => {
        const videoLat = video.latitude;
        const videoLng = video.longitude;

        if (videoLat && videoLng && videoLat !== 0 && videoLng !== 0) {
          const distance = calculateDistance(centerLat, centerLng, videoLat, videoLng);

          if (distance <= radiusMeters) {
            return { video, distanceMeters: distance };
          }
        }
        return null;
      })
      .filter((item): item is VideoWithDistance => item !== null);

    console.log(`Returning ${videosWithDistance.length} videos within ${radiusMeters}m radius (after distance filter)`);

    // Sort by distance (nearest first), then limit
    return videosWithDistance
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, limit);

  } catch (error) {
    console.error('Error querying videos:', error);
    return [];
  }
};

/**
 * Get popular videos (no location filter)
 * Used when user denies location permission
 *
 * NOTE: To enable sorting by views, create a composite index in Firebase:
 * Collection: videos
 * Fields: category (Ascending), views (Descending)
 * Click the link in the error message to auto-create it.
 */
export const getPopularVideos = async (
  category: VideoCategory,
  limit: number = 20
): Promise<VideoWithDistance[]> => {
  try {
    const videosRef = collection(db, COLLECTIONS.VIDEOS);

    // Simplified query without orderBy to avoid index requirement
    // Once you create the index, you can uncomment the orderBy line
    const q = query(
      videosRef,
      where('category', '==', category),
      // orderBy('views', 'desc'), // UNCOMMENT after creating Firebase index
      firestoreLimit(limit)
    );

    const querySnapshot = await getDocs(q);

    const videos: Video[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Video));

    // Sort by views in-memory (less efficient but works without index)
    const sortedVideos = videos.sort((a, b) => (b.views || 0) - (a.views || 0));

    // Return with distance = 0 (not applicable)
    return sortedVideos.map(video => ({ video, distanceMeters: 0 }));

  } catch (error) {
    console.error('Error querying popular videos:', error);
    return [];
  }
};
