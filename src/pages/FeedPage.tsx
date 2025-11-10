/**
 * Feed Page
 * Vertical scrolling video feed with category filters
 */

import { useState, useEffect, useRef, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { logout } from '@/services/firebase/auth';
import { getVideosNearby, getPopularVideos } from '@/services/firebase/videos';
import type { VideoCategory, VideoWithDistance } from '@/types/video';
import VideoCard from '@/components/video/VideoCard';
import GalleryModal from '@/components/video/GalleryModal';
import BottomNav from '@/components/navigation/BottomNav';
import { Icons } from '@/theme';
import { logLocationDebug, getAreaDescription } from '@/utils/locationDebug';
import { generateGeohash } from '@/utils/geohash';

const FeedPage = () => {
  const { user } = useAuth();
  const { browseLocation, isBrowsing, clearBrowseLocation } = useLocation();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('RENT');
  const [videos, setVideos] = useState<VideoWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState(5000); // Default 5km
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[] | null>(null);
  const lastScrollY = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const categories: VideoCategory[] = ['RENT', 'BUY', 'FOOD', 'SERVICES'];
  const radiusOptions = [
    { label: '1km', value: 1000 },
    { label: '5km', value: 5000 },
    { label: '10km', value: 10000 },
    { label: '25km', value: 25000 },
    { label: '50km', value: 50000 },
  ];

  // Request location permission
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setUserLocation({ lat, lng });

          // Debug logging
          console.log('📍 Location granted:', lat, lng);
          console.log('📍 Accuracy:', Math.round(position.coords.accuracy), 'meters');
          logLocationDebug(lat, lng);
        },
        (error) => {
          console.log('❌ Location denied:', error.message);
          setLocationDenied(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.log('❌ Geolocation not supported');
      setLocationDenied(true);
    }
  }, []);

  // Fetch videos when category or location changes
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        let results: VideoWithDistance[];

        // Use browse location if set, otherwise use GPS location
        const activeLat = isBrowsing && browseLocation ? browseLocation.lat : userLocation?.lat;
        const activeLng = isBrowsing && browseLocation ? browseLocation.lng : userLocation?.lng;
        const locationSource = isBrowsing && browseLocation ? browseLocation.locationName : 'GPS';

        if (activeLat && activeLng) {
          // Location-based query
          console.log(`🔍 Fetching videos near ${locationSource} for ${selectedCategory} within ${radiusMeters / 1000}km...`);
          results = await getVideosNearby(
            selectedCategory,
            activeLat,
            activeLng,
            radiusMeters,
            20
          );
          console.log(`✅ Fetched ${results.length} videos near ${locationSource} for ${selectedCategory} (radius: ${radiusMeters / 1000}km)`);

          // ONLY fallback to popular if using GPS location AND no videos found
          // When browsing a different location, show empty state instead
          if (results.length === 0 && !isBrowsing) {
            console.log(`⚠️ No videos at GPS location, falling back to popular videos...`);
            results = await getPopularVideos(selectedCategory, 20);
            console.log(`✅ Fetched ${results.length} popular videos as fallback for ${selectedCategory}`);
          } else if (results.length === 0 && isBrowsing) {
            console.log(`⚠️ No videos at browsed location - showing empty state`);
          }
        } else {
          // Popular videos fallback
          console.log(`🔍 Fetching popular videos for ${selectedCategory} (location ${locationDenied ? 'denied' : 'not available yet'})...`);
          results = await getPopularVideos(selectedCategory, 20);
          console.log(`✅ Fetched ${results.length} popular videos for ${selectedCategory}`);
        }

        console.log(`📊 Setting ${results.length} videos to state`);

        // Debug: Log location matching for fetched videos
        if (activeLat && activeLng && results.length > 0) {
          logLocationDebug(
            activeLat,
            activeLng,
            results.map((r) => r.video)
          );
        }

        setVideos(results);
        setCurrentVideoIndex(0);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory, userLocation, locationDenied, radiusMeters, isBrowsing, browseLocation]);

  // Handle vertical scroll (snap to next/prev video + hide/show nav)
  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const viewportHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / viewportHeight);

    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
    }

    // Hide/show nav based on scroll direction
    if (scrollTop > lastScrollY.current && scrollTop > 100) {
      // Scrolling down - hide nav
      setHideNav(true);
    } else if (scrollTop < lastScrollY.current) {
      // Scrolling up - show nav
      setHideNav(false);
    }

    lastScrollY.current = scrollTop;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentVideoIndex, videos.length]);

  // Styles
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100vh',
    overflowY: 'scroll',
    scrollSnapType: 'y mandatory',
    scrollBehavior: 'smooth',
    position: 'relative',
  };

  const videoContainerStyle: CSSProperties = {
    scrollSnapAlign: 'start',
    scrollSnapStop: 'always',
  };

  const headerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    padding: '12px 20px',
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
  };

  const categoryTabStyle = (isSelected: boolean): CSSProperties => ({
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    border: `1px solid ${isSelected ? 'var(--coral-400)' : 'var(--dark-border)'}`,
    backgroundColor: isSelected ? 'var(--coral-400)' : 'transparent',
    color: 'var(--text-primary)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    whiteSpace: 'nowrap',
  });

  const loadingStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'var(--dark-bg)',
    color: 'var(--text-secondary)',
    fontSize: '16px',
  };

  const emptyStateStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: 'var(--dark-bg)',
    color: 'var(--text-secondary)',
    padding: '40px',
    textAlign: 'center',
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get location status badge
  const getLocationBadge = () => {
    if (userLocation) {
      const geohash = generateGeohash(userLocation.lat, userLocation.lng, 4);
      const area = getAreaDescription(geohash);
      return {
        icon: '📍',
        text: area,
        color: 'var(--success, #4CAF50)',
      };
    } else if (locationDenied) {
      return {
        icon: '🌍',
        text: 'Location Off',
        color: 'var(--text-secondary)',
      };
    } else {
      return {
        icon: '⏳',
        text: 'Getting location...',
        color: 'var(--text-secondary)',
      };
    }
  };

  const locationBadge = getLocationBadge();

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div>Loading videos...</div>
      </div>
    );
  }

  return (
    <>
      {/* Header - Simplified */}
      <div style={headerStyle}>
        {/* Browse Location Badge (if browsing) */}
        {isBrowsing && browseLocation && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--coral-400)',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginRight: '8px',
              cursor: 'pointer',
            }}
            onClick={clearBrowseLocation}
            title="Click to return to your location"
          >
            <Icons.Location size={12} />
            <span>{browseLocation.locationName}</span>
            <Icons.Close size={12} />
          </div>
        )}

        {/* Category Tabs */}
        {categories.map((category) => (
          <button
            key={category}
            style={categoryTabStyle(selectedCategory === category)}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}

        {/* Radius Selector Button */}
        {userLocation && !locationDenied && (
          <button
            style={{
              ...categoryTabStyle(false),
              backgroundColor: showRadiusSelector ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
            }}
            onClick={() => setShowRadiusSelector(!showRadiusSelector)}
          >
            <Icons.Location size={16} />
            <span>{radiusMeters / 1000}km</span>
          </button>
        )}

        {/* Radius Dropdown */}
        {showRadiusSelector && userLocation && !locationDenied && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: '20px',
              marginTop: '8px',
              backgroundColor: 'var(--dark-card)',
              border: '1px solid var(--dark-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '8px',
              zIndex: 200,
              minWidth: '120px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {radiusOptions.map((option) => (
              <button
                key={option.value}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  textAlign: 'left',
                  backgroundColor: radiusMeters === option.value ? 'var(--coral-400)' : 'transparent',
                  color: 'var(--text-primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'var(--transition-normal)',
                }}
                onClick={() => {
                  setRadiusMeters(option.value);
                  setShowRadiusSelector(false);
                }}
                onMouseEnter={(e) => {
                  if (radiusMeters !== option.value) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (radiusMeters !== option.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Videos Feed */}
      {videos.length === 0 ? (
        <div style={emptyStateStyle}>
          <Icons.Camera size={48} color="var(--text-secondary)" />
          <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: '600' }}>
            No videos found
          </div>
          <div style={{ marginTop: '8px' }}>
            {isBrowsing && browseLocation
              ? `No videos in ${browseLocation.locationName} for this category`
              : locationDenied
              ? 'Try enabling location access for personalized content'
              : 'Check back later for new content'}
          </div>
          {isBrowsing && browseLocation && (
            <button
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--coral-400)',
                color: 'var(--text-primary)',
                border: 'none',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
              onClick={clearBrowseLocation}
            >
              Return to My Location
            </button>
          )}
        </div>
      ) : (
        <div ref={containerRef} style={containerStyle}>
          {videos.map((item, index) => (
            <div key={item.video.id} style={videoContainerStyle}>
              <VideoCard
                video={item.video}
                distanceMeters={item.distanceMeters}
                onLike={() => console.log('Like video:', item.video.id)}
                onComment={() => console.log('Comment on video:', item.video.id)}
                onShare={() => console.log('Share video:', item.video.id)}
                onViewGallery={() => {
                  if (item.video.imageUrls && item.video.imageUrls.length > 0) {
                    setGalleryImages(item.video.imageUrls);
                  }
                }}
                onMessage={() => navigate(`/chat/${item.video.userId}`)}
                onUserClick={() => navigate(`/profile/${item.video.userId}`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Gallery Modal */}
      {galleryImages && (
        <GalleryModal
          images={galleryImages}
          onClose={() => setGalleryImages(null)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNav hide={hideNav} />
    </>
  );
};

export default FeedPage;
