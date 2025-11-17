/**
 * Video Types (matching Android app)
 */

export type VideoCategory = 'RENT' | 'BUY' | 'FOOD' | 'SERVICES';
export type PropertyType = 'ROOM' | 'HOUSE' | 'COTTAGE';

export interface Video {
  id: string;
  url: string;
  thumbnailUrl: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  description: string;
  category: VideoCategory;

  // Location
  businessLocationId?: string;
  latitude?: number;
  longitude?: number;
  geohash: string;
  locationName: string;

  duration: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  createdAt: number;

  // Property-specific (RENT/BUY)
  propertyType?: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  price?: number;
  imageUrls: string[];

  // Other
  isAvailable: boolean;
  approved: boolean;
  rating?: number;
}

export interface VideoWithDistance {
  video: Video;
  distanceMeters: number;
}
