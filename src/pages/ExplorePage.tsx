/**
 * Explore Map Page
 * Shows videos on a Google Map with markers
 */

import { useState, useEffect, useRef, CSSProperties } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';
import { getVideosNearby, getPopularVideos } from '@/services/firebase/videos';
import type { VideoCategory, VideoWithDistance } from '@/types/video';
import BottomNav from '@/components/navigation/BottomNav';
import { Icons } from '@/theme';
import { generateGeohash } from '@/utils/geohash';
import { getAreaDescription } from '@/utils/locationDebug';

const ExplorePage = () => {
  const { user } = useAuth();
  const { setBrowseLocation } = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<VideoCategory>('RENT');
  const [videos, setVideos] = useState<VideoWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [radiusMeters, setRadiusMeters] = useState(100000);
  const [showRadiusSelector, setShowRadiusSelector] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithDistance | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenterName, setMapCenterName] = useState<string>('');
  const [isSearchingHere, setIsSearchingHere] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);

  const categories: VideoCategory[] = ['RENT', 'BUY', 'SERVICES'];
  const radiusOptions = [
    { label: '1km', value: 1000 },
    { label: '5km', value: 5000 },
    { label: '10km', value: 10000 },
    { label: '25km', value: 25000 },
    { label: '50km', value: 50000 },
    { label: '100km', value: 100000 },
    { label: '500km', value: 500000 },
  ];

  // Request location permission
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          console.log('📍 Location granted for map:', lat, lng);
        },
        (error) => {
          console.log('❌ Location denied:', error.message);
          setLocationDenied(true);
          // Default to Pretoria
          setUserLocation({ lat: -25.7479, lng: 28.2293 });
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
      setUserLocation({ lat: -25.7479, lng: 28.2293 });
    }
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const initMap = () => {
      const mapOptions: google.maps.MapOptions = {
        center: { lat: userLocation.lat, lng: userLocation.lng },
        zoom: radiusMeters <= 5000 ? 13 : radiusMeters <= 10000 ? 12 : radiusMeters <= 50000 ? 11 : radiusMeters <= 100000 ? 10 : 8,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        styles: [
          // Dark mode map style
          { elementType: 'geometry', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#212121' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          {
            featureType: 'administrative.locality',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#263c3f' }],
          },
          {
            featureType: 'poi.park',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#6b9a76' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry',
            stylers: [{ color: '#38414e' }],
          },
          {
            featureType: 'road',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#212a37' }],
          },
          {
            featureType: 'road',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#9ca5b3' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry',
            stylers: [{ color: '#746855' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#1f2835' }],
          },
          {
            featureType: 'road.highway',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#f3d19c' }],
          },
          {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#2f3948' }],
          },
          {
            featureType: 'transit.station',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#d59563' }],
          },
          {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#17263c' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#515c6d' }],
          },
          {
            featureType: 'water',
            elementType: 'labels.text.stroke',
            stylers: [{ color: '#17263c' }],
          },
        ],
      };

      googleMapRef.current = new google.maps.Map(mapRef.current!, mapOptions);

      // Add user location marker (small blue dot)
      new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });

      // Add radius circle (initially at user location, will follow map center)
      circleRef.current = new google.maps.Circle({
        center: { lat: userLocation.lat, lng: userLocation.lng },
        radius: radiusMeters,
        map: googleMapRef.current,
        fillColor: '#EF5350',
        fillOpacity: 0.15,
        strokeColor: '#EF5350',
        strokeOpacity: 0.5,
        strokeWeight: 2,
      });

      // Set initial map center
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });

      // Listen to map drag/idle to update center location
      googleMapRef.current.addListener('idle', () => {
        const center = googleMapRef.current!.getCenter();
        if (center) {
          const newCenter = { lat: center.lat(), lng: center.lng() };
          setMapCenter(newCenter);

          // Update circle position
          circleRef.current?.setCenter(center);

          // Geocode the new center
          geocodeLocation(newCenter.lat, newCenter.lng);
        }
      });
    };

    if (window.google && window.google.maps) {
      initMap();
    } else {
      // Load Google Maps API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      }&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    }
  }, [userLocation, radiusMeters]);

  // Update circle radius when radiusMeters changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radiusMeters);
    }
  }, [radiusMeters]);

  // Geocode location to get name
  const geocodeLocation = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results && result.results.length > 0) {
        const address = result.results[0];
        // Get locality (city) or administrative area
        const locality = address.address_components.find(c => c.types.includes('locality'));
        const sublocality = address.address_components.find(c => c.types.includes('sublocality'));
        const adminArea = address.address_components.find(c => c.types.includes('administrative_area_level_1'));

        const name = locality?.long_name || sublocality?.long_name || adminArea?.long_name || 'Unknown Location';
        setMapCenterName(name);
      } else {
        setMapCenterName('Unknown Location');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setMapCenterName('Unknown Location');
    }
  };

  // Fetch videos based on search location or user location
  useEffect(() => {
    const fetchVideos = async () => {
      // Use search location if searching, otherwise use user location
      const searchLat = isSearchingHere && mapCenter ? mapCenter.lat : userLocation?.lat;
      const searchLng = isSearchingHere && mapCenter ? mapCenter.lng : userLocation?.lng;

      if (!searchLat || !searchLng) return;

      setLoading(true);
      try {
        let results: VideoWithDistance[];

        console.log(`🔍 Fetching videos for map: ${selectedCategory} at (${searchLat}, ${searchLng}) within ${radiusMeters / 1000}km...`);
        results = await getVideosNearby(
          selectedCategory,
          searchLat,
          searchLng,
          radiusMeters,
          100 // Get more videos for map
        );

        // When browsing a location, don't fallback to popular videos
        // Show empty map instead (matches native behavior)
        if (results.length === 0 && !isSearchingHere) {
          results = await getPopularVideos(selectedCategory, 50);
        }

        console.log(`✅ Fetched ${results.length} videos for map`);
        setVideos(results);
      } catch (error) {
        console.error('Error fetching videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [selectedCategory, userLocation, radiusMeters, isSearchingHere, mapCenter]);

  // Handle "Search Here" button
  const handleSearchHere = () => {
    if (mapCenter && mapCenterName) {
      setIsSearchingHere(true);

      // Save browse location to context (affects Feed page!)
      setBrowseLocation({
        lat: mapCenter.lat,
        lng: mapCenter.lng,
        locationName: mapCenterName,
      });

      console.log(`📍 Browse location set to: ${mapCenterName} (${mapCenter.lat}, ${mapCenter.lng})`);
    }
  };

  // Handle "Use My Location" button
  const handleUseMyLocation = () => {
    if (userLocation && googleMapRef.current) {
      setIsSearchingHere(false);
      googleMapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
      setMapCenter({ lat: userLocation.lat, lng: userLocation.lng });

      // Clear browse location from context (return to GPS location in Feed)
      setBrowseLocation(null);

      console.log(`📍 Returned to current GPS location`);
    }
  };

  // Add video markers to map
  useEffect(() => {
    if (!googleMapRef.current || videos.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    videos.forEach((item) => {
      const video = item.video;
      if (!video.latitude || !video.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: video.latitude, lng: video.longitude },
        map: googleMapRef.current!,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#EF5350',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: video.description,
      });

      marker.addListener('click', () => {
        setSelectedVideo(item);
      });

      markersRef.current.push(marker);
    });
  }, [videos]);

  // Styles
  const containerStyle: CSSProperties = {
    width: '100%',
    height: '100vh',
    position: 'relative',
    backgroundColor: 'var(--dark-bg)',
  };

  const headerStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid var(--dark-border)',
  };

  const headerContentStyle: CSSProperties = {
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const logoStyle: CSSProperties = {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--coral-400)',
  };

  const categoryTabsStyle: CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '12px 20px',
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

  const mapContainerStyle: CSSProperties = {
    width: '100%',
    height: 'calc(100vh - 140px)',
    marginTop: '140px',
    position: 'relative',
  };

  const crosshairStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40px',
    height: '40px',
    pointerEvents: 'none',
    zIndex: 10,
  };

  const crosshairInnerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  const crosshairLineVerticalStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '0',
    width: '2px',
    height: '100%',
    backgroundColor: '#EF5350',
    transform: 'translateX(-50%)',
  };

  const crosshairLineHorizontalStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '0',
    height: '2px',
    width: '100%',
    backgroundColor: '#EF5350',
    transform: 'translateY(-50%)',
  };

  const crosshairDotStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: '#EF5350',
    border: '3px solid #ffffff',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  };

  const locationInfoStyle: CSSProperties = {
    position: 'absolute',
    top: '160px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-full)',
    padding: '8px 16px',
    fontSize: '14px',
    color: 'var(--text-primary)',
    fontWeight: '600',
    zIndex: 150,
    boxShadow: 'var(--shadow-lg)',
    maxWidth: '80%',
    textAlign: 'center',
  };

  const actionButtonsStyle: CSSProperties = {
    position: 'absolute',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '12px',
    zIndex: 150,
  };

  const searchButtonStyle: CSSProperties = {
    padding: '12px 24px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--coral-400)',
    color: 'var(--text-primary)',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const myLocationButtonStyle: CSSProperties = {
    padding: '12px 24px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--dark-card)',
    color: 'var(--text-primary)',
    border: '1px solid var(--dark-border)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  };

  const videoCardStyle: CSSProperties = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    right: '20px',
    maxWidth: '400px',
    margin: '0 auto',
    backgroundColor: 'var(--dark-card)',
    border: '1px solid var(--dark-border)',
    borderRadius: 'var(--radius-xl)',
    padding: '16px',
    zIndex: 200,
    boxShadow: 'var(--shadow-xl)',
  };

  // Get location badge
  const getLocationBadge = () => {
    if (userLocation && !locationDenied) {
      const geohash = generateGeohash(userLocation.lat, userLocation.lng, 4);
      const area = getAreaDescription(geohash);
      return { icon: '📍', text: area, color: 'var(--success, #4CAF50)' };
    }
    return { icon: '🌍', text: 'Location Off', color: 'var(--text-secondary)' };
  };

  const locationBadge = getLocationBadge();

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={logoStyle}>Explore Map</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Location Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                fontSize: '12px',
                color: locationBadge.color,
              }}
            >
              <span>{locationBadge.icon}</span>
              <span>{locationBadge.text}</span>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div style={categoryTabsStyle}>
          {categories.map((category) => (
            <button
              key={category}
              style={categoryTabStyle(selectedCategory === category)}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}

          {/* Radius Selector */}
          {userLocation && (
            <button
              style={{
                ...categoryTabStyle(false),
                backgroundColor: showRadiusSelector ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onClick={() => setShowRadiusSelector(!showRadiusSelector)}
            >
              <Icons.Location size={16} />
              <span>{radiusMeters / 1000}km</span>
            </button>
          )}
        </div>

        {/* Radius Dropdown */}
        {showRadiusSelector && (
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
                }}
                onClick={() => {
                  setRadiusMeters(option.value);
                  setShowRadiusSelector(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Google Map with Crosshair */}
      <div style={mapContainerStyle}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Center Crosshair */}
        <div style={crosshairStyle}>
          <div style={crosshairInnerStyle}>
            <div style={crosshairLineVerticalStyle} />
            <div style={crosshairLineHorizontalStyle} />
            <div style={crosshairDotStyle} />
          </div>
        </div>

        {/* Location Name Display */}
        {mapCenterName && (
          <div style={locationInfoStyle}>
            📍 {mapCenterName}
          </div>
        )}

        {/* Action Buttons */}
        <div style={actionButtonsStyle}>
          <button style={searchButtonStyle} onClick={handleSearchHere}>
            <Icons.Location size={18} />
            <span>Search Here</span>
          </button>
          {isSearchingHere && (
            <button style={myLocationButtonStyle} onClick={handleUseMyLocation}>
              <Icons.Location size={18} />
              <span>My Location</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Video Card */}
      {selectedVideo && (
        <div style={videoCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {selectedVideo.video.userName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {selectedVideo.distanceMeters > 0
                  ? `${(selectedVideo.distanceMeters / 1000).toFixed(1)}km away`
                  : selectedVideo.video.locationName}
              </div>
            </div>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
              }}
              onClick={() => setSelectedVideo(null)}
            >
              <Icons.Close size={20} />
            </button>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
            {selectedVideo.video.description}
          </div>
          {selectedVideo.video.price && (
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--coral-400)', marginBottom: '8px' }}>
              R {selectedVideo.video.price.toLocaleString()}
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <span style={{ marginRight: '16px' }}>❤️ {selectedVideo.video.likes}</span>
            <span style={{ marginRight: '16px' }}>💬 {selectedVideo.video.comments}</span>
            <span>👁️ {selectedVideo.video.views}</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div
          style={{
            position: 'fixed',
            top: '140px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--dark-card)',
            padding: '12px 24px',
            borderRadius: 'var(--radius-full)',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            zIndex: 150,
          }}
        >
          Loading videos...
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default ExplorePage;
